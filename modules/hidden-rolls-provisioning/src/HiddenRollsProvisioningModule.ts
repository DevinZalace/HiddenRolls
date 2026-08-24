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
}

export default requireNativeModule<HiddenRollsProvisioningModule>(
  'HiddenRollsProvisioning'
);