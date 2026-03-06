import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './src/supabase';
import {
  fetchDocuments,
  uploadPdf,
  deleteDocument,
  chatQuery,
  type DocumentItem,
  type ChatMessage,
} from './src/api';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <Loader />;
  if (!user || !session) return <AuthScreen />;
  return <MainScreen />;
}

function Loader() {
  return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator color="#7C3AED" />
    </SafeAreaView>
  );
}

function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>{isSignup ? 'Create account' : 'Welcome back'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading}>
        <Text style={styles.primaryBtnText}>{loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Sign in'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignup((v) => !v)}>
        <Text style={styles.link}>{isSignup ? 'Have an account? Sign in' : 'New here? Create an account'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function MainScreen() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const readyDocs = useMemo(() => documents.filter((d) => d.status === 'ready'), [documents]);

  const refresh = async () => {
    setLoadingDocs(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const upload = async () => {
    const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
    await uploadPdf(result);
    await refresh();
  };

  const sendChat = async () => {
    if (!query.trim() || sending) return;
    setSending(true);
    const userMsg: ChatMessage = { role: 'user', content: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const response = await chatQuery(query.trim(), readyDocs.map((d) => d.id));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer, sources: response.sources },
      ]);
    } finally {
      setQuery('');
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.row}>
        <Text style={styles.title}>ScholarSync</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.link}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={upload}>
          <Text style={styles.secondaryBtnText}>Upload PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={refresh}>
          <Text style={styles.secondaryBtnText}>{loadingDocs ? 'Refreshing...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.docRow}>
            <Text style={styles.docName}>{item.original_name}</Text>
            <Text style={styles.docMeta}>{item.status}</Text>
            <TouchableOpacity onPress={() => deleteDocument(item.id)}>
              <Text style={styles.link}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No documents yet</Text>}
        style={{ maxHeight: 160 }}
      />

      <View style={styles.chatBox}>
        <FlatList
          data={messages}
          keyExtractor={(_, i) => `msg-${i}`}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, item.role === 'user' ? styles.chatUser : styles.chatBot]}>
              <Text style={styles.chatText}>{item.content}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Ask about your documents..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={sendChat}>
          <Text style={styles.primaryBtnText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0D12',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryBtnText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  secondaryBtnText: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  link: {
    color: '#A78BFA',
    fontSize: 12,
  },
  error: {
    color: '#F87171',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  docRow: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  docName: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  docMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  muted: {
    color: '#6B7280',
    marginTop: 6,
  },
  chatBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
  },
  chatBubble: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  chatUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C3AED',
  },
  chatBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
  },
  chatText: {
    color: '#F9FAFB',
    fontSize: 13,
  },
});
