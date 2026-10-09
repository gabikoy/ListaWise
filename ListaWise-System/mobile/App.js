import { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

export default function App() {
  const [hasError, setHasError] = useState(false);
  const defaultUrl = process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://listawise.pages.dev';
  const [urlInput, setUrlInput] = useState(defaultUrl);
  const [activeUrl, setActiveUrl] = useState(defaultUrl);

  const handleConnect = () => {
    let cleanUrl = urlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'http://' + cleanUrl;
    }
    setActiveUrl(cleanUrl);
    setHasError(false);
  };

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.message}>
          <Text style={styles.title}>ListaWise Connection</Text>
          <Text style={styles.body}>
            Enter your server URL or your computer's local network address:
          </Text>
          
          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="http://10.225.210.58:5173"
            placeholderTextColor="#8aa89b"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <TouchableOpacity style={styles.button} onPress={handleConnect}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Ensure your computer and phone are connected to the same Wi-Fi network and `npm run dev` is running.
          </Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        key={activeUrl}
        source={{ uri: activeUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2e7d4f" />
          </View>
        )}
        onError={() => setHasError(true)}
        onHttpError={() => setHasError(true)}
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6ef',
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf6ef',
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0f3d22',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    marginBottom: 20,
    color: '#246b44',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#2e7d4f',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f3d22',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2e7d4f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 20,
    color: '#6b8a78',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
