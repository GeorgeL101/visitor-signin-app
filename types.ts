export interface Location {
  sys_id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  googleSurveyUrl?: string;
  googlePlaceId?: string;
}

export interface VisitorData {
  visitorName: string;
  visitingPerson: string;
  purpose: string;
  phoneNumber: string;
  signature: string; // base64 encoded image
  location?: string; // sys_id of the location
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
  u_facility?: string; // sys_id of the facility/location
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

export interface VisitorRecord {
  sys_id: string;
  u_vistor_name: string;
  u_visiting_person: string;
  u_purpose: string;
  u_phone_number: string;
  u_sign_in_time: string;
  u_visitor_name_sign_out?: string;
  u_sign_out_time?: string;
  [key: string]: any;
}

export interface ServiceNowQueryResponse {
  result: VisitorRecord[];
}
