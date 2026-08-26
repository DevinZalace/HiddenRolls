import { NativeModule, requireNativeModule } from 'expo';

export type ParsedTray = {
  trayId: string;
  provisioningName: string;
  hostname: string;
  transport: 'ble';
  security: 1;
};

declare class HiddenRollsProvisioningModule extends NativeModule {
  parseQr(payload: string): ParsedTray;
  getBluetoothStatus(): BluetoothStatus;
  requestBluetoothPermissions(): Promise<unknown>;
}

export default requireNativeModule<HiddenRollsProvisioningModule>(
  'HiddenRollsProvisioning'
);

export type BluetoothStatus = {
  supported: boolean;
  enabled: boolean;
  permissionsGranted: boolean;
};