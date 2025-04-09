import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

interface BlogPost {
  id: string;
  title: string;
  image: any;
  content: string;
  author: string;
  date: string;
  readTime: string;
}

export default function BlogPostDetail() {
  const { id } = useLocalSearchParams();
  
  const blogPosts: BlogPost[] = [
    { 
      id: '1', 
      title: 'Understanding Adult Acne: Causes and Solutions',
      image: require('../../assets/images/acne.png'),
      content: `Adult acne is a common skin condition that affects many people well beyond their teenage years. Unlike teenage acne, which is often caused by hormonal changes during puberty, adult acne can be triggered by a variety of factors including stress, hormonal fluctuations, and even certain skincare products.

One of the primary causes of adult acne is hormonal imbalance. In women, fluctuations in estrogen and progesterone levels during the menstrual cycle, pregnancy, or menopause can lead to breakouts. Polycystic ovary syndrome (PCOS) is another common hormonal condition that can cause acne in adult women.

Stress is another significant factor. When you're stressed, your body produces more cortisol, a hormone that can increase oil production in your skin. This excess oil can clog pores and lead to acne.

Treatment options for adult acne include:
- Topical retinoids
- Salicylic acid cleansers
- Oral contraceptives (for women)
- Antibiotics
- Lifestyle changes to reduce stress

It's important to consult with a dermatologist to determine the best treatment plan for your specific type of acne.`,
      author: 'Dr. Sarah Johnson',
      date: 'March 15, 2025',
      readTime: '5 min read'
    },
    { 
      id: '2', 
      title: 'AI Dermatologist Just Got Smarter: AI Consultant and PDF Report!',
      image: require('../../assets/images/ai-dermatologist.jpg'),
      content: `We're excited to announce major upgrades to our AI Dermatologist feature! Our latest version includes:

1. Enhanced AI Consultant:
- More accurate skin condition analysis
- Personalized treatment recommendations
- Medication suggestions based on your medical history
- Integration with local dermatologists

2. Comprehensive PDF Reports:
- Detailed analysis of your skin condition
- Before/after comparison charts
- Customized skincare routines
- Printable format to share with your doctor

3. New Features:
- Progress tracking over time
- Medication reminders
- Skin diary to log flare-ups
- Product ingredient analyzer

The AI dermatologist now uses advanced machine learning algorithms trained on over 1 million skin images. Our accuracy rate for common conditions like acne, eczema, and psoriasis has improved to 92%.

To try these new features:
1. Open the app
2. Navigate to "Skin Analysis"
3. Take clear photos of your skin concern
4. Receive your instant report

Remember, while our AI is advanced, it doesn't replace professional medical advice for serious conditions.`,
      author: 'Dr. Michael Chen',
      date: 'April 2, 2025',
      readTime: '6 min read'
    },
    { 
      id: '3', 
      title: 'Top Facialists on the Trending Treatments and Innovative Ingredients to Try in 2025',
      image: require('../../assets/images/facial-treatment.jpg'),
      content: `We interviewed leading facialists from New York, Paris, and Seoul to bring you the top skincare trends for 2025:

1. Emerging Treatments:
- Bio-energetic facials using microcurrents
- Cryo-pressure therapy combining cold and massage
- LED light therapy with customizable wavelengths
- Enzyme peels with fruit-derived actives

2. Innovative Ingredients:
- Bakuchiol 2.0 (next-gen retinol alternative)
- Marine phytoplankton for deep hydration
- Adaptogenic mushrooms for stress-related skin issues
- Bio-fermented ceramides for barrier repair

3. At-Home Trends:
- Smart facial massage tools with AI feedback
- Custom-blended serums based on daily skin scans
- Sheet masks with biodegradable hydrogel technology
- pH-balancing cleansing milks

4. Professional Tips:
"Don't over-exfoliate - twice weekly is enough for most skin types." - Emma L., NYC
"Layer products from thinnest to thickest consistency." - Sophie T., Paris
"Always apply antioxidants before sunscreen." - Ji-hyun K., Seoul

Remember to patch test new products and introduce one new item at a time to monitor reactions.`,
      author: 'SkinCare Experts Team',
      date: 'January 15, 2025',
      readTime: '7 min read'
    },
    { 
      id: '4', 
      title: '5 Reasons to Start Mole-mapping',
      image: require('../../assets/images/mole-mapping.png'),
      content: `Mole-mapping is a crucial skin health practice that everyone should consider. Here's why:

1. Early Detection of Melanoma:
- Mapping allows comparison over time
- Small changes are easier to spot early
- 99% survival rate when caught in stage 1

2. Peace of Mind:
- Digital records eliminate guesswork
- Professional analysis of suspicious moles
- Reduced anxiety about skin changes

3. Convenience:
- Quick, non-invasive procedure
- Done in 15-20 minutes
- Access your map anytime via our app

4. Comprehensive Coverage:
- Full-body imaging
- Hard-to-see areas (scalp, back)
- Macro photos of individual moles

5. Family History Matters:
- If you have relatives with skin cancer
- If you have many moles (50+)
- If you've had sunburns in childhood

How our mole-mapping works:
1. Book a session at our clinic
2. We take high-res photos of your skin
3. AI analyzes mole patterns
4. Receive your personalized report
5. Schedule follow-ups every 6-12 months

Don't wait - schedule your baseline mole map today.`,
      author: 'Dr. Rebecca Wong',
      date: 'February 28, 2025',
      readTime: '4 min read'
    },
    { 
      id: '5', 
      title: 'Skincare Questions You Were Too Afraid to Ask',
      image: require('../../assets/images/skinQuestions.png'),
      content: `We collected anonymous questions from our users - here are answers to those "embarrassing" skincare questions:

1. "Why does my face get so oily by noon?"
- It's likely overcompensation for dehydration
- Try a hydrating serum under moisturizer
- Blotting papers are better than powder

2. "Is it normal to have tiny bumps under my eyes?"
- Likely milia - keratin trapped under skin
- Don't pick! See an esthetician for extraction
- Use gentle exfoliation to prevent

3. "Why do some products burn when I apply them?"
- Could be sensitivity to certain actives
- Common culprits: vitamin C, retinoids, acids
- Always do a patch test first

4. "How often should I really wash my pillowcase?"
- Ideally every 2-3 days for acne-prone skin
- Use silk or satin to reduce friction
- Have multiple sets to rotate

5. "Is it bad that I pop my pimples?"
- Yes! Causes scarring and spreads bacteria
- Instead: use pimple patches overnight
- Apply ice to reduce inflammation

Remember: No skincare question is silly - your dermatologist has heard them all!`,
      author: 'Nurse Practitioner Amy Lee',
      date: 'March 8, 2025',
      readTime: '5 min read'
    },
    { 
      id: '6', 
      title: 'How To Calm Redness',
      image: require('../../assets/images/calm-redness.png'),
      content: `Red, irritated skin can be frustrating. Here's our comprehensive guide to calming redness:

Immediate Relief:
- Cool compress (not ice directly)
- Aloe vera gel (keep in fridge)
- Oatmeal masks (colloidal oatmeal)
- Green tea bag compresses

Skincare Routine Adjustments:
1. Cleansing:
- Use lukewarm water (never hot)
- Cream or oil cleansers only
- Pat dry, don't rub

2. Treatment:
- Centella asiatica (cica) serums
- Niacinamide (3-5% concentration)
- Azelaic acid (great for rosacea)
- Avoid vitamin C and strong acids

3. Moisturizing:
- Ceramide-rich creams
- Products with panthenol
- Avoid fragrances and alcohol

Lifestyle Factors:
- Identify triggers (spicy food, alcohol, stress)
- Use mineral sunscreen daily
- Consider an anti-inflammatory diet
- Manage stress with meditation

When to See a Doctor:
- Persistent redness lasting weeks
- Burning or stinging sensations
- Visible blood vessels
- Accompanied by swelling or pus

Our favorite redness-reducing products:
- [Brand] Cica Repair Cream
- [Brand] Niacinamide Serum
- [Brand] Thermal Spring Water Spray`,
      author: 'Esthetician Maria Garcia',
      date: 'April 5, 2025',
      readTime: '6 min read'
    }
  ];

  const post = blogPosts.find(item => item.id === id);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Article not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Article',
          headerBackTitle: 'Back',
        }} 
      />
      <ScrollView style={styles.container}>
        <Image source={post.image} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{post.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.authorContainer}>
              <Text style={styles.author}>{post.author}</Text>
              <Text style={styles.date}>{post.date} · {post.readTime}</Text>
            </View>
          </View>

          <Text style={styles.content}>{post.content}</Text>
        </View>
      </ScrollView>
    </>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorContainer: {
    flex: 1,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});