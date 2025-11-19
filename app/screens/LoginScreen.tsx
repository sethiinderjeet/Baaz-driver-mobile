// app/screens/LoginScreen.tsx
import React, { JSX, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen(): JSX.Element {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('driver@baaz.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Baaz Logistics</Text>
      <Text style={styles.subtitle}>Driver sign in to view assigned deliveries</Text>

      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>Demo credentials: driver@baaz.com / password</Text>
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
  hint: { color: MUTED, marginTop: 12, fontSize: 13 },
  error: { color: ERROR, marginBottom: 8 },
});
