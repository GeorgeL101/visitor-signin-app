import { ServiceNowConfig } from './types';

/**
 * ServiceNow Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to 'config.ts'
 * 2. Replace the placeholder values with your actual ServiceNow credentials
 * 3. Make sure 'config.ts' is in your .gitignore to keep credentials secure
 */

export const SERVICE_NOW_CONFIG: ServiceNowConfig = {
  // Your ServiceNow instance URL (without trailing slash)
  // Example: 'https://dev12345.service-now.com'
  instanceUrl: 'https://YOUR_INSTANCE.service-now.com',
  
  // ServiceNow username with API access
  username: 'YOUR_USERNAME',
  
  // ServiceNow password
  password: 'YOUR_PASSWORD',
  
  // The table name in ServiceNow where visitor records will be stored
  // This should be a custom table you create in ServiceNow
  // Example: 'u_visitor_log'
  tableName: 'u_visitor_log',
};

/**
 * SERVICENOW TABLE SETUP:
 * 
 * Create a custom table in ServiceNow with these fields:
 * - u_visitor_name (String)
 * - u_visiting_person (String)
 * - u_purpose (String)
 * - u_phone_number (String)
 * - u_sign_in_time (Date/Time)
 * 
 * The signature will be attached as an attachment to each record.
 */
