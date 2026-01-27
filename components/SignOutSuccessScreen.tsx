import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAppConfig } from '../utils/configLoader';
import { ServiceNowAPI } from '../services/serviceNowAPI';
import { SERVICE_NOW_CONFIG } from '../config';

interface SignOutSuccessScreenProps {
  visitorName: string;
  recordId: string | null;
  googleReviewUrl: string | null;
  onDone: () => void;
}

export const SignOutSuccessScreen: React.FC<SignOutSuccessScreenProps> = ({ 
  visitorName,
  recordId,
  googleReviewUrl,
  onDone 
}) => {
  const appConfig = getAppConfig();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  const handleStarPress = async (rating: number) => {
    if (isSubmittingRating || !recordId) return;
    
    setSelectedRating(rating);
    setIsSubmittingRating(true);
    
    try {
      const api = new ServiceNowAPI(SERVICE_NOW_CONFIG);
      await api.updateVisitorRating(recordId, rating);
      console.log('Rating submitted successfully:', rating);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
      setSelectedRating(null);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.successBox}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>{appConfig.messages.signOutSuccessTitle}</Text>
        <Text style={styles.message}>
          Thank you, {visitorName}!{'\n'}
          {appConfig.messages.signOutSuccessMessage}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>How was your visit?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                disabled={isSubmittingRating}
                style={styles.starButton}
              >
                <Text style={[
                  styles.star,
                  selectedRating && star <= selectedRating && styles.starSelected
                ]}>
                  {selectedRating && star <= selectedRating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedRating && (
            <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
          )}
        </View>
        
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
  ratingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 48,
    color: '#ddd',
  },
  starSelected: {
    color: '#FFB800',
  },
  thankYouText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 15,
    fontWeight: '500',
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
