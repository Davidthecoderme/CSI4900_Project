import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../database/firebase";


export default function HomeScreen() {
  const router = useRouter();
  const [randomArticles, setRandomArticles] = useState<{ id: string; title: string; image: any }[]>([]);
  
  // Stats data with state for dynamic values
  const [photoStats, setPhotoStats] = useState({
    uploaded: '0',
    normal: '0',
    diagnosed: '0'
  });

  // Feature cards with images
  const features = [
    { 
      id: '1', 
      title: 'Early Detection', 
      subtitle: 'Makes a Difference', 
      action: 'Scan', 
      image: require('../../assets/images/bodyScan.png'),
      onPress: () => router.push('/scan') 
    },
    { 
      id: '2', 
      title: 'Chat with AI', 
      subtitle: 'Get instant advice', 
      action: 'Chat', 
      image: require('../../assets/images/AI-chat-5.png'),
      onPress: () => router.push('../chatBot') 
    },
    { 
      id: '3', 
      title: 'Skin Blog', 
      subtitle: 'Read our articles', 
      action: 'Read', 
      image: require('../../assets/images/blog-articles.png'),
      onPress: () => router.push('../blog') 
    },
  ];

  // All available articles

  const allArticles = [
    { 
      id: '1', 
      title: 'Understanding Adult Acne: Causes and Solutions',
      image: require('../../assets/images/acne.png') 
    },
    { 
      id: '2', 
      title: 'AI Dermatologist Just Got Smarter: AI Consultant and PDF Report!',
      image: require('../../assets/images/ai-dermatologist.jpg') 
    },
    { 
      id: '3', 
      title: 'Top facialists on the trending treatments and innovative ingredients to try in 2025',
      image: require('../../assets/images/facial-treatment.jpg') 
    },
    { 
      id: '4', 
      title: '5 Reasons to start Mole-mapping',
      image: require('../../assets/images/mole-mapping.png') 
    },
    { 
      id: '5', 
      title: 'Skincare Questions You Were Too Afraid to Ask',
      image: require('../../assets/images/skinQuestions.png') 
    },
    { 
      id: '6', 
      title: 'How To Calm Redness',
      image: require('../../assets/images/calm-redness.png') 
    },

  ]

/* 
  const allArticles = [
    { 
      id: '1', 
      title: '5 Reasons to start Mole-mapping',
      image: require('../../assets/images/mole-mapping.png') 
    },
    { 
      id: '2', 
      title: 'Understanding Skin Cancer Risks',
      //image: require('../../assets/articles/skin-cancer.jpg') 
    },
    { 
      id: '3', 
      title: 'Daily Skin Care Routine',
      //image: require('../../assets/articles/skin-care.jpg') 
    },
    { 
      id: '4', 
      title: 'AI Dermatologist Just Got Smarter: AI Consultant and PDF Report!',
      image: require('../../assets/images/ai-dermatologist.jpg') 
    },
    { 
      id: '5', 
      title: 'Top facialists on the trending treatments and innovative ingredients to try in 2025',
      image: require('../../assets/images/facial-treatment.jpg') 
    },
    { 
      id: '6', 
      title: 'Skincare Questions You Were Too Afraid to Ask',
      image: require('../../assets/images/skinQuestions.png') 
    },
    { 
      id: '7', 
      title: 'Understanding Adult Acne: Causes and Solutions',
      image: require('../../assets/images/acne.png') 
    },
    { 
      id: '8', 
      title: 'How To Calm Redness',
      image: require('../../assets/images/calm-redness.png') 
    },
  ];
*/

  // Fetch Firestore photo statistics when component mounts
  useEffect(() => {
    fetchPhotoStatistics();
  }, []);

  // Function to get photos count from Firestore
  const fetchPhotoStatistics = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      // Query Firestore for images belonging to the current user
      const imagesRef = collection(db, "images");
      const q = query(imagesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      // Get total number of uploaded photos
      const uploadedCount = querySnapshot.size;
      
      // For normal vs diagnosed counts:
      // If you have a field in your documents that indicates diagnosis status
      // you can count them separately
      let diagnosedCount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if there's a diagnosis field or something similar
        // This is just a placeholder - replace with your actual field name
        if (data.hasDiagnosis === true) {
          diagnosedCount++;
        }
      });
      
      const normalCount = uploadedCount - diagnosedCount;
      
      setPhotoStats({
        uploaded: uploadedCount.toString(),
        normal: normalCount.toString(),
        diagnosed: diagnosedCount.toString()
      });
      
    } catch (error) {
      console.error('Error fetching photo statistics:', error);
    }
  };

  // Function to get random articles
  const getRandomArticles = () => {
    // Shuffle array and take first 4 elements
    const shuffled = [...allArticles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // Initialize random articles on component mount
  useEffect(() => {
    setRandomArticles(getRandomArticles());
  }, []);

  // Function to refresh random articles
  const refreshArticles = () => {
    setRandomArticles(getRandomArticles());
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header部分 */}
      <LinearGradient 
        colors={['#4a90e2', '#1e3a8a']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Your Personal</Text>
        <Text style={styles.headerSubtitle}>AI Dermatologist</Text>
      </LinearGradient>

      {/* Features Carousel */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuresContainer}
      >
        {features.map((feature) => (
          <TouchableOpacity 
            key={feature.id} 
            style={styles.featureCard}
            onPress={feature.onPress}
          >
            <Image source={feature.image} style={styles.featureImage} />
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>{feature.action}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Section - Now using dynamic data */}
      <Text style={styles.sectionTitle}>Your Skin Health</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{photoStats.uploaded}</Text>
          <Text style={styles.statLabel}>Photos uploaded</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{photoStats.normal}</Text>
          <Text style={styles.statLabel}>Without problems</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{photoStats.diagnosed}</Text>
          <Text style={styles.statLabel}>Diagnosed problems</Text>
        </View>
      </View>

      {/* Notification Setup */}
      <View style={styles.notificationCard}>
        <Image 
          //source={require('../../assets/icons/notification-bell.png')} 
          style={styles.notificationIcon}
        />
        <Text style={styles.notificationTitle}>Set Up Notification</Text>
        <Text style={styles.notificationText}>Do not forget to keep track of your skin conditions</Text>
        <Text style={styles.manualText}>Please read this manual carefully to ensure the best possible experience and accurate results.</Text>
      </View>

      {/* Articles Section with Refresh Button */}
      <View style={styles.articlesHeader}>
        <Text style={styles.sectionTitle}>Interesting for you</Text>
        <TouchableOpacity onPress={refreshArticles}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        horizontal
        data={randomArticles}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.articleCard}
            onPress={() => router.push(`../blog/${item.id}`)}
          >
            <Image source={item.image} style={styles.articleImage} />
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.articlesContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e0e7ff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  featuresContainer: {
    paddingBottom: 20,
  },
  featureCard: {
    width: 200,
    height: 220,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  notificationCard: {
    backgroundColor: '#f0f7ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    position: 'relative',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  manualText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  articlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshText: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  articlesContainer: {
    paddingBottom: 30,
  },
  articleCard: {
    width: 180,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  articleImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    margin: 10,
  },
  readMore: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
    margin: 10,
    marginTop: 0,
  },
});