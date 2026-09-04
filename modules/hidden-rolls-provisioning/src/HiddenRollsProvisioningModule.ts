import { NativeModule, requireNativeModule } from 'expo';

/** Data returned after a tray QR payload is validated. */
export type ParsedTray = {
  trayId: string;
  provisioningName: string;
  hostname: string;
  transport: 'ble';
  security: 1;
};

/** Current Android Bluetooth capability and permission state. */
export type BluetoothStatus = {
  supported: boolean;
  enabled: boolean;
  permissionsGranted: boolean;
};

/** BLE advertisement details for the tray selected by the QR code. */
export type TrayDiscoveryResult = {
  provisioningName: string;
  serviceUuid: string;
};

/** Result returned after the native BLE connection succeeds. */
export type TrayConnectionResult = {
  connected: boolean;
};

/** Wi-Fi network reported by the tray during its scan. */
export type WifiNetwork = {
  ssid: string;
  rssi: number;
  security: number;
};

/** Result returned after the tray accepts new Wi-Fi credentials. */
export type WifiProvisionResult = {
  provisioned: boolean;
};

/** Existing tray discovered through Android network service discovery. */
export type ExistingTrayDiscoveryResult = {
  trayId: string;
  displayName: string;
  provisioningName: string;
  hostname: string;
  port: number;
  serviceVersion: string;
};

/** Result returned when a tray accepts a Wi-Fi reset request. */
export type WifiResetResult = {
  resetting: boolean;
};

declare class HiddenRollsProvisioningModule extends NativeModule {
  /** Validate QR data and retain its proof of possession natively. */
  parseQr(payload: string): ParsedTray;

  getBluetoothStatus(): BluetoothStatus;

  requestBluetoothPermissions(): Promise<unknown>;

  /** Discover already-provisioned trays on the local network. */
  findExistingTrays(): Promise<
    ExistingTrayDiscoveryResult[]
  >;

  /** Find the QR-selected tray over BLE. */
  findTray(): Promise<TrayDiscoveryResult>;

  /** Establish the secure BLE provisioning connection. */
  connectTray(): Promise<TrayConnectionResult>;

  /** Scan for Wi-Fi networks visible to the connected tray. */
  scanWifiNetworks(): Promise<WifiNetwork[]>;

  /** Send selected Wi-Fi credentials to the connected tray. */
  provisionWifi(
    ssid: string,
    password: string
    ): Promise<WifiProvisionResult>;

  /** Clear saved Wi-Fi for the QR-selected tray. */
  resetTrayWifi(): Promise<WifiResetResult>;

}

const HiddenRollsProvisioning =
  requireNativeModule<HiddenRollsProvisioningModule>(
    'HiddenRollsProvisioning'
  );

export default HiddenRollsProvisioning;