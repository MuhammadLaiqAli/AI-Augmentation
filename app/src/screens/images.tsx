import {
  View,
  Text,
  TouchableHighlight,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Keyboard,
  Image,
} from "react-native";
import { useState, useRef, useContext } from "react";
import { DOMAIN, IMAGE_MODELS } from "../../constants";
import { v4 as uuid } from "uuid";
import { ThemeContext, AppContext } from "../context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

export function Images() {
  const [callMade, setCallMade] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<any>(null);
  const [images, setImages] = useState<{ id: string; values: any[] }>({
    id: uuid(),
    values: [],
  });

  const scrollViewRef = useRef<ScrollView | null>(null);
  const { theme } = useContext(ThemeContext);
  const { handlePresentModalPress, closeModal, imageModel } =
    useContext(AppContext);

  const { showActionSheetWithOptions } = useActionSheet();

  const hideInput = false;
  const buttonLabel = "Generate";
  const showImagePickerButton = !hideInput;

  const styles = getStyles(theme);

  const scrollToEnd = () =>
    scrollViewRef.current?.scrollToEnd({ animated: true });

  const appendImagePrompt = (userText: string, imageUrl?: string) => {
    setImages((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          user: userText,
          image: imageUrl,
          model: imageUrl ? IMAGE_MODELS[imageModel].name : undefined,
          provider: imageUrl ? "Gemini" : undefined,
        },
      ],
    }));
    setTimeout(scrollToEnd, 50);
  };

  async function generate() {
    if (loading) return;
    if (!hideInput && !input) return console.log("no input");
    if (hideInput && !image) return console.log("no image selected");

    Keyboard.dismiss();
    setCallMade(true);

    appendImagePrompt(input);
    setLoading(true);
    const currentInput = input;
    const currentImage = image;
    setInput("");
    setImage(null);

    try {
      let response: any;
      const body = { prompt: currentInput, model: imageModel };

      if (currentImage) {
        const formData = new FormData();
        formData.append("file", {
          uri: currentImage.uri.replace("file://", ""),
          name: uuid(),
          type: currentImage.mimeType,
        } as any);

        for (const key in body) formData.append(key, body[key]);
        response = await fetch(`${DOMAIN}/images/gemini`, {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => res.json());
      } else {
        response = await fetch(`${DOMAIN}/images/gemini`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then((res) => res.json());
      }

      if (response?.image) {
        appendImagePrompt(currentInput, response.image);
      } else {
        console.log("Error generating image:", response);
      }
    } catch (err) {
      console.log("Error generating image:", err);
    } finally {
      setLoading(false);
    }
  }

  const chooseImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (res.assets?.length) setImage(res.assets[0]);
    } catch (err) {
      console.log("Image pick error:", err);
    }
  };

  const clearPrompts = () =>
    setImages({ id: uuid(), values: [] }) || setCallMade(false);

  const downloadImageToDevice = async (url: string) => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        `${FileSystem.documentDirectory}${uuid()}.png`,
      );
      await downloadResumable.downloadAsync();
    } catch (err) {
      console.log("Error saving image:", err);
    }
  };

  const showClipboardActionsheet = async (item: any) => {
    closeModal();
    showActionSheetWithOptions(
      {
        options: ["Save image", "Clear prompts", "Cancel"],
        cancelButtonIndex: 2,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) downloadImageToDevice(item.image);
        if (selectedIndex === 1) clearPrompts();
      },
    );
  };

  const renderSelectedImage = () =>
    image ? (
      <View style={styles.midFileNameContainer}>
        <Text style={styles.fileName}>
          {image.name || "Image from Camera Roll"}
        </Text>
        <TouchableHighlight
          onPress={() => setImage(null)}
          style={styles.closeIconContainer}
          underlayColor="transparent"
        >
          <MaterialIcons
            style={styles.closeIcon}
            name="close"
            color={theme.textColor}
            size={14}
          />
        </TouchableHighlight>
      </View>
    ) : null;

  const renderPromptItem = (v: any, index: number) => (
    <View key={index} style={styles.imageContainer}>
      {v.user && (
        <View style={styles.promptTextContainer}>
          <View style={styles.promptTextWrapper}>
            <Text style={styles.promptText}>{v.user}</Text>
          </View>
        </View>
      )}
      {v.image && (
        <View>
          <TouchableHighlight
            onPress={() => showClipboardActionsheet(v)}
            underlayColor="transparent"
          >
            <Image source={{ uri: v.image }} style={styles.image} />
          </TouchableHighlight>
          <View style={styles.modelLabelContainer}>
            <Text style={styles.modelLabelText}>
              Created with {v.provider || "Gemini"} model {v.model}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={110}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={!callMade && styles.scrollContentContainer}
          style={styles.scrollContainer}
        >
          {!callMade && (
            <View style={styles.midChatInputWrapper}>
              <View style={styles.midChatInputContainer}>
                {!hideInput && (
                  <>
                    <TextInput
                      value={input}
                      onChangeText={setInput}
                      style={styles.midInput}
                      placeholder="What do you want to create?"
                      placeholderTextColor={theme.placeholderTextColor}
                      autoCorrect
                    />
                    <View style={styles.midButtonRow}>
                      <TouchableHighlight
                        onPress={generate}
                        underlayColor="transparent"
                        style={styles.midButtonWrapper}
                        onLongPress={() => {
                          Keyboard.dismiss();
                          handlePresentModalPress();
                        }}
                      >
                        <View style={styles.midButtonStyle}>
                          <Ionicons
                            name="images-outline"
                            size={22}
                            color={theme.tintTextColor}
                          />
                          <Text style={styles.midButtonText}>Create</Text>
                        </View>
                      </TouchableHighlight>
                      {showImagePickerButton && (
                        <TouchableHighlight
                          onPress={chooseImage}
                          underlayColor="transparent"
                        >
                          <View style={styles.addImageIconButton}>
                            <Ionicons
                              name={
                                image ? "checkmark-circle" : "camera-outline"
                              }
                              size={20}
                              color={theme.textColor}
                            />
                          </View>
                        </TouchableHighlight>
                      )}
                    </View>
                  </>
                )}
                {renderSelectedImage()}
                <Text style={styles.chatDescription}>
                  Generate images and art using natural language.
                </Text>
              </View>
            </View>
          )}

          {images.values.map(renderPromptItem)}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.backgroundColor },
    scrollContainer: { paddingTop: 10 },
    scrollContentContainer: { flex: 1 },
    midChatInputWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    midChatInputContainer: { width: "100%", paddingVertical: 5 },
    midInput: {
      marginBottom: 8,
      borderWidth: 1,
      paddingHorizontal: 25,
      marginHorizontal: 10,
      paddingVertical: 15,
      borderRadius: 99,
      color: theme.textColor,
      borderColor: theme.borderColor,
      fontFamily: theme.mediumFont,
    },
    midButtonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 14,
    },
    midButtonWrapper: { flex: 1 },
    midButtonStyle: {
      flex: 1,
      flexDirection: "row",
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 99,
      backgroundColor: theme.tintColor,
      justifyContent: "center",
      alignItems: "center",
    },
    midButtonText: {
      color: theme.tintTextColor,
      marginLeft: 10,
      fontFamily: theme.boldFont,
      fontSize: 16,
    },
    addImageIconButton: {
      padding: 10,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    midFileNameContainer: {
      marginTop: 20,
      marginHorizontal: 10,
      marginRight: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 7,
    },
    closeIconContainer: {
      position: "absolute",
      right: -15,
      top: -17,
      padding: 10,
      backgroundColor: "transparent",
      borderRadius: 25,
    },
    closeIcon: {
      borderWidth: 1,
      padding: 4,
      backgroundColor: theme.backgroundColor,
      borderColor: theme.borderColor,
      borderRadius: 15,
    },
    fileName: { color: theme.textColor },
    chatDescription: {
      color: theme.textColor,
      textAlign: "center",
      marginTop: 15,
      fontSize: 13,
      paddingHorizontal: 34,
      opacity: 0.8,
      fontFamily: theme.regularFont,
    },
    imageContainer: { marginBottom: 15 },
    promptTextContainer: {
      flex: 1,
      alignItems: "flex-end",
      marginRight: 5,
      marginLeft: 24,
      marginBottom: 5,
    },
    promptTextWrapper: {
      borderRadius: 8,
      borderTopRightRadius: 0,
      backgroundColor: theme.tintColor,
    },
    promptText: {
      color: theme.tintTextColor,
      fontFamily: theme.regularFont,
      paddingVertical: 5,
      paddingHorizontal: 9,
      fontSize: 16,
    },
    image: {
      width: width - 10,
      height: width - 10,
      marginTop: 5,
      marginHorizontal: 5,
      borderRadius: 8,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    modelLabelContainer: {
      padding: 9,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: theme.borderColor,
      paddingLeft: 13,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      marginHorizontal: 5,
    },
    modelLabelText: {
      color: theme.mutedForegroundColor,
      fontFamily: theme.regularFont,
      fontSize: 13,
    },
    loadingContainer: {
      marginVertical: 25,
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
    },
  });
