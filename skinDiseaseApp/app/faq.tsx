import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqScreen() {
  // Sample FAQ data, you can replace with actual frequently asked questions
  const faqData: FaqItem[] = [
    { id: '1', question: 'How do I use this app?', answer: 'Simply register and follow the on-screen instructions to get started.' },
    { id: '2', question: 'What are the main features of this app?', answer: 'The app primarily uses AI technology for skin analysis and detection.' },
    { id: '3', question: 'Is my data secure?', answer: 'We use advanced encryption technology to protect user data.' },
  ];

  const renderItem = ({ item }: { item: FaqItem }) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.answer}>{item.answer}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      <FlatList
        data={faqData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
});