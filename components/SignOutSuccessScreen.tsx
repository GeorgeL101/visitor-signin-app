import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface SignOutSuccessScreenProps {
  visitorName: string;
  googleReviewUrl: string | null;
  onDone: () => void;
}

export const SignOutSuccessScreen: React.FC<SignOutSuccessScreenProps> = ({ 
  visitorName,
  googleReviewUrl,
  onDone 
}) => {
  const handleReviewPress = () => {
    if (googleReviewUrl) {
      Linking.openURL(googleReviewUrl).catch(err => {
        console.error('Failed to open review URL:', err);
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.successBox}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Sign-Out Complete!</Text>
        <Text style={styles.message}>
          Thank you, {visitorName}!{'\n'}
          Your departure has been recorded.
        </Text>
        
        {googleReviewUrl && (
          <TouchableOpacity 
            style={styles.reviewButton} 
            onPress={handleReviewPress}
          >
            <Text style={styles.reviewButtonText}>⭐ Leave a Review</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.button} onPress={onDone}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 500,
    width: '100%',
  },
  checkmark: {
    fontSize: 80,
    color: '#4CAF50',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
