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

declare class HiddenRollsProvisioningModule extends NativeModule {
  parseQr(payload: string): ParsedTray;

  getBluetoothStatus(): BluetoothStatus;

  requestBluetoothPermissions(): Promise<unknown>;

  findTray(): Promise<TrayDiscoveryResult>;
}

const HiddenRollsProvisioning =
  requireNativeModule<HiddenRollsProvisioningModule>(
    'HiddenRollsProvisioning'
  );

export default HiddenRollsProvisioning;