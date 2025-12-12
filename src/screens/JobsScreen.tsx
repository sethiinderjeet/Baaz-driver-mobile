// app/screens/JobsScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { JSX, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Delivery, fetchJobsApi } from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { setJobSummaries } from '../store/jobsSlice';
import { RootState } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Jobs'>;

export default function JobsScreen({ navigation }: Props): JSX.Element {
  const { signOut } = useAuth();
  const dispatch = useDispatch();

  // Select ID from Redux
  const auth = useSelector((state: RootState) => state.auth);
  const driverId = auth.clientOrDriverID;
  const jobs = useSelector((state: RootState) => state.jobs.jobs);

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Initial load
  useEffect(() => {
    loadDeliveries();
  }, [driverId]);

  const loadDeliveries = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      // Fetch summary list
      const data = await fetchJobsApi(driverId);
      // Update Redux (which adapts it to Delivery[])
      dispatch(setJobSummaries(data));
    } catch (e) {
      console.warn('Load jobs failed', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    (d.dropoffAddress && d.dropoffAddress.toLowerCase().includes(query.toLowerCase())) ||
    d.recipient.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }: { item: Delivery }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JobDetail', { job: item })}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.badge}>{item.priority}</Text>
      </View>
      <Text style={[styles.muted, { marginTop: 2 }]}>Ref: {item.trackingNumber}</Text>
      <Text style={styles.cardSub}>{item.short}</Text>
      <Text style={styles.muted}>To: {item.recipient} • ETA: {item.eta}</Text>
      <Text style={styles.muted}>Drop-off: {item.dropoffAddress || 'N/A'}</Text>
    </TouchableOpacity>
  );

  if (loading && jobs.length === 0) return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Assigned Deliveries</Text>
        <TouchableOpacity onPress={() => signOut()}><Text style={{ color: '#0b6eaa' }}>Logout</Text></TouchableOpacity>
      </View>

      <TextInput placeholder="Search..." style={styles.input} value={query} onChangeText={setQuery} />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDeliveries} colors={[PRIMARY]} tintColor={PRIMARY} />
        }
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#64748b', fontWeight: '500' }}>No job assigned yet</Text>
          </View>
        }
      />
    </View>
  );
}

const PRIMARY = '#0b6eaa';
const BG = '#f7fbfc';
const CARD = '#fff';
const MUTED = '#64748b';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: 18, fontWeight: '700', color: PRIMARY },
  input: { backgroundColor: CARD, padding: 12, borderRadius: 8, marginVertical: 12, borderWidth: 1, borderColor: '#e6eef4' },
  card: { backgroundColor: CARD, padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#eef6fb' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { color: MUTED, marginTop: 6 },
  muted: { color: MUTED, fontSize: 12, marginTop: 6 },
  badge: { backgroundColor: '#fde68a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, fontWeight: '700' },
});
