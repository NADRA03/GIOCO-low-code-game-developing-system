import { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import CustomText from './CustomText';
import { useNavigate, useLocation } from 'react-router-native';

const RunGame = () => {
  const webViewRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const id = urlParams.get('id');
  console.log(id);

  // JavaScript to disable scrolling in the WebView content
  const injectedJavaScript = `
  // Add meta tags to disable zooming and scaling
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(meta);

  // Disable scrolling in WebView content
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  
  // Prevent text selection and zooming
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.MozUserSelect = 'none';
  document.body.style.msUserSelect = 'none';

  // Disable long-press, pinch-zoom, and gestures
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchstart', e => {
    // Prevent multi-touch events (e.g., pinch-to-zoom)
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent focusing on all interactive elements
  document.querySelectorAll('input, textarea, button, select, a').forEach(el => {
    el.setAttribute('tabindex', '-1');
    el.style.pointerEvents = 'none';
  });

  // Prevent focus events in the document and force blur
  window.addEventListener('focus', event => event.preventDefault(), true);
  window.addEventListener('mousedown', event => event.preventDefault(), true);

  // Ensure that no focus happens (on iPhones, or any device with touch support)
  document.addEventListener('focusin', (event) => {
    if (event.target.tagName !== 'BUTTON') {
      event.preventDefault();
      event.target.blur(); // Force remove focus
    }
  });

  // Prevent mousedown and touchstart events except for buttons
  document.addEventListener('mousedown', (event) => {
    if (event.target.tagName !== 'BUTTON') {
      event.preventDefault();
    }
  });

  // Ensure touch events don't cause any unwanted focus
  document.addEventListener('touchstart', (event) => {
    if (event.target.tagName !== 'BUTTON') {
      event.preventDefault();
    }
  });

  // Block all multi-touch gestures (pinch, zoom, etc.)
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  // Prevent default touch behavior
  document.addEventListener('touchend', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
`;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
        <CustomText style={styles.backButtonText}>&lt;</CustomText>
      </TouchableOpacity>
        <WebView
  ref={webViewRef}
  originWhitelist={['*']}
  source={{ uri: 'http://192.168.0.100:3001?id=${id}' }}
  style={styles.webView}
  scrollEnabled={false}
  showsVerticalScrollIndicator={false}
  showsHorizontalScrollIndicator={false}
  injectedJavaScript={injectedJavaScript}
  automaticallyAdjustContentInsets={false}
  keyboardDisplayRequiresUserAction={false}
  javaScriptEnabled={true}
  disableScrollViewPanResponder={true}
  allowFileAccess
  // Add these props to block gestures
  allowsLinkPreview={false}
  allowsBackForwardNavigationGestures={false}
  setSupportMultipleWindows={false}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    position: 'absolute',
    zIndex: 1,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 35,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    marginTop: 140,
    backgroundColor: '#000000',
    bottom: 50,
  },
});

export default RunGame;