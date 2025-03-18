// app/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>SkinScan AI</Text>
          <Text style={styles.tagline}>AI-Powered Skin Detection</Text>
        </View>
        
        <View style={styles.heroSection}>
          <Image 
            source={require('../assets/images/Designer.jpeg') }
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Text style={styles.heroTitle}>Professional Skin Analysis at Your Fingertips</Text>
          <Text style={styles.heroDescription}>
            Get detailed skin condition analysis and professional advice with just a photo using our advanced AI technology
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureItem 
            title="Smart Detection" 
            description="AI technology precisely identifies various skin conditions and issues"
            iconName="🔍"
          />
          <FeatureItem 
            title="Expert Advice" 
            description="Personalized care plans based on your detection results"
            iconName="💡"
          />
          <FeatureItem 
            title="Track Progress" 
            description="Monitor changes in skin conditions over time"
            iconName="📊"
          />
          <FeatureItem 
            title="Connect with Experts" 
            description="Remote consultation with dermatologists when needed"
            iconName="👨‍⚕️"
          />
        </View>
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Begin Your Smart Skin Care Journey</Text>
          <View style={styles.buttonGroup}>
            <Link href="../login" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </Link>
            <Link href="../signup" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </Link> 
          </View>
        </View>
        
        <View style={styles.trustBadges}>
          <Text style={styles.trustText}>Trusted AI Skin Detection Solution</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ title, description, iconName }: { title: string; description: string; iconName: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{iconName}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#3a86ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  registerButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  guestButtonText: {
    color: '#3a86ff',
    fontSize: 14,
  },
  trustBadges: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#555',
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    marginHorizontal: 5,
  },
});