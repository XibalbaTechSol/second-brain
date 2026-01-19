import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';

// UPDATE THIS WITH YOUR COMPUTER'S LOCAL IP (Use 'ifconfig' or 'ipconfig' to find it)
const API_URL = 'http://192.168.1.100:3000/api/inbox'; 

type InboxItem = {
  id: string;
  content: string;
  source: string;
  status: string;
  createdAt: string;
  confidence?: number;
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'capture' | 'alerts' | 'brain'>('capture');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inboxRes, entRes] = await Promise.all([
        fetch(API_URL),
        fetch(API_URL.replace('/inbox', '/entities'))
      ]);
      if (inboxRes.ok) setItems(await inboxRes.ok ? await inboxRes.json() : []);
      if (entRes.ok) setEntities(await entRes.json());
    } catch (error) {
      console.error('Fetch failed', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCapture = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputText,
          source: 'mobile-app'
        }),
      });

      if (response.ok) {
        setInputText('');
        fetchData();
        Alert.alert('Success', 'Sent to Brain');
      } else {
        Alert.alert('Error', 'Failed to send to Brain');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not reach the Brain.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }) // Simple force-complete
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrash = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const nudges = items.filter(i => i.source === 'SYSTEM_NUDGE' && i.status !== 'COMPLETED');
  const needsReview = items.filter(i => i.status === 'NEEDS_USER_REVIEW');
  const recent = items.filter(i => i.status === 'COMPLETED').slice(0, 5);

  if (selectedEntity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedEntity(null)} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Memory</Text>
            <Text style={styles.subtitle}>{selectedEntity.type}</Text>
          </View>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
          <Text style={styles.detailTitle}>{selectedEntity.title}</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Status: {selectedEntity.task?.isDone ? 'Done' : 'Active'}</Text>
          </View>
          <Text style={styles.detailContent}>{selectedEntity.content || selectedEntity.summary}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CognitoFlow</Text>
          <Text style={styles.subtitle}>{activeTab === 'capture' ? 'Frictionless Capture' : activeTab === 'alerts' ? 'Attention Required' : 'The Brain'}</Text>
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('capture')} style={[styles.tabItem, activeTab === 'capture' && styles.tabItemActive]}>
            <Feather name="edit-3" size={20} color={activeTab === 'capture' ? '#fff' : '#2563EB'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('alerts')} style={[styles.tabItem, activeTab === 'alerts' && styles.tabItemActive]}>
            <Feather name="bell" size={20} color={activeTab === 'alerts' ? '#fff' : '#2563EB'} />
            {(nudges.length + needsReview.length) > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('brain')} style={[styles.tabItem, activeTab === 'brain' && styles.tabItemActive]}>
            <Feather name="database" size={20} color={activeTab === 'brain' ? '#fff' : '#2563EB'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'capture' ? (
          <>
            <View style={styles.captureBox}>
               <TextInput
                style={styles.input}
                placeholder="Capture a thought..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                style={[styles.button, (!inputText.trim() || loading) && styles.buttonDisabled]} 
                onPress={handleCapture}
                disabled={!inputText.trim() || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Capture</Text>}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Recently Sorted</Text>
            {recent.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardText}>{item.content}</Text>
                <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleTimeString()} • Processed</Text>
              </View>
            ))}
          </>
        ) : activeTab === 'alerts' ? (
          <>
            {nudges.length > 0 && (
              <>
                <Text style={styles.sectionTitleAlert}>Tap on Shoulder (Nudges)</Text>
                {nudges.map(item => (
                  <View key={item.id} style={[styles.card, styles.nudgeCard]}>
                    <Text style={styles.cardText}>{item.content}</Text>
                    <View style={styles.actionRow}>
                       <TouchableOpacity onPress={() => handleApprove(item.id)} style={[styles.actionButton, styles.primaryAction]}><Text style={styles.primaryActionText}>Got it</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {needsReview.length > 0 && (
              <>
                <Text style={styles.sectionTitleAlert}>The Bouncer (Low Confidence)</Text>
                {needsReview.map(item => (
                  <View key={item.id} style={[styles.card, styles.reviewCard]}>
                    <Text style={styles.cardText}>{item.content}</Text>
                    <Text style={styles.confText}>Confidence: {((item.confidence || 0) * 100).toFixed(0)}%</Text>
                    <View style={styles.actionRow}>
                       <TouchableOpacity onPress={() => handleTrash(item.id)} style={styles.actionButton}><Text style={styles.actionButtonText}>Trash</Text></TouchableOpacity>
                       <TouchableOpacity onPress={() => handleApprove(item.id)} style={[styles.actionButton, styles.primaryAction]}><Text style={styles.primaryActionText}>Approve</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {nudges.length === 0 && needsReview.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>You're all caught up!</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>The Filing Cabinet</Text>
            {entities.map(ent => (
              <TouchableOpacity key={ent.id} style={styles.card} onPress={() => setSelectedEntity(ent)}>
                <View style={styles.entityHeader}>
                  <Text style={styles.cardText}>{ent.title}</Text>
                  <View style={[styles.typeTag, { backgroundColor: ent.type === 'TASK' ? '#FAF5FF' : ent.type === 'PROJECT' ? '#EFF6FF' : '#F3F4F6' }]}>
                    <Text style={[styles.typeTagText, { color: ent.type === 'TASK' ? '#7E22CE' : ent.type === 'PROJECT' ? '#1D4ED8' : '#4B5563' }]}>{ent.type}</Text>
                  </View>
                </View>
                <Text style={styles.cardTime}>{ent.summary}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#2563EB',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  captureBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  input: {
    fontSize: 18,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionTitleAlert: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  nudgeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  reviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  cardTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  confText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 6,
    backgroundColor: '#FEF2F2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  primaryAction: {
    backgroundColor: '#2563EB',
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  metadataRow: {
    marginBottom: 20,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  }
});
