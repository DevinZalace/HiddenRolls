import { NativeModule, requireNativeModule } from 'expo';

declare class HiddenRollsProvisioningModule extends NativeModule {
  getPlatformStatus(): string;
}

export default requireNativeModule<HiddenRollsProvisioningModule>(
  'HiddenRollsProvisioning'
);