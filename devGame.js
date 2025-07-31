import { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import CustomText from './CustomText';
import { useNavigate, useLocation } from 'react-router-native';
import { API_ENDPOINTS, API_BASE_URL_HTML }  from './api';

const DevGame = () => {
  const webViewRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const id = urlParams.get('id');
  console.log(id);

  console.log(`http://192.168.0.110:3001?id=${id}&dev=true`);
  
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

  // Disable long-press, pinch-zoom, and gestures
  document.addEventListener('contextmenu', e => {
    if (!e.target.closest('.jsoneditor')) e.preventDefault();
  });
  document.addEventListener('gesturestart', e => {
    if (!e.target.closest('.jsoneditor')) e.preventDefault();
  });

  // Prevent multi-touch gestures outside JSONEditor
  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1 && !e.target.closest('.jsoneditor')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent text selection globally except JSONEditor
  document.body.style.userSelect = 'none';
  document.querySelectorAll('.jsoneditor, .jsoneditor *').forEach(el => {
    el.style.userSelect = 'text';
    el.style.webkitUserSelect = 'text';
    el.style.MozUserSelect = 'text';
    el.style.msUserSelect = 'text';
    el.style.pointerEvents = 'auto';
    el.removeAttribute('tabindex');
  });

  // Disable interactive elements globally except JSONEditor
  document.querySelectorAll('input, textarea, button, select, a').forEach(el => {
    if (!el.closest('.jsoneditor')) {
      el.setAttribute('tabindex', '-1');
      el.style.pointerEvents = 'none';
    }
  });

  // Prevent focus events outside JSONEditor
  window.addEventListener('focus', event => {
    if (!event.target.closest('.jsoneditor')) event.preventDefault();
  }, true);

  window.addEventListener('mousedown', event => {
    if (!event.target.closest('.jsoneditor')) event.preventDefault();
  }, true);

  document.addEventListener('focusin', event => {
    if (!event.target.closest('.jsoneditor')) {
      event.preventDefault();
      event.target.blur();
    }
  });

  document.addEventListener('mousedown', event => {
    if (!event.target.closest('.jsoneditor')) {
      event.preventDefault();
    }
  });

  document.addEventListener('touchstart', event => {
    if (!event.target.closest('.jsoneditor')) {
      event.preventDefault();
    }
  });

  document.addEventListener('touchmove', event => {
    if (event.touches.length > 1 && !event.target.closest('.jsoneditor')) {
      event.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', event => {
    if (event.touches.length > 1 && !event.target.closest('.jsoneditor')) {
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
  source={{ uri: `${API_BASE_URL_HTML}?id=${id}&dev=true` }}
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
    bottom: 30,
  },
});

export default DevGame;