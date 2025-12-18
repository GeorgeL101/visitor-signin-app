import {
  ServiceNowConfig,
  ServiceNowRecord,
  ServiceNowResponse,
  AttachmentResponse,
  VisitorData,
} from '../types';
import { encode, decode } from 'base-64';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export class ServiceNowAPI {
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;
  }

  /**
   * Creates a Base64 encoded authentication header
   */
  private getAuthHeader(): string {
    const credentials = `${this.config.username}:${this.config.password}`;
    // For React Native, we use base-64 library
    return `Basic ${encode(credentials)}`;
  }

  /**
   * Creates a visitor record in ServiceNow with signature
   */
  async createVisitorRecord(visitorData: VisitorData): Promise<string> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}`;

    const record: ServiceNowRecord = {
      u_vistor_name: visitorData.visitorName,
      u_visiting_person: visitorData.visitingPerson,
      u_purpose: visitorData.purpose,
      u_phone_number: visitorData.phoneNumber,
      u_sign_in_time: new Date().toISOString(),
      // Signature will be uploaded separately to the u_signature image field
    };

    try {
      console.log('Attempting to connect to:', url);
      console.log('With auth header:', this.getAuthHeader().substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: JSON.stringify(record),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to create record: ${response.status} - ${errorText}`);
      }

      const data: ServiceNowResponse = await response.json();
      return data.result.sys_id;
    } catch (error) {
      console.error('Error creating visitor record:', error);
      console.error('Error type:', error instanceof TypeError ? 'TypeError' : typeof error);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  /**
   * Uploads signature image as an attachment to a ServiceNow record's image field
   */
  async uploadSignature(recordId: string, signatureBase64: string): Promise<string> {
    try {
      console.log('Uploading signature to field u_signature');
      
      // Remove data URI prefix to get pure base64
      const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
      
      if (Platform.OS === 'web') {
        // Web implementation using fetch with FormData
        return await this.uploadSignatureWeb(recordId, base64Data);
      } else {
        // Native implementation using expo-file-system
        return await this.uploadSignatureNative(recordId, base64Data);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }
  }

  /**
   * Web-specific signature upload using fetch and FormData
   */
  private async uploadSignatureWeb(recordId: string, base64Data: string): Promise<string> {
    // Remove the data URL prefix and convert base64 to binary
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    
    // Use the /file endpoint with query parameters - send raw blob
    const url = `${this.config.instanceUrl}/api/now/attachment/file?table_name=${this.config.tableName}&table_sys_id=${recordId}&file_name=signature.png`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'image/png',
      },
      body: blob,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      throw new Error(`Failed to upload signature: ${response.status} - ${errorText}`);
    }
    
    const data: AttachmentResponse = await response.json();
    console.log('Signature uploaded successfully:', data.result.sys_id);
    return data.result.sys_id;
  }

  /**
   * Native-specific signature upload using expo-file-system
   */
  private async uploadSignatureNative(recordId: string, base64Data: string): Promise<string> {
    // Write base64 to temporary file
    const fileUri = `${FileSystem.cacheDirectory}signature_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: 'base64',
    });
    
    console.log('Temporary file created:', fileUri);
    
    // Use proper ServiceNow attachment upload endpoint with multipart
    const uploadResult = await FileSystem.uploadAsync(
      `${this.config.instanceUrl}/api/now/attachment/upload`,
      fileUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'uploadFile',
        parameters: {
          table_name: this.config.tableName,
          table_sys_id: recordId,
          field_name: 'u_signature',
        },
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      }
    );

    console.log('Upload response status:', uploadResult.status);
    
    // Clean up temporary file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    
    if (uploadResult.status !== 200 && uploadResult.status !== 201) {
      console.error('Upload error:', uploadResult.body);
      throw new Error(`Failed to upload signature: ${uploadResult.status} - ${uploadResult.body}`);
    }

    const data: AttachmentResponse = JSON.parse(uploadResult.body);
    console.log('Signature uploaded successfully:', data.result.sys_id);
    return data.result.sys_id;
  }

  /**
   * Main method to submit complete visitor sign-in with signature
   */
  async submitVisitorSignIn(visitorData: VisitorData): Promise<{
    recordId: string;
    attachmentId: string;
  }> {
    try {
      // Step 1: Create the visitor record
      const recordId = await this.createVisitorRecord(visitorData);
      console.log('Created visitor record:', recordId);

      // Step 2: Upload signature to the u_signature image field
      const attachmentId = await this.uploadSignature(recordId, visitorData.signature);
      console.log('Uploaded signature to image field');

      return { recordId, attachmentId };
    } catch (error) {
      console.error('Error submitting visitor sign-in:', error);
      throw error;
    }
  }
}
