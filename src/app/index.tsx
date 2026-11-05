import { signInWithPhoneNumber } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  clearRecaptchaVerifier,
  getFirebaseAuth,
  getRecaptchaVerifier,
  type ConfirmationResult,
} from '@/lib/firebase';

function getErrorMessage(error: unknown) {
  const firebaseCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : '';

  if (firebaseCode === 'auth/configuration-not-found') {
    return 'Phone sign-in is not enabled in Firebase. Enable the Phone provider in Firebase Console > Authentication > Sign-in method, then restart the Expo web server.';
  }

  if (firebaseCode === 'auth/operation-not-allowed') {
    return 'Phone sign-in is disabled for this Firebase project. Enable the Phone provider in Firebase Console > Authentication > Sign-in method.';
  }

  if (firebaseCode === 'auth/unauthorized-domain') {
    return 'This website is not authorized in Firebase. Add localhost (or your deployed domain) under Authentication > Settings > Authorized domains.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function Index() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const requestOtp = async () => {
    const normalizedPhoneNumber = phoneNumber.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
      setErrorMessage('Enter a valid phone number in international format, for example +923001234567.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      const verifier = getRecaptchaVerifier(auth);
      const result = await signInWithPhoneNumber(auth, normalizedPhoneNumber, verifier);
      setConfirmation(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = verificationCode.trim();

    if (!confirmation) {
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage('Enter the six-digit code sent to your phone.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await confirmation.confirm(code);
      setIsVerified(true);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(
        message.toLowerCase().includes('invalid')
          ? 'That code is not valid. Check the SMS and try again.'
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startOver = () => {
    clearRecaptchaVerifier();
    setConfirmation(null);
    setVerificationCode('');
    setIsVerified(false);
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>✓</Text>
          </View>
          <Text style={styles.eyebrow}>SECURE SIGN IN</Text>
          <Text style={styles.title}>{isVerified ? 'Phone verified' : 'Verify your phone'}</Text>
          <Text style={styles.subtitle}>
            {isVerified
              ? 'Your number has been verified successfully.'
              : confirmation
                ? `We sent a 6-digit code to ${phoneNumber.trim()}`
                : 'We will send you a one-time code by SMS to confirm your number.'}
          </Text>

          {isVerified ? (
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Verification complete</Text>
              <Text style={styles.successText}>You can now continue with your account.</Text>
              <ActionButton label="Verify another number" onPress={startOver} secondary />
            </View>
          ) : (
            <View style={styles.card}>
              {confirmation ? (
                <>
                  <Text style={styles.label}>Verification code</Text>
                  <TextInput
                    autoFocus
                    autoComplete="one-time-code"
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={value => {
                      setVerificationCode(value.replace(/\D/g, ''));
                      setErrorMessage('');
                    }}
                    placeholder="000000"
                    placeholderTextColor="#A5ADBD"
                    style={[styles.input, styles.codeInput]}
                    textContentType="oneTimeCode"
                    value={verificationCode}
                  />
                  <ActionButton
                    disabled={isLoading}
                    label={isLoading ? 'Verifying...' : 'Verify code'}
                    onPress={verifyOtp}
                  />
                  <Pressable onPress={startOver} style={styles.textButton}>
                    <Text style={styles.textButtonLabel}>Use a different number</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Phone number</Text>
                  <TextInput
                    autoComplete="tel"
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    onChangeText={value => {
                      setPhoneNumber(value);
                      setErrorMessage('');
                    }}
                    placeholder="+923001234567"
                    placeholderTextColor="#A5ADBD"
                    style={styles.input}
                    textContentType="telephoneNumber"
                    value={phoneNumber}
                  />
                  <Text style={styles.helper}>Include your country code, starting with +.</Text>
                  <ActionButton
                    disabled={isLoading}
                    label={isLoading ? 'Sending code...' : 'Send verification code'}
                    onPress={requestOtp}
                  />
                </>
              )}

              {isLoading && <ActivityIndicator color="#FFFFFF" style={styles.loader} />}
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            </View>
          )}

          <Text style={styles.footer}>Protected by Firebase Authentication</Text>
          <View nativeID="recaptcha-container" style={styles.recaptchaContainer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionButton({
  disabled = false,
  label,
  onPress,
  secondary = false,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      <Text style={[styles.buttonLabel, secondary && styles.secondaryButtonLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F6F8FC',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E7EEFF',
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    marginBottom: 24,
    width: 64,
  },
  brandMarkText: {
    color: '#356AE6',
    fontSize: 32,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#356AE6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: '#182033',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#68738A',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    marginTop: 12,
    maxWidth: 380,
    textAlign: 'center',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7EBF3',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    maxWidth: 460,
    padding: 24,
    shadowColor: '#24365C',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: '100%',
    alignSelf: 'center',
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D5F0E1',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 460,
    padding: 28,
    width: '100%',
    alignSelf: 'center',
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: '#DFF7E9',
    borderRadius: 30,
    color: '#1C9B59',
    fontSize: 30,
    fontWeight: '800',
    height: 60,
    lineHeight: 60,
    marginBottom: 16,
    textAlign: 'center',
    width: 60,
  },
  successTitle: {
    color: '#182033',
    fontSize: 20,
    fontWeight: '700',
  },
  successText: {
    color: '#68738A',
    fontSize: 15,
    marginBottom: 24,
    marginTop: 8,
  },
  label: {
    color: '#29344A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#F8FAFD',
    borderColor: '#DCE3EF',
    borderRadius: 12,
    borderWidth: 1,
    color: '#182033',
    fontSize: 17,
    height: 54,
    paddingHorizontal: 16,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  helper: {
    color: '#8791A5',
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#356AE6',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  secondaryButton: {
    backgroundColor: '#EEF3FF',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: '#356AE6',
  },
  textButton: {
    alignItems: 'center',
    marginTop: 18,
    padding: 4,
  },
  textButtonLabel: {
    color: '#356AE6',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 16,
  },
  error: {
    color: '#C64040',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    color: '#98A1B2',
    fontSize: 12,
    marginTop: 28,
    textAlign: 'center',
  },
  recaptchaContainer: {
    height: 1,
    opacity: 0,
    width: 1,
  },
});
