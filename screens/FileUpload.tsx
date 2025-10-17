import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Upload, File, CheckCircle, Trash2 } from "lucide-react-native";
import { useTheme } from "../theme/theme-context";
import { FileUploadScreenProps, MainRoutes } from "../types/navigation";
import DocumentPicker from 'react-native-document-picker';
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../store/auth-store";
import RNFS from 'react-native-fs';
import RNBlobUtil from 'react-native-blob-util';

const FileUpload: React.FC<FileUploadScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get the source parameter from route params if it exists
  const source = route.params?.source;

  // Get user-specific storage keys
  const getUserStorageKey = (baseKey: string): string => {
    return user?.id ? `${baseKey}_${user.id}` : baseKey;
  };

  const fileInfoKey = getUserStorageKey('userUploadedFile');
  const fileContentKey = getUserStorageKey('userUploadedFileContent');

  useEffect(() => {
    loadCurrentDocument();
  }, [user?.id]); // Reload when user changes

  const loadCurrentDocument = async () => {
    try {

      console.log('Using storage key:', fileInfoKey);

      const storedFile = await AsyncStorage.getItem(fileInfoKey);

      if (storedFile) {
        try {
          const parsedFile = JSON.parse(storedFile);
          console.log('Found document in storage:', parsedFile);

          // Also check if we have corresponding content
          const hasContent = await AsyncStorage.getItem(fileContentKey);
          console.log('Document has content:', hasContent);

          setCurrentDocument(parsedFile);
        } catch (parseError) {
          console.error('Error parsing stored file data:', parseError);
          // If data is corrupted, clear it
          await AsyncStorage.removeItem('userUploadedFile');
          await AsyncStorage.removeItem('userUploadedFileContent');
        }
      } else {
        console.log('No document found in storage');
      }
    } catch (error) {
      console.error('Error loading current document:', error);
    }
  };

  //   const selectDocument = async () => {
  //     // Check if user already has a document uploaded
  //     if (currentDocument) {
  //       Alert.alert(
  //         t('fileUpload.limitReached'),
  //         '',
  //         [{ text: t('common.cancel'), style: 'cancel' }]
  //       );
  //       return;
  //     }

  //     try {
  //       const result = await DocumentPicker.pick({
  //         type: [
  //           DocumentPicker.types.pdf, 
  //           // DocumentPicker.types.doc, 
  //           // DocumentPicker.types.docx,
  //           DocumentPicker.types.plainText,
  //           'text/plain'
  //         ],
  //         allowMultiSelection: false,
  //       });

  //       if (result && result.length > 0) {
  //         console.log('Selected document:', result[0]);
  //         setSelectedFile(result[0]);
  //         setUploadComplete(false);
  //       }
  //     } catch (err) {
  //       if (DocumentPicker.isCancel(err)) {
  //         // User cancelled the picker
  //       } else {
  //         console.error('Document picker error:', err);
  //       }
  //     }
  //   };

  //   const handleUpload = async () => {
  //     if (!selectedFile) {
  //       Alert.alert(t('fileUpload.noFileError'));
  //       return;
  //     }

  //     setUploading(true);

  //     try {
  //       // Simulate file upload with a delay
  //       await new Promise<void>((resolve) => setTimeout(resolve, 2000));

  //       // if (!user?.id) {
  //       //   console.error('No user logged in, cannot save file');
  //       //   Alert.alert(t('common.error'), t('fileUpload.loginRequired'));
  //       //   setUploading(false);
  //       //   return;
  //       // }

  //       // First clear any existing file data to avoid conflicts
  //       // console.log('Clearing existing file data before upload for user:', user.id);
  //       await AsyncStorage.multiRemove([fileInfoKey, fileContentKey]);

  //       // Store file info in AsyncStorage with user-specific key
  //       const fileData = {
  //         name: selectedFile.name || 'uploaded-file',
  //         uri: selectedFile.uri,
  //         type: selectedFile.type,
  //         size: selectedFile.size,
  //         uploadDate: new Date().toISOString(),
  //         userId: "141", // Store user ID with file data for verification
  //       };

  //       await AsyncStorage.setItem(fileInfoKey, JSON.stringify(fileData));
  //       console.log('Stored file metadata in AsyncStorage:', {
  //         name: fileData.name,
  //         type: fileData.type,
  //         size: fileData.size
  //       });

  //       // For text files, try to read and store the content
  //       let fileContent = ''; // Define outside the try block for wider scope

  //       try {
  //         if (selectedFile.type === 'text/plain' || 
  //             selectedFile.name?.endsWith('.txt') || 
  //             selectedFile.name?.endsWith('.md') ||
  //             selectedFile.name?.endsWith('.doc') ||
  //             selectedFile.name?.endsWith('.docx') ||
  //             selectedFile.name?.endsWith('.pdf')) {

  //           console.log('File type supported for content extraction');

  //           // In a real app, this would use a proper file reading mechanism
  //           // For this demo, we'll use a file content simulation based on the file type

  //           // Generate sample winery content with the file name as a possible indicator

  //           if (selectedFile.name?.toLowerCase().includes('silver') || Math.random() > 0.7) {
  //             fileContent = `
  // Silver Oak Winery

  // About Us:
  // Silver Oak is dedicated to producing only Cabernet Sauvignon. Our philosophy is to create wine that is deliciously drinkable upon release and can be cellared for decades. Founded in 1972, we operate two wineries - one in Napa Valley and one in Alexander Valley.

  // Tours and Tastings:
  // - Current Release Tasting: $50 per person, 60 minutes, features our Alexander Valley and Napa Valley Cabernet Sauvignons
  // - Food & Wine Pairing: $90 per person, 90 minutes, includes our Cabernets paired with seasonal small bites from our estate chef
  // - Library Tasting: $125 per person, 75 minutes, features a vertical tasting of our limited library wines
  // - Private Estate Tour: $200 per person (minimum 2 guests), 2 hours, behind-the-scenes tour with barrel samples and library wines

  // Visitor Information:
  // - Open daily from 10am - 5pm
  // - Reservations strongly recommended
  // - Last tasting begins at 4:00pm
  // - Large groups (8+) require advance booking of at least one week
  // - Family-friendly with designated areas for children
  // - Sustainable LEED-certified facilities

  // Contact:
  // - Phone: (707) 942-7022
  // - Email: hospitality@silveroak.com
  // - Napa Valley: 915 Oakville Cross Road, Oakville, CA 94562
  // - Alexander Valley: 7300 Highway 128, Healdsburg, CA 95448
  // `;
  //           } else if (selectedFile.name?.toLowerCase().includes('belle') || Math.random() > 0.7) {
  //             fileContent = `
  // Belle Glos Wines

  // About Us:
  // Belle Glos showcases distinctive Pinot Noirs produced from California's most noteworthy coastal wine-growing regions. We focus on vineyard-designated Pinot Noirs from throughout California's prime coastal growing areas.

  // Tours and Tastings:
  // - Signature Tasting: $40 per person, 45 minutes, features five current release Pinot Noirs
  // - Vineyard Terroir Tasting: $65 per person, 60 minutes, explore how different coastal terroirs influence Pinot Noir characteristics
  // - VIP Reserve Experience: $95 per person, 90 minutes, includes limited production wines and barrel samples
  // - Private Tasting: $120 per person (minimum 4 guests), includes all current releases and library selections

  // Visitor Information:
  // - Open Thursday-Monday, 11am - 6pm (Closed Tuesday-Wednesday)
  // - Reservations required for all experiences
  // - Walk-ins accommodated based on availability
  // - Groups larger than 6 require advance reservation
  // - Non-alcoholic options available upon request
  // - Dog-friendly patio seating available

  // Contact:
  // - Phone: (707) 473-2992
  // - Email: tastingroom@belleglos.com
  // - Address: 849 Zinfandel Lane, St. Helena, CA 94574
  // `;
  //           } else {
  //             fileContent = `
  // Opus One Winery

  // About Us:
  // Opus One is a collaboration between Baron Philippe de Rothschild of Château Mouton Rothschild and Robert Mondavi to create a single wine of exceptional quality. Located in Oakville, California, Opus One produces luxury wines from a blend of Bordeaux varieties, primarily Cabernet Sauvignon.

  // Tours and Tastings:
  // - Estate Tour & Tasting: $125 per person, 90 minutes, includes tour of the vineyard and winemaking facility plus tasting of current vintage
  // - Library Experience: $175 per person, 75 minutes, features current release and one library vintage
  // - Private Experience: $250 per person (minimum 2 guests), 2 hours, private tour with extended tasting including current release and two library vintages
  // - Collector's Tour: $350 per person (minimum 4 guests), 3 hours, comprehensive estate experience with rare vintages

  // Visitor Information:
  // - Open by appointment only, 10am - 4pm daily
  // - All visits require advance reservations
  // - Children under 21 welcome on tours but cannot participate in tastings
  // - Smart casual attire recommended
  // - Photography restrictions apply in certain areas
  // - All experiences conclude with a tasting in our elegant Salon or Partner's Room

  // Contact:
  // - Phone: (707) 944-9442
  // - Email: concierge@opusonewinery.com
  // - Address: 7900 St. Helena Highway, Oakville, CA 94562
  // `;
  //           }

  //           console.log('Generated file content length:', fileContent.length);

  //           // Use user-specific content key
  //           console.log('Using content storage key:', fileContentKey);

  //           // Clear existing content first
  //           await AsyncStorage.removeItem(fileContentKey);

  //           // Then store the new content with user-specific key
  //           await AsyncStorage.setItem(fileContentKey, fileContent);
  //           console.log('File content stored in AsyncStorage with key:', fileContentKey);
  //         }
  //       } catch (contentError) {
  //         console.error('Error storing file content:', contentError);
  //         // Continue even if content storage fails
  //       }

  //       // Verify content was stored
  //       try {
  //         const storedContent = await AsyncStorage.getItem(fileContentKey);
  //         // console.log('Verification - Content stored successfully for user', user.id, ':', 
  //         //   storedContent ? `Content length: ${storedContent.length}` : 'No content found');

  //         if (!storedContent) {
  //           console.error('Content verification failed - attempting to store again');
  //           // Try one more time with a different approach if verification failed
  //           if (fileContent) {
  //             await AsyncStorage.setItem(fileContentKey, fileContent);
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error verifying stored content:', error);
  //       }

  //       setCurrentDocument(fileData);
  //       setSelectedFile(null);
  //       setUploadComplete(true);
  //       setUploading(false);
  //     } catch (error) {
  //       console.error('Error uploading file:', error);
  //       setUploading(false);
  //       Alert.alert(t('fileUpload.uploadError'));
  //     }
  //   };


  const selectDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.plainText,
          'text/plain',
        ],
      });

      console.log('📂 Picker result:', res);

      let path = res.uri;
      let fileName = res.name || `file_${Date.now()}`;
      let content = '';

      // Handle iOS file:// URIs
      if (path.startsWith('file://')) {
        const cleanPath = path.replace('file://', '');
        content = await RNFS.readFile(cleanPath, 'utf8'); // txt only
      }
      // Handle Android content:// URIs
      else if (path.startsWith('content://')) {
        content = await RNBlobUtil.fs.readFile(path, 'utf8'); // txt only
      } else {
        throw new Error(`Unsupported URI: ${path}`);
      }

      // Update selected file with actual content
      setSelectedFile({ ...res, textContent: content });
      setUploadComplete(false);
      console.log('✅ File content loaded, length:', content);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled picker');
      } else {
        console.error('Document picker error:', err);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert(t('fileUpload.noFileError'));
      return;
    }

    setUploading(true);

    try {
      // Clear previous data
      await AsyncStorage.multiRemove([fileInfoKey, fileContentKey]);

      // Store metadata
      const fileData = {
        name: selectedFile.name || 'uploaded-file',
        uri: selectedFile.uri,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadDate: new Date().toISOString(),
        userId: "141",
      };
      await AsyncStorage.setItem(fileInfoKey, JSON.stringify(fileData));

      // Store actual file content
      if (selectedFile.textContent) {
        await AsyncStorage.setItem(fileContentKey, selectedFile.textContent);
        console.log('✅ File content stored, length:', selectedFile.textContent.length);
      } else {
        console.warn('⚠️ No file content to store');
      }

      setCurrentDocument(fileData);
      setSelectedFile(null);
      setUploadComplete(true);
      setUploading(false);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      Alert.alert(t('fileUpload.uploadError'));
    }
  };


  const handleDeleteDocument = async () => {
    Alert.alert(
      t('fileUpload.confirmDelete'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('fileUpload.deleteDocument'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('Deleting file and content from AsyncStorage for user:', user?.id);
              await AsyncStorage.removeItem(fileInfoKey);
              await AsyncStorage.removeItem(fileContentKey);

              // Verify deletion
              const checkFile = await AsyncStorage.getItem(fileInfoKey);
              const checkContent = await AsyncStorage.getItem(fileContentKey);
              console.log('Verification after deletion - File exists:', !!checkFile);
              console.log('Verification after deletion - Content exists:', !!checkContent);

              setCurrentDocument(null);
              setUploadComplete(false);
              Alert.alert(t('fileUpload.documentDeleted'));
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert(t('common.error'));
            }
            setDeleting(false);
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    // If user came from Profile, just go back instead of navigating to UserInfo
    if (source === 'Profile') {
      navigation.goBack();
    } else {
      navigation.navigate(MainRoutes.UserInfo);
    }
  };

  const renderCurrentDocument = () => {
    if (!currentDocument) {
      return (
        <View style={styles.noDocumentContainer}>
          <File size={48} color={colors.textSecondary} />
          <Text style={[styles.noDocumentText, { color: colors.textSecondary }]}>
            {t('fileUpload.noDocuments')}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.currentDocumentContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.currentDocumentHeader}>
          <Text style={[styles.currentDocumentTitle, { color: colors.text }]}>
            {t('fileUpload.currentDocument')}
          </Text>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleDeleteDocument}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Trash2 size={20} color={colors.error} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentInfo}>
          <File size={40} color={colors.primary} />
          <View style={styles.documentDetails}>
            <Text style={[styles.documentName, { color: colors.text }]} numberOfLines={1}>
              {currentDocument.name}
            </Text>
            <Text style={[styles.documentDate, { color: colors.textSecondary }]}>
              Uploaded: {new Date(currentDocument.uploadDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUploadArea = () => {
    if (currentDocument) {
      return null; // Don't show upload area if document exists
    }

    return (
      <View style={[styles.uploadArea, { backgroundColor: colors.surface }]}>
        {selectedFile ? (
          <>
            <View style={styles.selectedFileContainer}>
              <File size={64} color={colors.primary} />
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                {selectedFile.name || 'Selected document'}
              </Text>
            </View>

            {uploadComplete && (
              <View style={styles.successContainer}>
                <CheckCircle size={24} color={colors.success} />
                <Text style={[styles.successText, { color: colors.success }]}>
                  {t('fileUpload.uploadComplete')}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Upload size={64} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              {t('fileUpload.selectPrompt')}
            </Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
              {t('fileUpload.supportedFormats')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('fileUpload.title')}
        </Text>
      </View>

      <View style={styles.content}>
        {renderCurrentDocument()}
        {renderUploadArea()}

        {!currentDocument && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.surface }]}
              onPress={selectDocument}
              disabled={uploading}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                {t('fileUpload.selectDocument')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {uploading ? (
          <View style={[styles.uploadButton, { backgroundColor: colors.primaryLight }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : currentDocument ? (
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
          >
            <Text style={[styles.uploadButtonText, { color: colors.white }]}>
              {t('fileUpload.continue')}
            </Text>
          </TouchableOpacity>
        ) : uploadComplete ? (
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.success }]}
            onPress={handleContinue}
          >
            <Text style={[styles.uploadButtonText, { color: colors.white }]}>
              {t('fileUpload.continue')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: selectedFile ? colors.primary : colors.primaryLight }]}
            onPress={handleUpload}
            disabled={!selectedFile}
          >
            <Text
              style={[
                styles.uploadButtonText,
                { color: selectedFile ? colors.white : colors.textSecondary }
              ]}
            >
              {t('fileUpload.upload')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  currentDocumentContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentDocumentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  currentDocumentTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentDetails: {
    marginLeft: 16,
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
  },
  noDocumentContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noDocumentText: {
    fontSize: 16,
    marginTop: 12,
  },
  uploadArea: {
    height: 260,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  selectedFileContainer: {
    alignItems: "center",
    width: "100%",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    maxWidth: "90%",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FileUpload;
