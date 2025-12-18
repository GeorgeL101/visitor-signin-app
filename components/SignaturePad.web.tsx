import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignatureComplete: (signature: string) => void;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSignatureComplete, 
  onDrawStart, 
  onDrawEnd 
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    signatureRef.current?.clear();
    setIsEmpty(true);
    onSignatureComplete('');
  };

  const handleConfirm = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      onSignatureComplete(dataUrl);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
    onDrawStart?.();
  };

  const handleEnd = () => {
    onDrawEnd?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.signatureContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onBegin={handleBegin}
          onEnd={handleEnd}
          canvasProps={{
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
            }
          }}
          backgroundColor="#FFFFFF"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.confirmButton, isEmpty && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={isEmpty}
        >
          <Text style={styles.buttonText}>Confirm Signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  signatureContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 6,
    marginRight: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 6,
    marginLeft: 5,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});
