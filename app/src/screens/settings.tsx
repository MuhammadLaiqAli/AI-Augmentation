import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  Dimensions,
} from "react-native";
import { useContext } from "react";
import { AppContext, ThemeContext } from "../context";
import { AnthropicIcon, GeminiIcon, OpenAIIcon } from "../components/index";
import { IIconProps } from "../../types";
import { MODELS, IMAGE_MODELS } from "../../constants";
import * as themes from "../theme";

const { width } = Dimensions.get("window");

const iconMap: Record<string, any> = {
  claude: AnthropicIcon,
  gpt: OpenAIIcon,
  gemini: GeminiIcon,
  nanoBanana: GeminiIcon,
};

function getIcon(type: string, props: any) {
  const Icon =
    Object.entries(iconMap).find(([key]) => type.includes(key))?.[1] ||
    GeminiIcon;
  return <Icon {...props} />;
}

const ChoiceList = ({
  items,
  selected,
  onSelect,
  theme,
  showIcon = false,
}: {
  items: any[];
  selected: string;
  onSelect: (label: string) => void;
  theme: any;
  showIcon?: boolean;
}) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.buttonContainer}>
      {items.map((item) => {
        const isSelected = selected === item.label;
        return (
          <TouchableHighlight
            key={item.label}
            underlayColor="transparent"
            onPress={() => onSelect(item.label)}
          >
            <View
              style={[
                styles.chatChoiceButton,
                isSelected && { backgroundColor: theme.tintColor },
              ]}
            >
              {showIcon &&
                getIcon(item.label, {
                  theme,
                  size: 18,
                  style: { marginRight: 8 },
                  color: isSelected ? theme.tintTextColor : theme.textColor,
                  selected: isSelected,
                })}
              <Text
                style={[
                  styles.chatTypeText,
                  { color: isSelected ? theme.tintTextColor : theme.textColor },
                ]}
              >
                {item.name}
              </Text>
            </View>
          </TouchableHighlight>
        );
      })}
    </View>
  );
};

export function Settings() {
  const { theme, setTheme, themeName } = useContext(ThemeContext);
  const { chatType, setChatType, setImageModel, imageModel } =
    useContext(AppContext);

  const styles = getStyles(theme);

  const themeItems = Object.values(themes).map((v) => ({
    name: v.name,
    label: v.label,
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.sectionTitle}>Current Theme</Text>
      <ChoiceList
        items={themeItems}
        selected={themeName}
        onSelect={setTheme}
        theme={theme}
      />

      <Text style={styles.sectionTitle}>Chat Model</Text>
      <ChoiceList
        items={Object.values(MODELS)}
        selected={chatType.label}
        onSelect={setChatType}
        theme={theme}
        showIcon
      />

      <Text style={styles.sectionTitle}>Image Model</Text>
      <ChoiceList
        items={Object.values(IMAGE_MODELS)}
        selected={imageModel}
        onSelect={setImageModel}
        theme={theme}
        showIcon
      />
    </ScrollView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 14,
      paddingTop: 10,
      backgroundColor: theme.backgroundColor,
    },
    contentContainer: {
      paddingBottom: 40,
    },
    sectionTitle: {
      fontFamily: theme.boldFont,
      fontSize: 17,
      color: theme.textColor,
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginTop: 10,
    },
    buttonContainer: {
      marginBottom: 20,
    },
    chatChoiceButton: {
      padding: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    chatTypeText: {
      fontFamily: theme.semiBoldFont,
    },
  });
