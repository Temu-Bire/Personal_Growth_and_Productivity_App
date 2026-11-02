import * as LocalAuthentication from 'expo-local-authentication';

export class AppLockService {
  static async hasHardwareSupport(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && isEnrolled;
    } catch {
      return false;
    }
  }

  static async authenticateBiometrics(promptMessage = 'Unlock GrowPro'): Promise<boolean> {
    try {
      const hasSupport = await this.hasHardwareSupport();
      if (!hasSupport) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Use PIN',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true,
      });

      return result.success;
    } catch {
      return false;
    }
  }
}
