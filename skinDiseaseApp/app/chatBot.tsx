import React, { useState, useRef } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import axios from "axios";

const API_URL = "http://192.168.2.17:8000/chat"; // Update with your server IP(which you can find in you mow computer IP address)
export default function ChatbotPage() {
  const [messages, setMessages] = useState<
    { role: string; text: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null); 


  const sendMessageToChatbot = async () => {
    if (!inputText.trim()) return;


    const userMessage = {
      role: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await axios.post(
        API_URL,
        { message: inputText },
        {
          timeout: 10000, 
        }
      );


      const aiMessage = {
        role: "ai",
        text:
          typeof response.data.response === "string"
            ? response.data.response
            : JSON.stringify(response.data.response),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const err = error as any;
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }
      Alert.alert("Error", "Failed to connect to chatbot");
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  item.role === "user"
                    ? styles.userContainer
                    : styles.aiContainer,
                ]}
              >
                {item.role === "ai" && (
                  <Image
                    source={require("../assets/images/ai_avatar.png")}
                    style={styles.avatar}
                  />
                )}
                <View
                  style={[
                    styles.chatBubble,
                    item.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={styles.chatText}>
                    {typeof item.text === "string"
                      ? item.text
                      : JSON.stringify(item.text)}
                  </Text>
                  <Text style={styles.timestamp}>
                    {item.timestamp}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              multiline
              onFocus={scrollToBottom}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessageToChatbot}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  aiContainer: {
    justifyContent: "flex-start",
  },
  chatBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
  },
  userBubble: {
    backgroundColor: "#007aff",
    marginLeft: 10,
  },
  aiBubble: {
    backgroundColor: "#e5e5ea",
    marginRight: 10,
  },
  chatText: {
    color: "#000000",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  chatInput: {
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
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
