export interface VisitorData {
  visitorName: string;
  visitingPerson: string;
  purpose: string;
  phoneNumber: string;
  signature: string; // base64 encoded image
}

export interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
  tableName: string; // e.g., 'u_visitor_log'
}

export interface ServiceNowRecord {
  u_vistor_name?: string;
  u_visiting_person?: string;
  u_purpose?: string;
  u_phone_number?: string;
  u_sign_in_time?: string;
  u_signature?: string; // Base64 image data for image field
}

export interface ServiceNowResponse {
  result: {
    sys_id: string;
    [key: string]: any;
  };
}

export interface AttachmentResponse {
  result: {
    sys_id: string;
    file_name: string;
    [key: string]: any;
  };
}
