import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface SignOutScreenProps {
  onSignOut: (visitorName: string) => Promise<void>;
  onCancel: () => void;
}

export const SignOutScreen: React.FC<SignOutScreenProps> = ({ onSignOut, onCancel }) => {
  const [visitorName, setVisitorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    if (!visitorName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignOut(visitorName);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Visitor Sign-Out</Text>
          <Text style={styles.subtitle}>Enter your name to sign out</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[styles.signOutButton, isSubmitting && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  signOutButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#374151',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 17,
    fontWeight: '600',
  },
});
