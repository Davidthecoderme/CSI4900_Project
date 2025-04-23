// app/(tabs)/chatbot.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatbotScreen() {
  const router = useRouter();

  // Navigate to the chatBot.tsx page when the card is pressed
  const handleChatPress = () => {
    router.push('../chatBot'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      </View>

      <ScrollView style={styles.scrollContainer}>

        {/* Chatbot Card */}
        <TouchableOpacity style={styles.chatCard} onPress={handleChatPress}>
          <View style={styles.chatImageContainer}>
            <Image
              source={require('../../assets/images/bot.png')}
              style={styles.robotImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.chatInfoContainer}>
            <Text style={styles.chatTitle}>Chatbot</Text>
            <Text style={styles.chatSubtitle}>Tap here to start chatting</Text>
          </View>
          <View>
            <Text style={styles.chevron}>{'>'}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 15,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatImageContainer: {
    marginRight: 15,
  },
  robotImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  chatInfoContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
  },
});
