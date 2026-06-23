import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api';
import { DesignBackground, Icon, PinkButton, Txt } from '@/components/ui';
import { useAuth } from '@/state/auth-context';
import { Alpha, Colors, Radius } from '@/theme';

export function LoginScreen() {
  const {
    signIn,
    resumeSavedSession,
    loginMessage,
    hasSavedSession,
    biometricsEnabled,
  } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(loginMessage ?? null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && enrolled);
    })();
  }, []);

  const onSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Udfyld både e-mail og adgangskode.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setError('Forkert e-mail eller adgangskode.');
      } else {
        setError(
          err instanceof Error ? err.message : 'Login mislykkedes. Prøv igen.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log ind med Face ID / fingeraftryk',
      cancelLabel: 'Annuller',
    });
    if (result.success) {
      const ok = await resumeSavedSession();
      if (!ok) setError('Ingen gemt session. Log ind med adgangskode.');
    }
  };

  const showBiometric = hasSavedSession && biometricsEnabled && biometricAvailable;

  return (
    <DesignBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Icon name="medical_services" size={38} color={Colors.pink} />
            </View>
            <Txt font="displayExtrabold" size={28} color={Colors.text}>
              Vicuras
            </Txt>
            <Txt
              font="bold"
              size={11}
              color={Colors.muted}
              tracking={2.4}
              uppercase
              style={styles.tagline}>
              Behandler-app
            </Txt>
          </View>

          <View style={styles.card}>
            <Txt font="displayBold" size={20} color={Colors.text}>
              Log ind
            </Txt>
            <Txt font="regular" size={13} color={Colors.muted} style={styles.sub}>
              Velkommen tilbage. Log ind for at se dine vagter.
            </Txt>

            <Field label="E-mail">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="dit.navn@vicuras.dk"
                placeholderTextColor={Colors.faint}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
              />
            </Field>

            <Field label="Adgangskode">
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.faint}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.passwordInput]}
                  onSubmitEditing={onSubmit}
                />
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={10}
                  style={styles.eye}>
                  <Icon
                    name={showPassword ? 'visibility_off' : 'visibility'}
                    size={20}
                    color={Colors.muted}
                  />
                </Pressable>
              </View>
            </Field>

            {error ? (
              <View style={styles.errorBox}>
                <Icon name="error" size={16} color={Colors.danger} />
                <Txt font="medium" size={12.5} color={Colors.danger} style={styles.errorText}>
                  {error}
                </Txt>
              </View>
            ) : null}

            {submitting ? (
              <View style={styles.submitting}>
                <ActivityIndicator color={Colors.onPink} />
              </View>
            ) : (
              <PinkButton label="Log ind" expand onPress={onSubmit} />
            )}

            {showBiometric ? (
              <Pressable style={styles.biometric} onPress={onBiometric}>
                <Icon name="fingerprint" size={20} color={Colors.text} />
                <Txt font="bold" size={13} color={Colors.text}>
                  Face ID / fingeraftryk
                </Txt>
              </Pressable>
            ) : null}
          </View>

          <Txt
            font="medium"
            size={11}
            color={Colors.faint}
            align="center"
            tracking={1}
            style={styles.footer}>
            PORTAL V2.4.1 • VICURAS A/S
          </Txt>
        </ScrollView>
      </KeyboardAvoidingView>
    </DesignBackground>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Txt font="bold" size={10} color={Colors.muted} tracking={0.6} uppercase>
        {label}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
  },
  logoWrap: { alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Alpha.pinkTint,
    borderWidth: 1,
    borderColor: Alpha.pinkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tagline: { marginTop: 2 },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: 'rgba(12,17,56,0.72)',
    borderWidth: 1,
    borderColor: Alpha.hairline,
    gap: 16,
  },
  sub: { marginTop: -6, marginBottom: 2 },
  field: { gap: 7 },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(160,172,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: Colors.text,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 44 },
  eye: { position: 'absolute', right: 12 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Alpha.dangerTint,
    borderColor: Alpha.dangerBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { flexShrink: 1 },
  submitting: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  biometric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
  },
  footer: { marginTop: 4 },
});
