import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal
} from "react-native";
import { ChevronLeft, FileText } from 'lucide-react-native';
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";

const { height, width } = Dimensions.get("window");

type PDFModalProps = {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string;
  useLocal?: boolean;
  title?: string;
};

const PDFModal:React.FC<PDFModalProps> = ({
  visible,
  onClose,
  pdfUrl,
  useLocal = false,
  title = "App Guide",
}) => {
  const navigation = useNavigation();
  const [useWebView, setUseWebView] = useState(false);

  const pdfModalStyle = {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    height,
    width,
    margin: 0,
  };


  const webViewSource = {
    uri: `https://docs.google.com/viewer?url=${encodeURIComponent(
      pdfUrl
    )}&embedded=true`,
  };

  // Handle back button press
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      onClose();
    }
  };

  return (
    <Modal
  visible={visible}
  onDismiss={onClose}
  transparent={false}
  animationType="slide" // optional: smoother entry
>
      <View style={styles.pdfModalContainer}>
        {pdfUrl ? (
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
                <ChevronLeft  size={20} />
              </TouchableOpacity>
              <Text style={styles.headerText}>{title}</Text>
              <View style={styles.headerButton} />
            </View>

              <WebView
                source={webViewSource}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                originWhitelist={["*"]}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text>Loading PDF...</Text>
                  </View>
                )}
                renderError={() => (
                  <View style={styles.loadingContainer}>
                    <Text>Error loading PDF. Please try again.</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>No valid PDF URL found</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pdfModalContainer: {
    flex: 1,
    width: "100%",
  },
  pdfView: {
    flex: 1,
    width: "100%",
  },
  webView: {
    flex: 1,
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 30 : 10,
    backgroundColor: "white",
  },
  headerButton: {
    width: 40,
  },
  headerText: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default PDFModal;
