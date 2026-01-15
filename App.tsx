import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ExpoLocation from 'expo-location';
import { SignaturePad } from './components/SignaturePad';
import { SuccessScreen } from './components/SuccessScreen';
import { SignOutScreen } from './components/SignOutScreen';
import { SignOutSuccessScreen } from './components/SignOutSuccessScreen';
import { DynamicFormField } from './components/DynamicFormField';
import { ServiceNowAPI } from './services/serviceNowAPI';
import { VisitorData, Location } from './types';
import { SERVICE_NOW_CONFIG } from './config';
import { findNearestLocation } from './services/geolocation';
import { getGoogleReviewUrl } from './services/googleReviewUrl';
import { getAppConfig, getAppVersion } from './utils/configLoader';

type AppScreen = 'sign-in' | 'sign-out' | 'sign-in-success' | 'sign-out-success';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('sign-in');
  const [visitorName, setVisitorName] = useState('');
  const [visitingPerson, setVisitingPerson] = useState('');
  const [purpose, setPurpose] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [signOutVisitorName, setSignOutVisitorName] = useState('');
  const [signOutGoogleReviewUrl, setSignOutGoogleReviewUrl] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // Load configuration
  const appConfig = getAppConfig();
  const appVersion = getAppVersion();

  // Fetch locations and detect user's location on mount
  useEffect(() => {
    async function setupLocation() {
      try {
        // Fetch locations from ServiceNow
        const api = new ServiceNowAPI(SERVICE_NOW_CONFIG);
        const fetchedLocations = await api.fetchLocations();
        setLocations(fetchedLocations);
        console.log(`Loaded ${fetchedLocations.length} locations`);

        // Request location permission
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          setIsLoadingLocation(false);
          return;
        }

        // Get current position
        const position = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });
        
        console.log('User location:', position.coords.latitude, position.coords.longitude);

        // Find nearest location
        const nearest = findNearestLocation(
          position.coords.latitude,
          position.coords.longitude,
          fetchedLocations
        );

        if (nearest) {
          setDetectedLocation(nearest);
          console.log('Detected facility:', nearest.name);
        } else {
          console.log('No nearby location found');
        }
      } catch (error) {
        console.error('Error setting up location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    }

    setupLocation();
  }, []);

  const handleSignatureComplete = (signatureData: string) => {
    setSignature(signatureData);
  };

  const validateForm = (): boolean => {
    if (!visitorName.trim()) {
      Alert.alert('Error', appConfig.messages.validationErrorName);
      return false;
    }
    if (!visitingPerson.trim()) {
      Alert.alert('Error', appConfig.messages.validationErrorVisiting);
      return false;
    }
    if (!purpose.trim()) {
      Alert.alert('Error', appConfig.messages.validationErrorPurpose);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', appConfig.messages.validationErrorPhone);
      return false;
    }
    if (!signature) {
      Alert.alert('Error', appConfig.messages.validationErrorSignature);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Form data:', { visitorName, visitingPerson, purpose, phoneNumber, hasSignature: !!signature });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validated, starting submission...');
    setIsSubmitting(true);

    try {
      const visitorData: VisitorData = {
        visitorName,
        visitingPerson,
        purpose,
        phoneNumber,
        signature,
        location: detectedLocation?.sys_id,
      };

      console.log('Creating ServiceNow API instance...');
      const api = new ServiceNowAPI(SERVICE_NOW_CONFIG);
      console.log('Submitting visitor sign-in...');
      const result = await api.submitVisitorSignIn(visitorData);

      console.log('Submission successful:', result);
      setCurrentScreen('sign-in-success');
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error details:', error);
      Alert.alert(
        'Error',
        appConfig.messages.submitError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewVisitor = () => {
    setVisitorName('');
    setVisitingPerson('');
    setPurpose('');
    setPhoneNumber('');
    setSignature('');
    setCurrentScreen('sign-in');
  };

  const handleDoneSignIn = () => {
    setVisitorName('');
    setVisitingPerson('');
    setPurpose('');
    setPhoneNumber('');
    setSignature('');
    setCurrentScreen('sign-in');
  };

  const handleSignOutClick = () => {
    setCurrentScreen('sign-out');
  };

  const handleSignOutCancel = () => {
    setCurrentScreen('sign-in');
  };

  const handleSignOut = async (name: string) => {
    try {
      const api = new ServiceNowAPI(SERVICE_NOW_CONFIG);
      await api.submitVisitorSignOut(name);
      setSignOutVisitorName(name);
      
      // Get Google review URL from detected location
      if (detectedLocation) {
        const reviewUrl = getGoogleReviewUrl(detectedLocation);
        setSignOutGoogleReviewUrl(reviewUrl);
        console.log('Generated review URL for:', detectedLocation.name, reviewUrl);
      } else {
        console.log('No location detected for review URL');
      }
      
      setCurrentScreen('sign-out-success');
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to sign out. Please try again.'
      );
      throw error;
    }
  };

  const handleDoneSignOut = () => {
    setSignOutVisitorName('');
    setSignOutGoogleReviewUrl(null);
    setCurrentScreen('sign-in');
  };

  if (currentScreen === 'sign-in-success') {
    return (
      <SuccessScreen 
        visitorName={visitorName} 
        onNewVisitor={handleNewVisitor}
        onDone={handleDoneSignIn}
      />
    );
  }

  if (currentScreen === 'sign-out') {
    return (
      <SignOutScreen
        onSignOut={handleSignOut}
        onCancel={handleSignOutCancel}
      />
    );
  }

  if (currentScreen === 'sign-out-success') {
    return (
      <SignOutSuccessScreen
        visitorName={signOutVisitorName}
        googleReviewUrl={signOutGoogleReviewUrl}
        onDone={handleDoneSignOut}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{appConfig.app.title}</Text>
          <Text style={styles.subtitle}>{appConfig.app.subtitle}</Text>
          {isLoadingLocation && (
            <Text style={styles.locationText}>{appConfig.messages.locationDetecting}</Text>
          )}
          {!isLoadingLocation && detectedLocation && (
            <Text style={styles.locationText}>📍 {detectedLocation.name}</Text>
          )}
          <Text style={styles.versionText}>v{appVersion}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{appConfig.formFields[0].label} *</Text>
          <DynamicFormField
            field={appConfig.formFields[0]}
            value={visitorName}
            onChangeText={setVisitorName}
            style={styles.input}
          />

          <Text style={styles.label}>{appConfig.formFields[1].label} *</Text>
          <DynamicFormField
            field={appConfig.formFields[1]}
            value={visitingPerson}
            onChangeText={setVisitingPerson}
            style={styles.input}
          />

          <Text style={styles.label}>{appConfig.formFields[2].label} *</Text>
          <DynamicFormField
            field={appConfig.formFields[2]}
            value={purpose}
            onChangeText={setPurpose}
            style={styles.input}
          />

          <Text style={styles.label}>{appConfig.formFields[3].label} *</Text>
          <DynamicFormField
            field={appConfig.formFields[3]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
          />

          <Text style={styles.label}>{appConfig.formFields[4].label} *</Text>
          <SignaturePad 
            onSignatureComplete={handleSignatureComplete}
            onDrawStart={() => setScrollEnabled(false)}
            onDrawEnd={() => setScrollEnabled(true)}
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{appConfig.buttons.submit}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOutClick}
            disabled={isSubmitting}
          >
            <Text style={styles.signOutButtonText}>{appConfig.buttons.signOut}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  locationText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f44336',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#f44336',
    fontSize: 17,
    fontWeight: '600',
  },
});
