import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SuccessScreenProps {
  visitorName: string;
  onNewVisitor: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ visitorName, onNewVisitor }) => {
  return (
    <View style={styles.container}>
      <View style={styles.successBox}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Sign-In Complete!</Text>
        <Text style={styles.message}>
          Thank you, {visitorName}!{'\n'}
          Your visit has been recorded.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onNewVisitor}>
          <Text style={styles.buttonText}>Sign In Another Visitor</Text>
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
    marginBottom: 30,
    lineHeight: 26,
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
