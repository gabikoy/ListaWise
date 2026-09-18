import { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

export default function App() {
  const [hasError, setHasError] = useState(false);
  const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5173' : 'http://localhost:5173';
  const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL || defaultUrl;

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.message}>
          <Text style={styles.title}>ListaWise could not connect</Text>
          <Text style={styles.body}>
            Start the frontend with `npm run dev`, or set EXPO_PUBLIC_WEB_APP_URL to the
            computer&apos;s local network address.
          </Text>
          <Text style={styles.url}>{webAppUrl}</Text>
          <Text style={styles.retry} onPress={() => setHasError(false)}>
            Try again
          </Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: webAppUrl }}
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
    padding: 28,
  },
  title: {
    color: '#0f3d22',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    marginTop: 12,
    color: '#246b44',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  url: {
    marginTop: 14,
    color: '#246b44',
    fontSize: 13,
    textAlign: 'center',
  },
  retry: {
    marginTop: 22,
    color: '#2e7d4f',
    fontSize: 16,
    fontWeight: '700',
  },
});
