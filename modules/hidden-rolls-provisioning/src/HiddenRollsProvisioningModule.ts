import { NativeModule, requireNativeModule } from 'expo';

export type ParsedTray = {
  trayId: string;
  provisioningName: string;
  hostname: string;
  transport: 'ble';
  security: 1;
};

export type BluetoothStatus = {
  supported: boolean;
  enabled: boolean;
  permissionsGranted: boolean;
};

export type TrayDiscoveryResult = {
  provisioningName: string;
  serviceUuid: string;
};

export type TrayConnectionResult = {
  connected: boolean;
};

export type WifiNetwork = {
  ssid: string;
  rssi: number;
  security: number;
};

export type WifiProvisionResult = {
  provisioned: boolean;
};

export type ExistingTrayDiscoveryResult = {
  trayId: string;
  displayName: string;
  provisioningName: string;
  hostname: string;
  port: number;
  serviceVersion: string;
};

export type WifiResetResult = {
  resetting: boolean;
};

declare class HiddenRollsProvisioningModule extends NativeModule {
  parseQr(payload: string): ParsedTray;

  getBluetoothStatus(): BluetoothStatus;

  requestBluetoothPermissions(): Promise<unknown>;

  findExistingTrays(): Promise<
    ExistingTrayDiscoveryResult[]
  >;

  findTray(): Promise<TrayDiscoveryResult>;

  connectTray(): Promise<TrayConnectionResult>;

  scanWifiNetworks(): Promise<WifiNetwork[]>;

  provisionWifi(
    ssid: string,
    password: string
    ): Promise<WifiProvisionResult>;

  resetTrayWifi(): Promise<WifiResetResult>;

}

const HiddenRollsProvisioning =
  requireNativeModule<HiddenRollsProvisioningModule>(
    'HiddenRollsProvisioning'
  );

export default HiddenRollsProvisioning;