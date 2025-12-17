import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

interface SignaturePadProps {
  onSignatureComplete: (signature: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureComplete }) => {
  const signatureRef = useRef<any>(null);

  const handleSignature = (signature: string) => {
    onSignatureComplete(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const style = `.m-signature-pad {
    box-shadow: none;
    border: none;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body,html {
    width: 100%;
    height: 100%;
  }`;

  return (
    <View style={styles.container}>
      <View style={styles.signatureContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleSignature}
          descriptionText="Sign here"
          clearText="Clear"
          confirmText="Save"
          webStyle={style}
          autoClear={false}
          imageType="image/png"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
