import {
  ServiceNowConfig,
  ServiceNowRecord,
  ServiceNowResponse,
  AttachmentResponse,
  VisitorData,
} from '../types';

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
    // For React Native, we use btoa equivalent
    return `Basic ${btoa(credentials)}`;
  }

  /**
   * Creates a visitor record in ServiceNow
   */
  async createVisitorRecord(visitorData: VisitorData): Promise<string> {
    const url = `${this.config.instanceUrl}/api/now/table/${this.config.tableName}`;

    const record: ServiceNowRecord = {
      u_visitor_name: visitorData.visitorName,
      u_visiting_person: visitorData.visitingPerson,
      u_purpose: visitorData.purpose,
      u_phone_number: visitorData.phoneNumber,
      u_sign_in_time: new Date().toISOString(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create record: ${response.status} - ${errorText}`);
      }

      const data: ServiceNowResponse = await response.json();
      return data.result.sys_id;
    } catch (error) {
      console.error('Error creating visitor record:', error);
      throw error;
    }
  }

  /**
   * Uploads signature image as an attachment to a ServiceNow record
   */
  async uploadSignature(recordId: string, signatureBase64: string): Promise<string> {
    const url = `${this.config.instanceUrl}/api/now/attachment/upload`;

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: base64Data,
      });

      // Add query parameters for attachment metadata
      const urlWithParams = `${url}?table_name=${this.config.tableName}&table_sys_id=${recordId}&file_name=visitor_signature.png`;

      const responseWithMetadata = await fetch(urlWithParams, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        body: base64Data,
      });

      if (!responseWithMetadata.ok) {
        const errorText = await responseWithMetadata.text();
        throw new Error(`Failed to upload signature: ${responseWithMetadata.status} - ${errorText}`);
      }

      const data: AttachmentResponse = await responseWithMetadata.json();
      return data.result.sys_id;
    } catch (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }
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

      // Step 2: Upload the signature as an attachment
      const attachmentId = await this.uploadSignature(recordId, visitorData.signature);
      console.log('Uploaded signature:', attachmentId);

      return { recordId, attachmentId };
    } catch (error) {
      console.error('Error submitting visitor sign-in:', error);
      throw error;
    }
  }
}
