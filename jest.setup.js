// Mock @env before other modules
jest.mock('@env', () => ({
  ELEVENLABS_API_KEY: 'sk_test_elevenlabs_api_key',
  OPENROUTER_KEY: 'sk-or-v1-test_openrouter_key',
  LOCIZE_PROJECT_ID: 'test_locize_project_id',
  LOCIZE_API_KEY: 'test_locize_api_key',
}));

// Mock react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
    IOS: {
      MICROPHONE: 'ios.permission.MICROPHONE',
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(() => Promise.resolve([{
    uri: 'file://test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: 1024,
  }])),
  types: {
    allFiles: '*/*',
    images: 'image/*',
    pdf: 'application/pdf',
  },
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn((options, callback) => {
    callback({
      assets: [{
        uri: 'file://test-image.jpg',
        type: 'image/jpeg',
        fileName: 'test-image.jpg',
        fileSize: 2048,
      }],
    });
  }),
  launchCamera: jest.fn((options, callback) => {
    callback({
      assets: [{
        uri: 'file://camera-image.jpg',
        type: 'image/jpeg',
        fileName: 'camera-image.jpg',
        fileSize: 2048,
      }],
    });
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-tts
jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  setDefaultLanguage: jest.fn(),
  setDefaultRate: jest.fn(),
  setDefaultPitch: jest.fn(),
  getInitStatus: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
  Rect: 'Rect',
  Line: 'Line',
  Polyline: 'Polyline',
  Polygon: 'Polygon',
  Text: 'Text',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Phone: 'Phone',
  PhoneOff: 'PhoneOff',
  Mic: 'Mic',
  MicOff: 'MicOff',
  Volume2: 'Volume2',
  Loader: 'Loader',
  Upload: 'Upload',
  Send: 'Send',
  Plus: 'Plus',
  Menu: 'Menu',
  Settings: 'Settings',
  User: 'User',
  MessageCircle: 'MessageCircle',
  History: 'History',
  Home: 'Home',
  Search: 'Search',
  X: 'X',
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
  ChevronDown: 'ChevronDown',
  ChevronUp: 'ChevronUp',
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock @elevenlabs/react-native
jest.mock('@elevenlabs/react-native', () => ({
  useConversation: () => ({
    startSession: jest.fn(() => Promise.resolve('session-id')),
    endSession: jest.fn(() => Promise.resolve()),
    getId: jest.fn(() => 'conversation-id'),
    sendUserMessage: jest.fn(() => Promise.resolve()),
    sendContextualUpdate: jest.fn(() => Promise.resolve()),
    setMicMuted: jest.fn(),
    sendFeedback: jest.fn(() => Promise.resolve()),
    canSendFeedback: true,
  }),
}));

// Mock @livekit/react-native
jest.mock('@livekit/react-native', () => ({
  Room: jest.fn(),
  LocalParticipant: jest.fn(),
  RemoteParticipant: jest.fn(),
  AudioTrack: jest.fn(),
  VideoTrack: jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock i18next
jest.mock('i18next', () => ({
  use: jest.fn(() => ({
    use: jest.fn(() => ({
      init: jest.fn(() => Promise.resolve()),
    })),
  })),
  t: (key) => key,
  changeLanguage: jest.fn(() => Promise.resolve()),
  language: 'en',
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});
