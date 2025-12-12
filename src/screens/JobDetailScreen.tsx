// app/screens/JobDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { JSX, useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { JobDetail, STATUS_COLORS, STATUS_LABELS, fetchJobDetailApi, postJobStatusHistory } from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
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

  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch full details
    if (job.jobId) loadDetail();
  }, [job.jobId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchJobDetailApi(job.jobId);
      setDetail(data);
    } catch (e) {
      console.warn('Load detail failed', e);
    } finally {
      setLoading(false);
    }
  };

  const lastHistory = detail?.statusHistory && detail.statusHistory.length > 0 ? detail.statusHistory[0] : null;

  const handleNextStep = async () => {
    if (!user) return;

    if (lastHistory) {
      const nextId = lastHistory.nextStatusId;

      if ((nextId === 4 || nextId === 6) && attachments.length === 0) {
        Alert.alert("Required", "Please add at least one attachment (image or file) to proceed.");
        return;
      }

      try {
        setLoading(true);

        // Get Location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Determine Stop ID
        // 5 = On Drop Site, 6 = Delivered. For these, pass current stop ID (pendingStopId). Else 0.
        const stopId = (nextId === 5 || nextId === 6) ? (lastHistory.pendingStopId || 0) : 0;

        // Filter valid attachments and map to required format
        const filesToUpload = attachments.map(a => ({
          uri: a.uri,
          name: a.name,
          type: a.mimeType || (a.type === 'image' ? 'image/jpeg' : 'application/octet-stream')
        }));

        const payload = {
          JobId: job.jobId,
          StopId: stopId,
          StatusId: nextId,
          StatusTime: new Date().toISOString(),
          Latitude: latitude,
          Longitude: longitude,
          Notes: notes,
          CreatedBy: detail?.driverName || user.name || 'Driver', // Fallback
          Files: filesToUpload
        };

        console.log("Sending Status Update:", JSON.stringify(payload, null, 2));

        await postJobStatusHistory(payload);
        setNotes(''); // Clear notes after success
        setAttachments([]); // Clear attachments after success
        await loadDetail();
      } catch (e) {
        Alert.alert("Error", "Failed to update status");
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback legacy logic if no history
      console.log("No history found, falling back to legacy flow not implemented");
    }
  };

  const handleNavigate = () => {
    // Determine target based on next status
    // Status 2 (On the Way) -> Pickup
    // Status 5 (On Drop Site) -> Dropoff
    // We generalize: <= 3 -> Pickup, >= 4 -> Dropoff
    const nextStatusId = lastHistory?.nextStatusId ?? (typeof job.nextStep === 'number' ? job.nextStep : parseInt(job.nextStep as string || '0', 10));

    let destination = '';
    const isPickup = nextStatusId <= 3;

    // Priorities: 1. Detail PostCode, 2. Detail Address, 3. Job PostCode, 4. Job Address
    if (detail) {
      if (isPickup) {
        destination = detail.pickupPostCode || detail.pickupLocation || detail.pickupAddress;
      } else {
        destination = detail.dropoffPostCode || detail.dropoffAddress;
      }
    } else {
      // Fallback to initial job data
      const j = job as any;
      if (isPickup) {
        destination = j.pickupPostCode || j.pickupAddress || '';
      } else {
        destination = j.dropoffPostCode || j.dropoffAddress || '';
      }
    }

    const scheme = Platform.select({ ios: 'maps://0,0?daddr=', android: 'google.navigation:q=' });
    const label = encodeURIComponent(destination);
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
      allowsEditing: true, aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, { uri: asset.uri, name: asset.fileName || 'image.jpg', type: 'image', mimeType: asset.mimeType }]);
    }
  };
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) { Alert.alert("Permission to access camera is required!"); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, { uri: asset.uri, name: asset.fileName || `photo_${Date.now()}.jpg`, type: 'image', mimeType: asset.mimeType }]);
    }
  };
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, { uri: asset.uri, name: asset.name, type: 'file', mimeType: asset.mimeType }]);
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
        <TouchableOpacity onPress={handleNavigate} style={styles.navButton}>
          <Ionicons name="compass" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDetail} colors={[PRIMARY]} tintColor={PRIMARY} />
        }
      >
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.muted}>Ref: {job.trackingNumber} • Priority: {job.priority}</Text>
        <Text style={[styles.muted, { marginTop: 4 }]}>Status: {lastHistory?.currentStatusName || STATUS_LABELS[job.currentJobStatus] || job.status}</Text>

        {loading && <Text style={{ marginTop: 10, color: '#666' }}>Loading details...</Text>}

        {detail && (
          <View style={styles.detailBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.val}>{detail.clientName} ({detail.clientPhone})</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Driver:</Text>
              <Text style={styles.val}>{detail.driverName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Truck:</Text>
              <Text style={styles.val}>{detail.truckNo}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pickup:</Text>
              <Text style={styles.val}>{detail.pickupDateTime ? new Date(detail.pickupDateTime).toLocaleString() : 'N/A'}</Text>
            </View>
            <Text style={[styles.label, { marginTop: 8 }]}>Pickup Location</Text>
            <Text style={styles.val}>{detail.pickupLocation || detail.pickupAddress}</Text>

            {detail.notes ? (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Notes</Text>
                <Text style={styles.val}>{detail.notes}</Text>
              </>
            ) : null}
          </View>
        )}

        {/* Stops Section */}
        {detail && detail.stops && detail.stops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stops ({detail.stops.length})</Text>
            {detail.stops.map((stop, i) => {
              const isPending = lastHistory?.pendingStopId === stop.id;
              return (
                <View key={stop.id} style={[styles.stopCard, isPending ? { borderColor: STATUS_COLORS[1], borderWidth: 2, backgroundColor: '#fff' } : {}]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '700', color: isPending ? STATUS_COLORS[1] : PRIMARY }}>Stop #{stop.sequenceOrder}</Text>
                    <Text style={{ fontSize: 12, color: STATUS_COLORS[1] }}>{stop.status}</Text>
                  </View>
                  <Text style={{ marginTop: 4 }}>{stop.address || 'Address not provided'}</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{stop.contactName} • {stop.contactPhone}</Text>
                  {stop.notes ? <Text style={{ marginTop: 4, fontSize: 12, fontStyle: 'italic' }}>{stop.notes}</Text> : null}
                  {isPending && <Text style={{ fontSize: 10, color: STATUS_COLORS[1], marginTop: 4, fontWeight: 'bold' }}>CURRENT STOP</Text>}
                </View>
              )
            })}
          </View>
        )}

        {/* Attachments Section - Visible only for Next Status 4 (Loaded) or 6 (Delivered) */}
        {
          lastHistory && (lastHistory.nextStatusId === 4 || lastHistory.nextStatusId === 6) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attachments</Text>
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

              {attachments.length > 0 ? (
                attachments.map((item, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <View style={styles.attachmentInfo}>
                      {item.type === 'image' ? (
                        <Image source={{ uri: item.uri }} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />
                      ) : (
                        <Ionicons name="document" size={24} color={PRIMARY} />
                      )}
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
          )
        }

        {/* Notes Input */}
        {lastHistory?.nextStatusName && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { marginBottom: 8 }]}>Add Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Type any notes here..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        )}

        {/* Next Step Button */}
        {lastHistory && lastHistory.nextStatusName && (
          <TouchableOpacity
            style={[styles.action, { backgroundColor: STATUS_COLORS[lastHistory.nextStatusId] || '#10b981' }]}
            onPress={handleNextStep}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? 'Updating...' : lastHistory.nextStatusName}</Text>
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
  stopCard: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#bae6fd' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontWeight: '600', color: '#555', fontSize: 14 },
  val: { fontWeight: '400', color: '#333', fontSize: 14, flex: 1, textAlign: 'right' },
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  }
});
