import {
  ServiceNowConfig,
  ServiceNowRecord,
  ServiceNowResponse,
  AttachmentResponse,
  VisitorData,
  Location,
} from '../types';
import { encode, decode } from 'base-64';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getAppConfig } from '../utils/configLoader';

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
   * Gets current date/time in UTC for ServiceNow
   * ServiceNow stores as UTC and displays in user's timezone (US/Eastern)
   */
  private getCurrentDateTime(): string {
    const now = new Date();
    
    // Use UTC components - ServiceNow will convert to user's timezone for display
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log('Sending datetime to ServiceNow (UTC):', formatted);
    return formatted;
  }

  /**
   * Gets today's date in YYYY-MM-DD format for queries
   */
  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Creates a visitor record in ServiceNow with signature
   */
  async createVisitorRecord(visitorData: VisitorData & { [key: string]: any }): Promise<string> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}`;
    const appConfig = getAppConfig();

    const record: ServiceNowRecord = {
      u_sign_in_time: this.getCurrentDateTime(),
    };

    // Dynamically map form fields to ServiceNow fields based on config
    for (const field of appConfig.formFields) {
      if (field.serviceNowField && field.type !== 'signature') {
        const value = visitorData[field.id];
        if (value !== undefined && value !== null) {
          record[field.serviceNowField] = value;
        }
      }
    }

    // Add facility if provided
    if (visitorData.location) {
      record.u_facility = visitorData.location;
    }

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
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
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

  /**
   * Finds the most recent visitor record for today by name
   */
  async findTodaysVisitorRecord(visitorName: string): Promise<any | null> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}`;
    
    // Simple query - just match name and order by sys_created_on (created date)
    // Get multiple records and filter client-side to avoid permission issues with datetime queries
    // Note: Don't use encodeURIComponent here as URLSearchParams handles encoding
    const queryParams = new URLSearchParams({
      sysparm_query: `u_vistor_name=${visitorName}^ORDERBYDESCsys_created_on`,
      sysparm_limit: '10',
    });

    try {
      console.log('Querying for visitor:', visitorName);
      console.log('Query URL:', `${url}?${queryParams.toString()}`);
      
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Query error:', errorText);
        throw new Error(`Failed to query records: ${response.status} - ${errorText}`);
      }

      const data: any = await response.json();
      
      if (data.result && data.result.length > 0) {
        console.log('Found', data.result.length, 'record(s) for visitor');
        
        // Filter records to find one from today (client-side filtering)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        console.log('Looking for records from:', today.toLocaleDateString());
        
        for (const record of data.result) {
          console.log('Checking record:', record.sys_id);
          console.log('  Created:', record.sys_created_on);
          console.log('  Sign-in time:', record.u_sign_in_time);
          
          // Check if sys_created_on or u_sign_in_time is from today (local date)
          const createdDate = new Date(record.sys_created_on || record.u_sign_in_time);
          const createdDateOnly = new Date(createdDate);
          createdDateOnly.setHours(0, 0, 0, 0);
          
          console.log('  Record date:', createdDateOnly.toLocaleDateString());
          console.log('  Today:', today.toLocaleDateString());
          console.log('  Match:', createdDateOnly.getTime() === todayTimestamp);
          
          if (createdDateOnly.getTime() === todayTimestamp) {
            console.log('Found visitor record from today:', record.sys_id);
            return record;
          }
        }
        
        console.log('No visitor record found from today');
        console.log('Returning most recent record as fallback:', data.result[0].sys_id);
        // Return the most recent record as fallback
        return data.result[0];
      }
      
      console.log('No matching visitor record found');
      return null;
    } catch (error) {
      console.error('Error querying visitor record:', error);
      throw error;
    }
  }

  /**
   * Updates a visitor record with rating
   */
  async updateVisitorRating(recordId: string, rating: number): Promise<void> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}/${recordId}`;

    const updateData = {
      u_rating: rating.toString(),
    };

    try {
      console.log('Updating record with rating:', recordId, rating);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        throw new Error(`Failed to update rating: ${response.status} - ${errorText}`);
      }

      console.log('Rating recorded successfully');
    } catch (error) {
      console.error('Error updating visitor rating:', error);
      throw error;
    }
  }

  /**
   * Updates a visitor record with sign-out information
   */
  async updateVisitorSignOut(recordId: string, visitorName: string): Promise<void> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}/${recordId}`;

    const updateData = {
      u_visitor_name_signed_out: visitorName,
      u_sign_out_time: this.getCurrentDateTime(),
    };

    try {
      console.log('Updating record with sign-out:', recordId);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        throw new Error(`Failed to update record: ${response.status} - ${errorText}`);
      }

      console.log('Sign-out recorded successfully');
    } catch (error) {
      console.error('Error updating visitor sign-out:', error);
      throw error;
    }
  }

  /**
   * Fetch all locations from ServiceNow with lat/long coordinates
   */
  async fetchLocations(): Promise<Location[]> {
    const url = `${this.config.instanceUrl}/api/now/table/cmn_location`;
    
    // Query for locations that have latitude and longitude
    const queryParams = new URLSearchParams({
      sysparm_query: 'latitudeISNOTEMPTY^longitudeISNOTEMPTY',
      sysparm_fields: 'sys_id,name,street,city,zip,latitude,longitude,u_google_survey_url,u_google_place_id',
    });
    
    try {
      console.log('Fetching locations from ServiceNow...');
      
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch locations error:', errorText);
        throw new Error(`Failed to fetch locations: ${response.status} - ${errorText}`);
      }
      
      const data: any = await response.json();
      
      const locations: Location[] = data.result.map((record: any) => ({
        sys_id: record.sys_id,
        name: record.name,
        address: record.street || '',
        city: record.city || '',
        zip: record.zip || '',
        latitude: record.latitude ? parseFloat(record.latitude) : undefined,
        longitude: record.longitude ? parseFloat(record.longitude) : undefined,
        googleSurveyUrl: record.u_google_survey_url || undefined,
        googlePlaceId: record.u_google_place_id || undefined,
      }));
      
      console.log(`Fetched ${locations.length} locations from ServiceNow`);
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Main method to submit visitor sign-out
   * Returns the record sys_id and facility sys_id
   */
  async submitVisitorSignOut(visitorName: string): Promise<{ recordId: string; facilitySysId: string | null }> {
    try {
      // Step 1: Find the most recent record for this visitor today
      const record = await this.findTodaysVisitorRecord(visitorName);
      
      if (!record) {
        throw new Error('No sign-in record found for today. Please check the name and try again.');
      }

      // Check if already signed out
      if (record.u_sign_out_time) {
        throw new Error('This visitor has already signed out.');
      }

      // Step 2: Update the record with sign-out info
      await this.updateVisitorSignOut(record.sys_id, visitorName);
      
      // Return both the record ID and facility sys_id
      return {
        recordId: record.sys_id,
        facilitySysId: record.u_facility || null,
      };
    } catch (error) {
      console.error('Error submitting visitor sign-out:', error);
      throw error;
    }
  }
}
