import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

interface BlogPost {
  id: string;
  title: string;
  image: any;
}

export default function BlogScreen() {

  const router = useRouter();
  
  const blogPosts: BlogPost[] = [
    { 
      id: '1', 
      title: 'Understanding Adult Acne: Causes and Solutions',
      image: require('../assets/images/acne.png') 
    },
    { 
      id: '2', 
      title: 'AI Dermatologist Just Got Smarter: AI Consultant and PDF Report!',
      image: require('../assets/images/ai-dermatologist.jpg') 
    },
    { 
      id: '3', 
      title: 'Top facialists on the trending treatments and innovative ingredients to try in 2025',
      image: require('../assets/images/facial-treatment.jpg') 
    },
    { 
      id: '4', 
      title: '5 Reasons to start Mole-mapping',
      image: require('../assets/images/mole-mapping.png') 
    },
    { 
      id: '5', 
      title: 'Skincare Questions You Were Too Afraid to Ask',
      image: require('../assets/images/skinQuestions.png') 
    },
    { 
      id: '6', 
      title: 'How To Calm Redness',
      image: require('../assets/images/calm-redness.png') 
    },
  ];

  const navigateToBlogPost = (id: string) => {
    router.push(`/blog/${id}`);
  };

  const renderItem = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigateToBlogPost(item.id)}
    >
      <Image source={item.image} style={styles.itemImage} />
      <Text style={styles.itemTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Blog</Text>
      <FlatList
        data={blogPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#14213d',
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 10,
    color: '#14213d',
  },
});