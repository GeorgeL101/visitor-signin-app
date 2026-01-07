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
import { ServiceNowAPI } from './services/serviceNowAPI';
import { VisitorData, Location } from './types';
import { SERVICE_NOW_CONFIG } from './config';
import { findNearestLocation } from './services/geolocation';
import { getGoogleReviewUrl } from './services/googleReviewUrl';

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
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!visitingPerson.trim()) {
      Alert.alert('Error', 'Please enter who you are visiting');
      return false;
    }
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please enter the purpose of your visit');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!signature) {
      Alert.alert('Error', 'Please provide your signature');
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
        'Failed to submit sign-in. Please check your connection and try again.'
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
          <Text style={styles.title}>Visitor Sign-In</Text>
          <Text style={styles.subtitle}>Please complete all fields</Text>
          {isLoadingLocation && (
            <Text style={styles.locationText}>Detecting location...</Text>
          )}
          {!isLoadingLocation && detectedLocation && (
            <Text style={styles.locationText}>📍 {detectedLocation.name}</Text>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Visiting *</Text>
          <TextInput
            style={styles.input}
            value={visitingPerson}
            onChangeText={setVisitingPerson}
            placeholder="Who are you here to see?"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Purpose of Visit *</Text>
          <TextInput
            style={styles.input}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Reason for visit"
            autoCapitalize="sentences"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            returnKeyType="done"
            blurOnSubmit={true}
          />

          <Text style={styles.label}>Signature *</Text>
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
              <Text style={styles.submitButtonText}>Submit Sign-In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOutClick}
            disabled={isSubmitting}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
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
