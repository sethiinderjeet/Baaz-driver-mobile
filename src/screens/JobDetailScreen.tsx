// app/screens/JobDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { JSX, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { JOB_STATUS, STATUS_COLORS, STATUS_LABELS, updateJobStatusApi } from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { updateJobStatus } from '../store/jobsSlice';
import { RootState } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

interface Attachment {
  uri: string;
  name: string;
  type: 'image' | 'file';
  mimeType?: string;
}

export default function JobDetailScreen({ route, navigation }: Props): JSX.Element {
  const { job: initialJob } = route.params;
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Get live job status from Redux
  const job = useSelector((state: RootState) => state.jobs.jobs.find(j => j.id === initialJob.id)) || initialJob;

  const [attachments, setAttachments] = useState<Attachment[]>([]);

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

  const handleNavigate = () => {
    const scheme = Platform.select({ ios: 'maps://0,0?daddr=', android: 'google.navigation:q=' });
    const label = encodeURIComponent(job.zipCode || job.dropoffAddress || '');
    const url = Platform.select({
      ios: `${scheme}${label}`,
      android: `${scheme}${label}`
    });

    if (url) {
      Linking.openURL(url).catch((err: any) => console.error('An error occurred', err));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: 'image',
        mimeType: asset.mimeType
      }]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: 'image',
        mimeType: asset.mimeType
      }]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, {
        uri: asset.uri,
        name: asset.name,
        type: 'file',
        mimeType: asset.mimeType
      }]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {job.dropoffAddress && (
          <TouchableOpacity onPress={handleNavigate} style={styles.navButton}>
            <Ionicons name="compass" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Attachments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>

          {(job.currentJobStatus === JOB_STATUS.ON_PICKUP_SITE || job.currentJobStatus === JOB_STATUS.ON_DROP_SITE) && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>Add Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                <Ionicons name="document-outline" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>Add File</Text>
              </TouchableOpacity>
            </View>
          )}

          {attachments.length > 0 ? (
            attachments.map((item, index) => (
              <View key={index} style={styles.attachmentItem}>
                <View style={styles.attachmentInfo}>
                  <Ionicons
                    name={item.type === 'image' ? 'image' : 'document'}
                    size={24}
                    color={PRIMARY}
                  />
                  <Text style={styles.attachmentName} numberOfLines={1}>{item.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeAttachment(index)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic', marginBottom: 12 }}>No attachments yet.</Text>
          )}
        </View>

        {/* Next Step Button */}
        {job.nextStep <= JOB_STATUS.COMPLETED && (
          <TouchableOpacity
            style={[styles.action, { backgroundColor: STATUS_COLORS[job.nextStep] || '#10b981' }]}
            onPress={handleNextStep}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{STATUS_LABELS[job.nextStep]}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const PRIMARY = '#0b6eaa';
const BG = '#f7fbfc';
const CARD = '#fff';
const MUTED = '#64748b';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: PRIMARY },
  muted: { color: MUTED, marginTop: 8 },
  detailBox: { backgroundColor: CARD, padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#eef6fb' },
  action: { backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  backButton: { padding: 4 },
  navButton: { padding: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6
  },
  uploadButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eef6fb'
  },
  attachmentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  attachmentName: { fontSize: 14, color: '#333', flex: 1 },
});
