/**
 * FleetCore Enterprise — Driver Mobile App (React Native)
 * 
 * Features:
 *   F14: Driver manifest & proof-of-delivery (e-signature capture)
 *   F18: Two-way messaging with dispatcher
 *   F26: ELD duty status toggle (Driving, On-Duty, Off-Duty, Sleeper Berth)
 *   F36: Offline mode with sync queue
 * 
 * Section 14: Large, high-contrast UI for use in a cab
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const API_BASE = 'http://192.168.1.100:8080/api/v1';

// ── Offline Sync Queue (F36) ─────────────────────────────────────────────

class OfflineSyncQueue {
  constructor() {
    this.queue = [];
    this.isOnline = true;
  }

  enqueue(action) {
    this.queue.push({ ...action, timestamp: new Date().toISOString(), synced: false });
  }

  async syncAll() {
    const pending = this.queue.filter(a => !a.synced);
    for (const action of pending) {
      try {
        const res = await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        if (res.ok) action.synced = true;
      } catch (e) {
        console.log('[OfflineSync] Still offline, will retry');
        break;
      }
    }
    return pending.filter(a => a.synced).length;
  }

  get pendingCount() {
    return this.queue.filter(a => !a.synced).length;
  }
}

const syncQueue = new OfflineSyncQueue();

// ── Main App ─────────────────────────────────────────────────────────────

export default function DriverApp() {
  const [screen, setScreen] = useState('HOME');
  const [duty, setDuty] = useState('OFF_DUTY');
  const [messages, setMessages] = useState([
    { id: '1', from: 'DISPATCHER', text: 'Head to Depot 7A for pickup, bay #3.', time: '14:32', priority: 'NORMAL' },
    { id: '2', from: 'DISPATCHER', text: '⚠️ URGENT: Bridge closure on I-94 — use alternate route via US-41.', time: '15:01', priority: 'URGENT' },
  ]);
  const [msgInput, setMsgInput] = useState('');
  const [manifest, setManifest] = useState([
    { stopId: 'S1', name: 'Costco Distribution Center', address: '1250 W Division St, Chicago', status: 'COMPLETED', eta: '—' },
    { stopId: 'S2', name: 'Target Store #4421', address: '8900 S Cicero Ave', status: 'IN_PROGRESS', eta: '15 min' },
    { stopId: 'S3', name: 'Walmart Supercenter', address: '4650 W North Ave', status: 'PENDING', eta: '45 min' },
    { stopId: 'S4', name: 'Home Depot #6107', address: '2570 N Elston Ave', status: 'PENDING', eta: '1h 10m' },
  ]);
  const [signature, setSignature] = useState(null);

  // ── F26: ELD Duty Status Toggle ──────────────────────────────────────

  const dutyStatuses = [
    { key: 'DRIVING', label: '🚛 DRIVING', color: '#22c55e' },
    { key: 'ON_DUTY', label: '🔧 ON DUTY', color: '#3b82f6' },
    { key: 'OFF_DUTY', label: '🏠 OFF DUTY', color: '#6b7280' },
    { key: 'SLEEPER_BERTH', label: '😴 SLEEPER', color: '#8b5cf6' },
  ];

  const changeDuty = (newDuty) => {
    const prevDuty = duty;
    setDuty(newDuty);

    // Queue for offline sync (F36)
    syncQueue.enqueue({
      url: `${API_BASE}/compliance/eld/status`,
      method: 'POST',
      payload: { driverId: 'DRV-001', previousStatus: prevDuty, newStatus: newDuty },
    });

    Alert.alert('Duty Status Changed', `${prevDuty} → ${newDuty}\nRecorded at ${new Date().toLocaleTimeString()}`);
  };

  // ── F18: Two-Way Messaging ───────────────────────────────────────────

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      from: 'DRIVER',
      text: msgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: 'NORMAL',
    };
    setMessages(prev => [...prev, newMsg]);
    setMsgInput('');

    syncQueue.enqueue({
      url: `${API_BASE}/messages/send`,
      method: 'POST',
      payload: { senderId: 'DRV-001', senderRole: 'DRIVER', recipientId: 'DSP-001', content: newMsg.text, priority: 'NORMAL' },
    });
  };

  // ── F14: Proof of Delivery (Signature Capture) ────────────────────────

  const captureSignature = (stopId) => {
    // In production: opens canvas-based signature pad
    const sigData = `SIG-${stopId}-${Date.now()}`;
    setSignature(sigData);

    setManifest(prev =>
      prev.map(s => (s.stopId === stopId ? { ...s, status: 'COMPLETED', eta: '—' } : s))
    );

    syncQueue.enqueue({
      url: `${API_BASE}/deliveries/confirm`,
      method: 'POST',
      payload: { stopId, signatureData: sigData, timestamp: new Date().toISOString(), photoUrl: null },
    });

    Alert.alert('✅ Delivery Confirmed', `Stop ${stopId} marked as delivered.\nSignature captured: ${sigData}`);
  };

  // ── Screen: HOME ─────────────────────────────────────────────────────

  if (screen === 'HOME') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚛 FleetCore Driver</Text>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>
              {syncQueue.pendingCount > 0 ? `📡 ${syncQueue.pendingCount} pending` : '🟢 ONLINE'}
            </Text>
          </View>
        </View>

        {/* ELD Status Banner */}
        <View style={[styles.dutyBanner, { backgroundColor: dutyStatuses.find(d => d.key === duty)?.color }]}>
          <Text style={styles.dutyBannerText}>
            {dutyStatuses.find(d => d.key === duty)?.label}
          </Text>
          <Text style={styles.dutyTime}>Since {new Date().toLocaleTimeString()}</Text>
        </View>

        {/* Duty Status Grid (F26) */}
        <View style={styles.dutyGrid}>
          {dutyStatuses.map(ds => (
            <TouchableOpacity
              key={ds.key}
              style={[styles.dutyBtn, duty === ds.key && styles.dutyBtnActive, { borderColor: ds.color }]}
              onPress={() => changeDuty(ds.key)}
            >
              <Text style={[styles.dutyBtnText, duty === ds.key && { color: '#fff' }]}>
                {ds.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Cards */}
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navCard} onPress={() => setScreen('MANIFEST')}>
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navLabel}>Manifest</Text>
            <Text style={styles.navSub}>{manifest.filter(s => s.status === 'PENDING').length} stops remaining</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => setScreen('MESSAGES')}>
            <Text style={styles.navIcon}>💬</Text>
            <Text style={styles.navLabel}>Messages</Text>
            <Text style={styles.navSub}>{messages.length} messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => setScreen('DVIR')}>
            <Text style={styles.navIcon}>🔍</Text>
            <Text style={styles.navLabel}>DVIR</Text>
            <Text style={styles.navSub}>Pre-trip inspection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => Alert.alert('Navigation', 'Turn-by-turn commercial routing launching...')}>
            <Text style={styles.navIcon}>🗺️</Text>
            <Text style={styles.navLabel}>Navigate</Text>
            <Text style={styles.navSub}>Next: {manifest.find(s => s.status === 'IN_PROGRESS')?.name || 'None'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Screen: MANIFEST (F14) ───────────────────────────────────────────

  if (screen === 'MANIFEST') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('HOME')}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Route Manifest</Text>
        </View>

        <FlatList
          data={manifest}
          keyExtractor={item => item.stopId}
          renderItem={({ item, index }) => (
            <View style={[styles.manifestItem, item.status === 'COMPLETED' && styles.manifestCompleted]}>
              <View style={styles.manifestLeft}>
                <View style={[styles.stopNumber, {
                  backgroundColor: item.status === 'COMPLETED' ? '#22c55e' : item.status === 'IN_PROGRESS' ? '#3b82f6' : '#374151'
                }]}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>
              </View>
              <View style={styles.manifestCenter}>
                <Text style={styles.manifestName}>{item.name}</Text>
                <Text style={styles.manifestAddr}>{item.address}</Text>
                <Text style={[styles.manifestStatus, {
                  color: item.status === 'COMPLETED' ? '#22c55e' : item.status === 'IN_PROGRESS' ? '#3b82f6' : '#9ca3af'
                }]}>
                  {item.status} {item.eta !== '—' ? `• ETA: ${item.eta}` : ''}
                </Text>
              </View>
              {item.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={styles.deliverBtn}
                  onPress={() => captureSignature(item.stopId)}
                >
                  <Text style={styles.deliverBtnText}>✍️ Sign</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    );
  }

  // ── Screen: MESSAGES (F18) ───────────────────────────────────────────

  if (screen === 'MESSAGES') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('HOME')}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💬 Dispatcher Chat</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          style={styles.chatList}
          renderItem={({ item }) => (
            <View style={[
              styles.chatBubble,
              item.from === 'DRIVER' ? styles.chatBubbleDriver : styles.chatBubbleDispatcher,
              item.priority === 'URGENT' && styles.chatBubbleUrgent,
            ]}>
              <Text style={styles.chatSender}>{item.from} • {item.time}</Text>
              <Text style={styles.chatText}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={msgInput}
            onChangeText={setMsgInput}
            placeholder="Type a message..."
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Screen: DVIR (F22) ───────────────────────────────────────────────

  if (screen === 'DVIR') {
    const components = ['Brakes', 'Tires', 'Lights', 'Steering', 'Horn', 'Mirrors', 'Coupling', 'Fluid Levels'];
    const [checks, setChecks] = useState(components.map(c => ({ name: c, passed: true, note: '' })));

    const submitDVIR = () => {
      const defects = checks.filter(c => !c.passed);
      const passed = defects.length === 0;

      syncQueue.enqueue({
        url: `${API_BASE}/maintenance/dvir`,
        method: 'POST',
        payload: {
          assetId: 'TRK-8921',
          driverId: 'DRV-001',
          inspectionType: 'PRE_TRIP',
          defects: defects.map(d => ({ component: d.name.toUpperCase(), severity: 'MINOR', description: d.note || 'Defect noted' })),
        },
      });

      Alert.alert(
        passed ? '✅ DVIR Passed' : '⚠️ DVIR — Defects Found',
        passed ? 'Vehicle cleared for operation.' : `${defects.length} defect(s) reported. Notifying mechanic.`,
        [{ text: 'OK', onPress: () => setScreen('HOME') }]
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('HOME')}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔍 Pre-Trip DVIR</Text>
        </View>

        <ScrollView>
          {checks.map((check, i) => (
            <View key={check.name} style={styles.dvirRow}>
              <Text style={styles.dvirLabel}>{check.name}</Text>
              <View style={styles.dvirBtns}>
                <TouchableOpacity
                  style={[styles.dvirBtn, check.passed && styles.dvirBtnPass]}
                  onPress={() => {
                    const updated = [...checks];
                    updated[i].passed = true;
                    setChecks(updated);
                  }}
                >
                  <Text style={styles.dvirBtnText}>✅ OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dvirBtn, !check.passed && styles.dvirBtnFail]}
                  onPress={() => {
                    const updated = [...checks];
                    updated[i].passed = false;
                    setChecks(updated);
                  }}
                >
                  <Text style={styles.dvirBtnText}>❌ Defect</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitDvirBtn} onPress={submitDVIR}>
          <Text style={styles.submitDvirText}>Submit DVIR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

// ── Styles (Section 14: Large, high-contrast cab UI) ─────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  backBtn: { color: '#3b82f6', fontSize: 18, fontWeight: '600' },
  onlineBadge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onlineText: { color: '#22c55e', fontSize: 13, fontWeight: '600' },

  dutyBanner: { padding: 20, alignItems: 'center' },
  dutyBannerText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  dutyTime: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },

  dutyGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  dutyBtn: { width: '48%', margin: '1%', padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  dutyBtnActive: { backgroundColor: '#374151' },
  dutyBtnText: { color: '#9ca3af', fontSize: 16, fontWeight: '700' },

  navGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  navCard: { width: '48%', margin: '1%', backgroundColor: '#1e293b', padding: 20, borderRadius: 16 },
  navIcon: { fontSize: 32 },
  navLabel: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  navSub: { color: '#6b7280', fontSize: 13, marginTop: 4 },

  manifestItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  manifestCompleted: { opacity: 0.5 },
  manifestLeft: { marginRight: 12 },
  stopNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stopNumberText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  manifestCenter: { flex: 1 },
  manifestName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  manifestAddr: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  manifestStatus: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  deliverBtn: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  deliverBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  chatList: { flex: 1, padding: 12 },
  chatBubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '80%' },
  chatBubbleDispatcher: { backgroundColor: '#1e293b', alignSelf: 'flex-start' },
  chatBubbleDriver: { backgroundColor: '#1e40af', alignSelf: 'flex-end' },
  chatBubbleUrgent: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  chatSender: { color: '#9ca3af', fontSize: 11, marginBottom: 4 },
  chatText: { color: '#fff', fontSize: 16 },
  chatInputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  chatInput: { flex: 1, backgroundColor: '#1e293b', color: '#fff', borderRadius: 10, paddingHorizontal: 16, fontSize: 16 },
  sendBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, marginLeft: 8, borderRadius: 10, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dvirRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  dvirLabel: { color: '#fff', fontSize: 18, fontWeight: '600' },
  dvirBtns: { flexDirection: 'row', gap: 8 },
  dvirBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#374151' },
  dvirBtnPass: { backgroundColor: '#166534' },
  dvirBtnFail: { backgroundColor: '#991b1b' },
  dvirBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  submitDvirBtn: { backgroundColor: '#3b82f6', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  submitDvirText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
