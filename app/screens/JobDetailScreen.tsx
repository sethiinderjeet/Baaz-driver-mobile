// app/screens/JobDetailScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { JSX } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export default function JobDetailScreen({ route, navigation }: Props): JSX.Element {
  const { job } = route.params;

  const markDelivered = () => {
    // Replace with real API call to mark as delivered
    Alert.alert('Marked Delivered', `Delivery ${job.id} marked as delivered.`);
    // Optionally navigate back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.muted}>Order ID: {job.id} • Priority: {job.priority} • Status: {job.status}</Text>

      <View style={styles.detailBox}>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Pickup</Text>
        <Text style={{ marginBottom: 10 }}>{job.pickupAddress}</Text>

        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Drop-off</Text>
        <Text style={{ marginBottom: 10 }}>{job.dropoffAddress}</Text>

        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Recipient</Text>
        <Text style={{ marginBottom: 8 }}>{job.recipient} • {job.phone}</Text>

        <Text style={{ fontWeight: '700', marginBottom: 6 }}>ETA</Text>
        <Text style={{ marginBottom: 8 }}>{job.eta}</Text>

        {job.notes ? (
          <>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Notes</Text>
            <Text>{job.notes}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.action} onPress={markDelivered}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Mark Delivered</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = '#0b6eaa';
const BG = '#f7fbfc';
const CARD = '#fff';
const MUTED = '#64748b';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24, backgroundColor: BG },
  title: { fontSize: 20, fontWeight: '800', color: PRIMARY },
  muted: { color: MUTED, marginTop: 8 },
  detailBox: { backgroundColor: CARD, padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#eef6fb' },
  action: { backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
});
