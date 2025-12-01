// app/screens/JobDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { JSX } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { JOB_STATUS, STATUS_COLORS, STATUS_LABELS, updateJobStatusApi } from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { updateJobStatus } from '../store/jobsSlice';
import { RootState } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export default function JobDetailScreen({ route, navigation }: Props): JSX.Element {
  const { job: initialJob } = route.params;
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Get live job status from Redux
  const job = useSelector((state: RootState) => state.jobs.jobs.find(j => j.id === initialJob.id)) || initialJob;

  const handleNextStep = async () => {
    if (!user) return;

    const currentStep = job.nextStep;
    let nextStatus = currentStep;
    let nextStep = currentStep + 1;

    // Specific functionality for each step (empty methods for now)
    switch (currentStep) {
      case JOB_STATUS.ON_THE_WAY:
        // Logic for "On the Way"
        break;
      case JOB_STATUS.ON_PICKUP_SITE:
        // Logic for "On Pickup Site"
        break;
      case JOB_STATUS.LOADED:
        // Logic for "Loaded"
        break;
      case JOB_STATUS.ON_DROP_SITE:
        // Logic for "On Drop Site"
        break;
      case JOB_STATUS.DELIVERED:
        // Logic for "Delivered"
        break;
      case JOB_STATUS.COMPLETED:
        // Logic for "Job Complete"
        break;
    }

    if (currentStep <= JOB_STATUS.COMPLETED) {
      // Optimistic update
      dispatch(updateJobStatus({ jobId: job.id, status: nextStatus, nextStep: nextStep }));

      // API call
      try {
        await updateJobStatusApi(user.token, job.id, nextStatus);
      } catch (e) {
        console.error("Failed to update status", e);
        // Revert if needed (not implemented for simplicity)
      }
    }
  };

  const markDelivered = () => {
    // Replace with real API call to mark as delivered
    Alert.alert('Marked Delivered', `Delivery ${job.id} marked as delivered.`);
    // Optionally navigate back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.muted}>Order ID: {job.id} • Priority: {job.priority} • Status: {STATUS_LABELS[job.currentJobStatus] || job.status}</Text>

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

      {/* Navigation Button */}
      {job.dropoffAddress ? (
        <TouchableOpacity
          style={[styles.action, { backgroundColor: '#007bff', marginTop: 12 }]}
          onPress={() => {
            const scheme = Platform.select({ ios: 'maps://0,0?daddr=', android: 'google.navigation:q=' });
            const label = encodeURIComponent(job.zipCode || job.dropoffAddress || '');
            const url = Platform.select({
              ios: `${scheme}${label}`,
              android: `${scheme}${label}`
            });

            if (url) {
              Linking.openURL(url).catch((err: any) => console.error('An error occurred', err));
            }
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Navigate to Drop-off</Text>
        </TouchableOpacity>
      ) : null}

      {/* Next Step Button */}
      {job.nextStep <= JOB_STATUS.COMPLETED && (
        <TouchableOpacity
          style={[styles.action, { backgroundColor: STATUS_COLORS[job.nextStep] || '#10b981' }]}
          onPress={handleNextStep}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{STATUS_LABELS[job.nextStep]}</Text>
        </TouchableOpacity>
      )}
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
  backButton: { marginBottom: 16, alignSelf: 'flex-start' },
});
