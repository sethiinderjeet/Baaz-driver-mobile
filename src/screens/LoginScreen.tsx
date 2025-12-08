import React, { JSX, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen(): JSX.Element {
  const { verifyEmail, loginWithOtp } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email.trim());
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Email validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await loginWithOtp(email.trim(), otp.trim());
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError('');
    setOtp('');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Baaz Logistics</Text>
      <Text style={styles.subtitle}>Driver sign in to view assigned deliveries</Text>

      {step === 'email' ? (
        <>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter OTP sent to {email}</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholder="Enter OTP"
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleBackToEmail} disabled={loading}>
            <Text style={styles.linkText}>Change Email</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.hint}>
        {step === 'email' ? 'Demo: driver@baaz.com' : 'Demo OTP: 123456'}
      </Text>
    </View>
  );
}

const PRIMARY = '#0b6eaa';
const BG = '#f7fbfc';
const CARD = '#fff';
const MUTED = '#64748b';
const ERROR = '#ef4444';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  logo: { width: 120, height: 120, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: PRIMARY },
  subtitle: { color: MUTED, marginBottom: 18 },
  input: { width: '100%', backgroundColor: CARD, padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e6eef4' },
  button: { width: '100%', backgroundColor: PRIMARY, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  linkButton: { marginTop: 15, padding: 5 },
  linkText: { color: PRIMARY, fontWeight: '500' },
  hint: { color: MUTED, marginTop: 12, fontSize: 13 },
  error: { color: ERROR, marginBottom: 8 },
  label: { width: '100%', marginBottom: 10, color: '#333', fontWeight: '500' }
});
