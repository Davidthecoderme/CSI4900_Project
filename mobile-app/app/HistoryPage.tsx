import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { auth } from "../database/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../database/firebase";

const HistoryPage = () => {
  const [historyImages, setHistoryImages] = useState<
    { url: string; timestamp: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchHistoryImages = async () => {
    if (!user) return;
    try {
      const imagesRef = collection(db, "images");
      const q = query(imagesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const userImages: { url: string; timestamp: string }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userImages.push({
          url: data.downloadURL,
          timestamp: data.timestamp,
        });
      });

      userImages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setHistoryImages(userImages);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryImages();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Failed to format time", error);
      return "Unknown Time";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History:</Text>
      {historyImages.length > 0 ? (
        <FlatList
          data={historyImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.url }}
                style={styles.image}
                resizeMode="contain"
                onLoad={
                  Platform.OS !== "web"
                    ? (event) => {
                        const { width, height } = event.nativeEvent.source;
                        console.log(`Image dimensions: ${width}x${height}`);
                      }
                    : undefined
                }
              />
              <Text style={styles.timestamp}>
                Time Uploaded:{" "}
                {item.timestamp ? formatTimestamp(item.timestamp) : "Unknown Time"}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text>No history records</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
  },
  timestamp: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default HistoryPage;
