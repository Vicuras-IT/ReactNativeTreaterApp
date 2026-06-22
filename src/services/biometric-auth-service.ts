/**
 * Biometric (Face ID / fingerprint) authentication.
 *
 * Ported from the Flutter app's `lib/services/biometric_auth_service.dart`,
 * which used the `local_auth` plugin. Here we use `expo-local-authentication`,
 * the Expo SDK 56 equivalent.
 */
import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricAuthService {
  /**
   * Whether the device exposes biometric hardware that could be used. Mirrors
   * the Dart `canAuthenticate` getter (hardware present OR device supported).
   */
  async canAuthenticate(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  async authenticate(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Bekræft med Face ID eller fingeraftryk for Vicuras.',
      disableDeviceFallback: true,
    });
    return result.success;
  }
}
