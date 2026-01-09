// components/PdfImagePreviewModal.tsx
import { ImageBackground } from "expo-image";
import { FileText, Image as ImageIcon, X } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import CommonLoader from "../CommonLoader";

const { width, height } = Dimensions.get("window");

interface PdfImagePreviewModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  title?: string;
}

const PdfImagePreviewModal: React.FC<PdfImagePreviewModalProps> = ({
  visible,
  url,
  onClose,
  title = "Preview",
}) => {
  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);

  // Use Google Docs for better PDF rendering (recommended)
  const pdfUrl = isPdf
    ? `https://docs.googleusercontent.com/viewer?embedded=true&url=${encodeURIComponent(url)}`
    : url;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {isPdf ? (
              <FileText color="#fff" size={24} />
            ) : (
              <ImageIcon color="#fff" size={24} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isPdf ? (
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
               <CommonLoader fullScreen/>
                <Text style={styles.loadingText}>Loading PDF...</Text>
              </View>
            )}
            scalesPageToFit={Platform.OS === "android"}
            allowFileAccess={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={["*"]}
            mixedContentMode="compatibility"
          />
        ) : isImage ? (
          <ImageBackground
            source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
          >
            {/* Optional: Add zoom hint */}
            <View style={styles.imageOverlay}>
              <Text style={styles.zoomHint}>Pinch to zoom</Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unsupported file format</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomHint: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default PdfImagePreviewModal;