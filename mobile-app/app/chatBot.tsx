// ChatbotPage.tsx
import React, { useState, useRef, useEffect } from "react";
import Constants from 'expo-constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from "react-native";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, db } from "../database/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";

const IP_ADDR = Constants.expoConfig.extra.ipAddr;
const API_URL = `http://${IP_ADDR}:8000/api/chat`;


// Animated loading indicator for "Reasoning..."
const ReasoningIndicator = () => {
  const translateX = useRef(new Animated.Value(-50)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 50,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={styles.reasoningBarContainer}>
      <Animated.View style={[styles.reasoningBar, { transform: [{ translateX }] }]} />
    </View>
  );
};

export default function ChatbotPage() {
  const router = useRouter();
  const { treatmentQuery } = useLocalSearchParams(); // Get treatmentQuery from URL params
  const user = auth.currentUser;
  const [sessions, setSessions] = useState<{ id: string; createdAt: Date }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id?: string; role: string; text: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // If a treatment query exists, prefill the input (or add a system message)
  useEffect(() => {
    if (treatmentQuery && typeof treatmentQuery === "string") {
      // Option 1: Automatically set the input text
      setInputText(treatmentQuery);
      
      // Option 2: Or automatically add a message to the conversation:
      // addMessage("user", treatmentQuery);
    }
  }, [treatmentQuery]);

  useEffect(() => {
    if (!user) return;
    const sessionsRef = collection(db, "chats", user.uid, "sessions");
    const q = query(sessionsRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => {
        const ts = doc.data().createdAt;
        return {
          id: doc.id,
          createdAt: ts?.toDate() || new Date(),
        };
      });
      setSessions(list);

      if (!currentSessionId && list.length) {
        setCurrentSessionId(list[0].id);
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user || !currentSessionId) {
      setMessages([]);
      return;
    }
    const msgsRef = collection(
      db,
      "chats",
      user.uid,
      "sessions",
      currentSessionId,
      "messages"
    );
    const q = query(msgsRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        role: doc.data().role,
        text: doc.data().text,
        timestamp: doc.data().timestamp,
      }));
      setMessages(list);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return unsub;
  }, [user, currentSessionId]);

  const confirmNewSession = () => {
    Alert.alert(
      "Start a new chat?",
      "Are you sure you want to start a new chat session?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: createNewSession },
      ]
    );
  };

  const createNewSession = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, "chats", user.uid, "sessions"), {
        createdAt: serverTimestamp(),
      });

      await addDoc(
        collection(db, "chats", user.uid, "sessions", docRef.id, "messages"),
        {
          role: "ai",
          text: "Hello! I'm your Skin Disease Detection assistant. How can I help you today?",
          timestamp: new Date().toLocaleTimeString(),
          createdAt: serverTimestamp(),
        }
      );

      setCurrentSessionId(docRef.id);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const msgsSnap = await getDocs(
        collection(db, "chats", user.uid, "sessions", sessionId, "messages")
      );
      msgsSnap.forEach((m) => batch.delete(m.ref));

      batch.delete(doc(db, "chats", user.uid, "sessions", sessionId));
      await batch.commit();

      if (sessionId === currentSessionId) {
        setCurrentSessionId((prev) => {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          return remaining[0]?.id || null;
        });
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const confirmDelete = (sessionId: string) => {
    Alert.alert(
      "Delete session?",
      "This will remove all messages in this session.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSession(sessionId) },
      ]
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !currentSessionId) return;
    const text = inputText.trim();
    const time = new Date().toLocaleTimeString();
    setInputText("");

    await addDoc(
      collection(db, "chats", user.uid, "sessions", currentSessionId, "messages"),
      {
        role: "user",
        text,
        timestamp: time,
        createdAt: serverTimestamp(),
      }
    );

    setIsThinking(true);

    let aiText = "";
    try {
      const resp = await axios.post(API_URL, { message: text }, { timeout: 15000 });
      aiText =
        typeof resp.data.response === "string"
          ? resp.data.response
          : JSON.stringify(resp.data.response);
    } catch (err) {
      Alert.alert("Error", "Failed to connect to chatbot");
      setIsThinking(false);
      return;
    }

    setIsThinking(false);

    const aiTime = new Date().toLocaleTimeString();
    await addDoc(
      collection(db, "chats", user.uid, "sessions", currentSessionId, "messages"),
      {
        role: "ai",
        text: aiText,
        timestamp: aiTime,
        createdAt: serverTimestamp(),
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={confirmNewSession}>
          <Text style={styles.headerButtonText}>New Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSessions(true)}
        >
          <Text style={styles.headerButtonText}>Sessions</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.map((m, i) => (
            <View
              key={m.id ?? i}
              style={[
                styles.messageContainer,
                m.role === "user" ? styles.userContainer : styles.aiContainer,
              ]}
            >
              {m.role === "ai" && (
                <Image
                  source={require("../assets/images/ai_avatar.png")}
                  style={styles.avatar}
                />
              )}
              <View
                style={[
                  styles.bubble,
                  m.role === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.text}>{m.text}</Text>
                <Text style={styles.timestamp}>{m.timestamp}</Text>
              </View>
            </View>
          ))}

          {isThinking && (
            <View style={[styles.messageContainer, styles.aiContainer]}>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.text}>Reasoning...</Text>
                <ReasoningIndicator />
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showSessions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSessions(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <ScrollView>
              {sessions.map((s) => (
                <View key={s.id} style={styles.sessionRow}>
                  <TouchableOpacity
                    style={styles.sessionItem}
                    onPress={() => {
                      setCurrentSessionId(s.id);
                      setShowSessions(false);
                    }}
                  >
                    <Text style={styles.sessionText}>
                      {s.createdAt.toLocaleDateString()} {s.createdAt.toLocaleTimeString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(s.id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  headerButtonText: { fontWeight: "bold", color: "#007aff" },
  chatArea: { flex: 1, backgroundColor: "#f5f5f5" },
  messagesList: { padding: 10 },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userContainer: { justifyContent: "flex-end" },
  aiContainer: { justifyContent: "flex-start" },
  bubble: { maxWidth: "70%", padding: 10, borderRadius: 10 },
  userBubble: { backgroundColor: "#007aff", marginLeft: 10 },
  aiBubble: { backgroundColor: "#e5e5ea", marginRight: 10 },
  text: { color: "#000" },
  timestamp: { fontSize: 12, color: "#666", marginTop: 5 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007aff",
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    height: "60%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 6,
  },
  closeText: { color: "#007aff", fontWeight: "bold" },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sessionItem: { flex: 1 },
  sessionText: { fontSize: 14 },
  deleteButton: { padding: 6 },
  deleteText: { color: "red" },
  reasoningBarContainer: {
    marginTop: 10,
    height: 4,
    backgroundColor: "#ccc",
    overflow: "hidden",
    borderRadius: 2,
  },
  reasoningBar: {
    height: 4,
    width: 50,
    backgroundColor: "#007aff",
    borderRadius: 2,
  },
});