// src/components/ImageSegmentation.tsx
"use client";

import React, { useState } from "react";
import {
  View,
  Image,
  Button,
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

async function mockSegmentImage(uri: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(uri);
    }, 2000);
  });
}

// export default function ImageSegmentation() {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [segmentedUri, setSegmentedUri] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 1,
//     });

//     if (!result.canceled && result.assets[0].uri) {
//       setImageUri(result.assets[0].uri);
//       setSegmentedUri(null);
//     }
//   };

//   const runSegmentation = async () => {
//     if (!imageUri) return;
//     setLoading(true);
//     try {
//       const segmented = await mockSegmentImage(imageUri);
//       setSegmentedUri(segmented);
//     } catch (err) {
//       console.error("Segmentation failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Image Segmentation</Text>

      <Button title="Pick an Image" onPress={pickImage} />

      {imageUri && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Original</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {imageUri && !loading && (
        <Button title="Run Segmentation" onPress={runSegmentation} />
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#FF0000"
          style={{ marginTop: 20 }}
        />
      )}

      {segmentedUri && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Segmented</Text>
          <Image source={{ uri: segmentedUri }} style={styles.image} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#111",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
