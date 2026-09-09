import Foundation
import CoreBluetooth
import Network
import ExpoModulesCore
import ESPProvision

// Error types for handling invalid QR code data.
private enum HiddenRollsQrError: LocalizedError {
    case invalid(String)

    var errorDescription: String? {
        switch self {
        case .invalid(let message):
            return message
        }
    }
}

// Coordinates the state of the Bluetooth adapter.
private final class BluetoothStateCoordinator:
    NSObject,
    CBCentralManagerDelegate
{
    private var manager: CBCentralManager!

    private var readinessContinuations: [CheckedContinuation<Void, Never>] = []

    override init() {
        super.init()

        manager = CBCentralManager(
            delegate: self,
            queue: .main
        )
    }

    func status() -> [String: Bool] {
        let state = manager.state
        let authorization = CBManager.authorization

        return [
            "supported": state != .unsupported,
            "enabled": state == .poweredOn,
            "permissionsGranted": authorization == .allowedAlways
        ]
    }

    func waitUntilReady() async {
        if manager.state != .unknown {
            return
        }

        await withCheckedContinuation { continuation in
            DispatchQueue.main.async {
                if self.manager.state != .unknown {
                    continuation.resume()
                    return
                }

                self.readinessContinuations.append(continuation)
            }
        }
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        guard central.state != .unknown else {
            return
        }

        let continuations = readinessContinuations
        readinessContinuations.removeAll()

        continuations.forEach {
            $0.resume()
        }
    }
}

// Main module for handling Hidden Rolls provisioning logic.
public class HiddenRollsProvisioningModule: Module {
    private var currentProofOfPossession: String?
    private var currentTrayId: String?
    private var currentTrayHostname: String?
    private var currentProvisioningName: String?
    private var espDevice: ESPDevice?
    private var connectionPromise: Promise?
    private var connectionTimeoutWorkItem: DispatchWorkItem?
    private var connectionAttemptId = 0
    private var discoveryPromise: Promise?
    private var discoveryAttemptId = 0
    private var wifiOperationPromise: Promise?
    private var wifiOperationTimeoutWorkItem: DispatchWorkItem?
    private var wifiOperationAttemptId = 0
    private var networkDiscoveryPromise: Promise?
    private var networkDiscoveryBrowser: NWBrowser?
    private var networkDiscoveryTimeoutWorkItem: DispatchWorkItem?
    private var networkDiscoveryAttemptId = 0
    private var networkDiscoveryResults = Set<NWBrowser.Result>()
    private lazy var bluetoothCoordinator = BluetoothStateCoordinator()

    private func clearDiscoveryAttempt() {
        discoveryPromise = nil
    }

    private func clearNetworkDiscoveryAttempt() {
        networkDiscoveryTimeoutWorkItem?.cancel()
        networkDiscoveryTimeoutWorkItem = nil

        networkDiscoveryBrowser?.stateUpdateHandler = nil
        networkDiscoveryBrowser?.browseResultsChangedHandler = nil
        networkDiscoveryBrowser = nil

        networkDiscoveryPromise = nil
        networkDiscoveryResults.removeAll()
    }

    private func clearConnectionAttempt() {
        connectionTimeoutWorkItem?.cancel()
        connectionTimeoutWorkItem = nil
        connectionPromise = nil
    }

    private func clearWifiOperation() {
        wifiOperationTimeoutWorkItem?.cancel()
        wifiOperationTimeoutWorkItem = nil
        wifiOperationPromise = nil
    }

    public func definition() -> ModuleDefinition {
        Name("HiddenRollsProvisioning")

        // Validate and parse a Hidden Rolls QR payload.
        Function("parseQr") { (payload: String) throws -> [String: Any] in
            // Clear any previously selected tray before parsing a new QR.
            self.currentProofOfPossession = nil
            self.currentTrayId = nil
            self.currentTrayHostname = nil
            self.currentProvisioningName = nil
            self.espDevice = nil

            guard let data = payload.data(using: .utf8) else {
                throw HiddenRollsQrError.invalid(
                    "Hidden Rolls could not read the provisioning QR code."
                )
            }

            let object = try JSONSerialization.jsonObject(with: data)

            guard let qrData = object as? [String: Any] else {
                throw HiddenRollsQrError.invalid(
                    "Hidden Rolls provisioning QR data is invalid."
                )
            }

            let version = qrData["ver"] as? String ?? ""
            let provisioningName = qrData["name"] as? String ?? ""
            let proofOfPossession = qrData["pop"] as? String ?? ""
            let transport = qrData["transport"] as? String ?? ""
            let security = (qrData["security"] as? NSNumber)?.intValue ?? -1

            guard version == "v1" else {
                throw HiddenRollsQrError.invalid(
                    "Unsupported provisioning QR version."
                )
            }

            guard provisioningName.hasPrefix("PROV_HR_") else {
                throw HiddenRollsQrError.invalid(
                    "QR code is not for a Hidden Rolls tray."
                )
            }

            guard !proofOfPossession.isEmpty else {
                throw HiddenRollsQrError.invalid(
                    "Provisioning QR is missing proof of possession."
                )
            }

            guard transport.lowercased() == "ble" else {
                throw HiddenRollsQrError.invalid(
                    "Hidden Rolls requires BLE provisioning."
                )
            }

            guard security == 1 else {
                throw HiddenRollsQrError.invalid(
                    "Hidden Rolls requires Security 1 provisioning."
                )
            }

            let trayId = String(provisioningName.dropFirst("PROV_HR_".count))
            let hostname = "hiddenrolls-\(trayId.lowercased()).local"

            // Keep the secret only in native memory.
            self.currentProofOfPossession = proofOfPossession
            self.currentTrayId = trayId
            self.currentTrayHostname = hostname
            self.currentProvisioningName = provisioningName

            return [
                "trayId": trayId,
                "provisioningName": provisioningName,
                "hostname": hostname,
                "transport": "ble",
                "security": 1
            ]
        }

        // Report Bluetooth capability and readiness.
        Function("getBluetoothStatus") {
            () -> [String: Bool] in
            return self.bluetoothCoordinator.status()
        }

        // Request Bluetooth permissions.
        AsyncFunction("requestBluetoothPermissions") {
            () async -> Void in
            await self.bluetoothCoordinator.waitUntilReady()
        }

        // Discover already-configured trays on the local network.
        AsyncFunction("findExistingTrays") {
            (promise: Promise) in

            guard self.networkDiscoveryPromise == nil else {
                promise.reject(
                    "ERR_NSD_DISCOVERY_IN_PROGRESS",
                    "Existing tray discovery is already in progress."
                )

                return
            }

            self.networkDiscoveryAttemptId += 1
            let attemptId = self.networkDiscoveryAttemptId

            self.networkDiscoveryPromise = promise
            self.networkDiscoveryResults.removeAll()

            let browser = NWBrowser(
                for: .bonjourWithTXTRecord(
                    type: "_hiddenrolls._tcp",
                    domain: nil
                ),
                using: .tcp
            )

            self.networkDiscoveryBrowser = browser

            browser.browseResultsChangedHandler = { [weak self] results, _ in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.networkDiscoveryAttemptId == attemptId,
                        self.networkDiscoveryPromise != nil
                    else {
                        return
                    }

                    self.networkDiscoveryResults = results
                }
            }

            browser.stateUpdateHandler = { [weak self] state in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.networkDiscoveryAttemptId == attemptId,
                        let activePromise = self.networkDiscoveryPromise
                    else {
                        return
                    }

                    if case .failed(let error) = state {
                        // Invalidate before cancelling because cancellation
                        // can produce another browser state callback.
                        self.networkDiscoveryAttemptId += 1

                        browser.cancel()
                        self.clearNetworkDiscoveryAttempt()

                        activePromise.reject(
                            "ERR_NSD_DISCOVERY",
                            "Hidden Rolls tray discovery could not be started."
                        )
                    }
                }
            }

            let timeout = DispatchWorkItem { [weak self] in
                guard let self else {
                    return
                }

                guard
                    self.networkDiscoveryAttemptId == attemptId,
                    let activePromise = self.networkDiscoveryPromise
                else {
                    return
                }

                let results = self.networkDiscoveryResults

                // Invalidate before cancelling so late browser
                // callbacks cannot touch this completed operation.
                self.networkDiscoveryAttemptId += 1

                browser.cancel()
                self.clearNetworkDiscoveryAttempt()

                var traysById: [String: [String: Any]] = [:]

                for result in results {
                    guard case let .service(serviceName, _, _, _) = result.endpoint else {
                        continue
                    }

                    guard case let .bonjour(txtRecord) = result.metadata else {
                        continue
                    }

                    let metadata = txtRecord.dictionary

                    guard let rawTrayId = metadata["id"] else {
                        continue
                    }

                    let trayId = rawTrayId.trimmingCharacters(in: .whitespacesAndNewlines)

                    guard !trayId.isEmpty else {
                        continue
                    }

                    let serviceVersion =
                        (metadata["ver"] ?? "")
                        .trimmingCharacters(in: .whitespacesAndNewlines)

                    traysById[trayId] = [
                        "trayId": trayId,
                        "displayName": serviceName,
                        "provisioningName": "PROV_HR_\(trayId)",
                        "hostname": "hiddenrolls-\(trayId.lowercased()).local",
                        "port": 80,
                        "serviceVersion": serviceVersion
                    ]
                }

                let trays = Array(traysById.values)
                    .sorted {
                        let left = $0["trayId"] as? String ?? ""
                        let right = $1["trayId"] as? String ?? ""
                        return left < right
                    }

                activePromise.resolve(trays)
            }

            self.networkDiscoveryTimeoutWorkItem = timeout

            DispatchQueue.main.asyncAfter(
                deadline: .now() + 5,
                execute: timeout
            )

            browser.start(queue: .main)
        }
        .runOnQueue(.main)

        // Find the QR-selected tray over BLE.
        AsyncFunction("findTray") {
            (promise: Promise) in

            guard self.discoveryPromise == nil else {
                promise.reject(
                    "ERR_BLE_SCAN_IN_PROGRESS",
                    "A tray discovery is already in progress."
                )

                return
            }

            guard let expectedName = self.currentProvisioningName,
                !expectedName.isEmpty
            else {
                promise.reject(
                    "ERR_NO_TRAY",
                    "Scan a Hidden Rolls QR code before searching for the tray."
                )

                return
            }

            self.discoveryAttemptId += 1
            let attemptId = self.discoveryAttemptId
            self.discoveryPromise = promise

            ESPProvisionManager.shared.searchESPDevices(
                devicePrefix: expectedName,
                transport: .ble,
                security: .secure
            ) { [weak self] deviceList, error in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.discoveryAttemptId == attemptId,
                        let activePromise = self.discoveryPromise
                    else {
                        return
                    }

                    if let error {
                        self.clearDiscoveryAttempt()

                        activePromise.reject(
                            "ERR_BLE_SCAN",
                            "Bluetooth scanning failed."
                        )

                        return
                    }

                    guard let device = deviceList?.first(where: { $0.name == expectedName }) else {
                        self.clearDiscoveryAttempt()

                        activePromise.reject(
                            "ERR_TRAY_NOT_FOUND",
                            "\(expectedName) was not found over Bluetooth."
                        )

                        return
                    }

                    guard
                      let serviceUuids = device.advertisementData?[
                          CBAdvertisementDataServiceUUIDsKey
                      ] as? [CBUUID],
                      let advertisedUuid = serviceUuids.first
                  else {
                      self.clearDiscoveryAttempt()
                      activePromise.reject(
                          "ERR_SERVICE_UUID_MISSING",
                          "The tray did not advertise a provisioning service UUID."
                      )
                      return
                  }

                  self.espDevice = device
                  let serviceUuid = advertisedUuid.uuidString

                    self.clearDiscoveryAttempt()

                    activePromise.resolve([
                        "provisioningName": expectedName,
                        "serviceUuid": serviceUuid
                    ])
                }
            }
        }
        .runOnQueue(.main)

        // Cancel BLE discovery.
        AsyncFunction("cancelTrayDiscovery") {
            () -> Bool in

            guard let promise = self.discoveryPromise else {
                return false
            }

            // Invalidate first because stopping Espressif's search
            // can itself trigger its completion callback.
            self.discoveryAttemptId += 1
            self.clearDiscoveryAttempt()

            ESPProvisionManager.shared.stopESPDevicesSearch()

            promise.reject(
                "ERR_SETUP_CANCELLED",
                "Tray discovery was cancelled."
            )

            return true
        }
        .runOnQueue(.main)

        // Connect to the discovered tray.
        AsyncFunction("connectTray") {
            (promise: Promise) in

            guard let device = self.espDevice else {
                promise.reject(
                    "ERR_NO_TRAY",
                    "Find a Hidden Rolls tray before connecting."
                )

                return
            }

            guard self.currentProofOfPossession != nil else {
                promise.reject(
                    "ERR_NO_PROOF_OF_POSSESSION",
                    "The selected tray is missing proof of possession."
                )

                return
            }

            guard self.connectionPromise == nil else {
                promise.reject(
                    "ERR_CONNECTION_IN_PROGRESS",
                    "A tray connection is already in progress."
                )

                return
            }

            self.connectionAttemptId += 1
            let attemptId = self.connectionAttemptId

            self.connectionPromise = promise

            let timeout = DispatchWorkItem {
                guard
                    self.connectionAttemptId == attemptId,
                    let activePromise = self.connectionPromise
                else {
                    return
                }

                // Invalidate this attempt before disconnecting because
                // disconnecting may itself trigger another SDK callback.
                self.connectionAttemptId += 1
                self.clearConnectionAttempt()

                device.disconnect()

                activePromise.reject(
                    "ERR_BLE_CONNECTION_TIMEOUT",
                    "Bluetooth connection to the tray timed out."
                )
            }

            self.connectionTimeoutWorkItem = timeout

            DispatchQueue.main.asyncAfter(
                deadline: .now() + 15,
                execute: timeout
            )

            device.connect(delegate: self) { [weak self] status in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.connectionAttemptId == attemptId,
                        let activePromise = self.connectionPromise
                    else {
                        return
                    }

                    switch status {
                    case .connected:
                        self.clearConnectionAttempt()
                        activePromise.resolve(["connected": true])

                    case .failedToConnect:
                        self.clearConnectionAttempt()
                        activePromise.reject(
                            "ERR_BLE_CONNECTION_FAILED",
                            "Hidden Rolls could not connect to the tray over Bluetooth."
                        )

                    case .disconnected:
                        self.clearConnectionAttempt()
                        activePromise.reject(
                            "ERR_BLE_DISCONNECTED",
                            "The tray disconnected before setup could begin."
                        )
                    }
                }
            }
        }
        .runOnQueue(.main)

        // Cancel a pending BLE connection.
        AsyncFunction("cancelTrayConnection") {
            () -> Bool in

            guard let promise = self.connectionPromise else {
                return false
            }

            // Invalidate first so any disconnect callback is ignored.
            self.connectionAttemptId += 1
            self.clearConnectionAttempt()

            self.espDevice?.disconnect()

            promise.reject(
                "ERR_SETUP_CANCELLED",
                "Tray connection was cancelled."
            )

            return true
        }
        .runOnQueue(.main)

        // Scan Wi-Fi networks visible to the tray.
        AsyncFunction("scanWifiNetworks") {
            (promise: Promise) in

            guard let device = self.espDevice else {
                promise.reject(
                    "ERR_NO_TRAY",
                    "Connect to a Hidden Rolls tray before scanning Wi-Fi networks."
                )

                return
            }

            guard self.wifiOperationPromise == nil else {
                promise.reject(
                    "ERR_WIFI_OPERATION_IN_PROGRESS",
                    "A Wi-Fi operation is already in progress."
                )

                return
            }

            self.wifiOperationAttemptId += 1
            let attemptId = self.wifiOperationAttemptId

            self.wifiOperationPromise = promise

            let timeout = DispatchWorkItem {
                guard
                    self.wifiOperationAttemptId == attemptId,
                    let activePromise = self.wifiOperationPromise
                else {
                    return
                }

                // Invalidate before disconnecting so any late SDK
                // callback cannot complete this operation.
                self.wifiOperationAttemptId += 1
                self.clearWifiOperation()

                device.disconnect()

                activePromise.reject(
                    "ERR_WIFI_SCAN_TIMEOUT",
                    "The tray took too long to scan for Wi-Fi networks."
                )
            }

            self.wifiOperationTimeoutWorkItem = timeout

            DispatchQueue.main.asyncAfter(
                deadline: .now() + 30,
                execute: timeout
            )

            device.scanWifiList { [weak self] wifiList, error in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.wifiOperationAttemptId == attemptId,
                        let activePromise = self.wifiOperationPromise
                    else {
                        return
                    }

                    guard let wifiList else {
                        self.clearWifiOperation()

                        activePromise.reject(
                            "ERR_WIFI_SCAN",
                            "Hidden Rolls could not scan for nearby Wi-Fi networks."
                        )

                        return
                    }

                    var strongestBySsid: [String: ESPWifiNetwork] = [:]

                    for network in wifiList {
                        let ssid = network.ssid

                        guard !ssid.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                            continue
                        }

                        if let existing = strongestBySsid[ssid] {
                            if network.rssi > existing.rssi {
                                strongestBySsid[ssid] = network
                            }
                        } else {
                            strongestBySsid[ssid] = network
                        }
                    }

                    let networks = strongestBySsid
                        .map { ssid, network in
                            [
                                "ssid": ssid,
                                "rssi": Int(network.rssi),
                                "security": network.auth.rawValue
                            ] as [String: Any]
                        }
                        .sorted {
                            ($0["rssi"] as? Int ?? Int.min) > ($1["rssi"] as? Int ?? Int.min)
                        }

                    self.clearWifiOperation()
                    activePromise.resolve(networks)
                }
            }
        }
        .runOnQueue(.main)

        // Cancel Wi-Fi scanning or provisioning.
        AsyncFunction("cancelTrayWifiOperation") {
            () -> Bool in

            guard let promise = self.wifiOperationPromise else {
                return false
            }

            self.wifiOperationAttemptId += 1
            self.clearWifiOperation()

            self.espDevice?.disconnect()

            promise.reject(
                "ERR_SETUP_CANCELLED",
                "Wi-Fi operation was cancelled."
            )

            return true
        }
        .runOnQueue(.main)

        // Stop all active setup work.
        AsyncFunction("cancelTraySetup") {
            (promise: Promise) in

            // Capture pending promises before clearing their operation state.
            let discoveryPromise = self.discoveryPromise
            let connectionPromise = self.connectionPromise
            let wifiPromise = self.wifiOperationPromise
            let networkDiscoveryPromise = self.networkDiscoveryPromise
            let networkDiscoveryBrowser = self.networkDiscoveryBrowser

            // Invalidate every active attempt first.
            //
            // Stopping BLE work can trigger SDK callbacks, so those callbacks
            // must already be considered stale before teardown begins.
            self.discoveryAttemptId += 1
            self.connectionAttemptId += 1
            self.wifiOperationAttemptId += 1
            self.networkDiscoveryAttemptId += 1

            // Clear timers and operation ownership.
            self.clearDiscoveryAttempt()
            self.clearConnectionAttempt()
            self.clearWifiOperation()
            self.clearNetworkDiscoveryAttempt()

            // Stop local-network discovery.
            networkDiscoveryBrowser?.cancel()

            // Stop BLE discovery if it was active.
            if discoveryPromise != nil {
                ESPProvisionManager.shared.stopESPDevicesSearch()
            }

            // Disconnect any retained provisioning device.
            self.espDevice?.disconnect()

            // Settle any operations that were interrupted.
            discoveryPromise?.reject(
                "ERR_SETUP_CANCELLED",
                "Tray discovery was cancelled."
            )

            connectionPromise?.reject(
                "ERR_SETUP_CANCELLED",
                "Tray connection was cancelled."
            )

            wifiPromise?.reject(
                "ERR_SETUP_CANCELLED",
                "Wi-Fi operation was cancelled."
            )

            networkDiscoveryPromise?.reject(
                "ERR_SETUP_CANCELLED",
                "Existing tray discovery was cancelled."
            )

            // Finally discard the selected tray and its native-only secret.
            self.espDevice = nil
            self.currentProofOfPossession = nil
            self.currentTrayId = nil
            self.currentTrayHostname = nil
            self.currentProvisioningName = nil

            promise.resolve(nil)
        }
        .runOnQueue(.main)

        // Provision the tray with Wi-Fi credentials.
        AsyncFunction("provisionWifi") {
            (ssid: String, password: String, promise: Promise) in

            guard let device = self.espDevice else {
                promise.reject(
                    "ERR_NO_TRAY",
                    "Connect to a Hidden Rolls tray before provisioning Wi-Fi."
                )

                return
            }

            guard !ssid.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                promise.reject(
                    "ERR_INVALID_SSID",
                    "A Wi-Fi network name is required."
                )

                return
            }

            guard self.wifiOperationPromise == nil else {
                promise.reject(
                    "ERR_WIFI_OPERATION_IN_PROGRESS",
                    "A Wi-Fi operation is already in progress."
                )

                return
            }

            self.wifiOperationAttemptId += 1
            let attemptId = self.wifiOperationAttemptId
            self.wifiOperationPromise = promise

            let timeout = DispatchWorkItem {
                guard
                    self.wifiOperationAttemptId == attemptId,
                    let activePromise = self.wifiOperationPromise
                else {
                    return
                }

                // Invalidate before disconnecting so a late SDK callback
                // cannot settle this operation a second time.
                self.wifiOperationAttemptId += 1
                self.clearWifiOperation()

                device.disconnect()

                activePromise.reject(
                    "ERR_PROVISION_TIMEOUT",
                    "Wi-Fi provisioning timed out."
                )
            }

            self.wifiOperationTimeoutWorkItem = timeout

            DispatchQueue.main.asyncAfter(
                deadline: .now() + 60,
                execute: timeout
            )

            device.provision(ssid: ssid, passPhrase: password) { [weak self] status in
                DispatchQueue.main.async {
                    guard let self else {
                        return
                    }

                    guard
                        self.wifiOperationAttemptId == attemptId,
                        let activePromise = self.wifiOperationPromise
                    else {
                        return
                    }

                    switch status {
                    case .configApplied:
                        // Credentials were accepted, but the ESP32 has not
                        // confirmed its Wi-Fi connection yet.
                        return

                    case .success:
                        self.clearWifiOperation()
                        activePromise.resolve(["provisioned": true])

                    case .failure(let error):
                        self.clearWifiOperation()
                        print("Hidden Rolls iOS provisioning failed: \(error)")
                        activePromise.reject(
                            "ERR_PROVISION_FAILED",
                            "The tray could not connect to the selected Wi-Fi network."
                        )
                    }
                }
            }
        }
        .runOnQueue(.main)

        // Reset saved Wi-Fi on the QR-selected tray.
        AsyncFunction("resetTrayWifi") {
            (promise: Promise) in

            guard
                let hostname = self.currentTrayHostname,
                !hostname.isEmpty,
                let proofOfPossession = self.currentProofOfPossession,
                !proofOfPossession.isEmpty
            else {
                promise.reject(
                    "ERR_NO_SELECTED_TRAY",
                    "Scan a Hidden Rolls tray before resetting Wi-Fi."
                )

                return
            }

            guard let url = URL(string: "http://\(hostname)/reset-wifi") else {
                promise.reject(
                    "ERR_WIFI_RESET",
                    "Hidden Rolls could not create the tray Wi-Fi reset request."
                )

                return
            }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.timeoutInterval = 3
            request.setValue(proofOfPossession, forHTTPHeaderField: "X-Hidden-Rolls-PoP")

            let task = URLSession.shared.dataTask(with: request) {
                data,
                response,
                error in

                DispatchQueue.main.async {
                    if let error {
                        promise.reject(
                            "ERR_WIFI_RESET",
                            "Hidden Rolls could not reset the tray Wi-Fi configuration."
                        )

                        return
                    }

                    guard let httpResponse = response as? HTTPURLResponse else {
                        promise.reject(
                            "ERR_WIFI_RESET",
                            "Hidden Rolls received an invalid response from the tray."
                        )

                        return
                    }

                    guard httpResponse.statusCode == 202 else {
                        promise.reject(
                            "ERR_WIFI_RESET_REJECTED",
                            "The tray rejected the Wi-Fi reset request."
                        )

                        return
                    }

                    promise.resolve(["resetting": true])
                }
            }

            task.resume()
        }
        .runOnQueue(.main)
    }
}

extension HiddenRollsProvisioningModule: ESPDeviceConnectionDelegate {
    public func getProofOfPossesion(
        forDevice: ESPDevice,
        completionHandler: @escaping (String) -> Void
    ) {
        completionHandler(currentProofOfPossession ?? "")
    }

    public func getUsername(
        forDevice: ESPDevice,
        completionHandler: @escaping (String?) -> Void
    ) {
        // Hidden Rolls currently uses Security 1,
        // which does not require a username.
        completionHandler(nil)
    }
}