import formConfig from '../config/formConfig.json';

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  autoCapitalize?: string;
  keyboardType?: string;
  order: number;
  options?: string[]; // For dropdown fields
}

export interface AppConfig {
  version: string;
  versionHistory: Array<{
    version: string;
    timestamp: string;
    changes: string;
  }>;
  app: {
    title: string;
    subtitle: string;
  };
  formFields: FormField[];
  buttons: {
    submit: string;
    signOut: string;
  };
  messages: {
    locationDetecting: string;
    submitSuccess: string;
    submitError: string;
    validationErrorName: string;
    validationErrorVisiting: string;
    validationErrorPurpose: string;
    validationErrorPhone: string;
    validationErrorSignature: string;
  };
  serviceNow: {
    instanceUrl: string;
    username: string;
    password: string;
    tableName: string;
  };
}

export const getAppConfig = (): AppConfig => {
  return formConfig as AppConfig;
};

export const getFormFields = (): FormField[] => {
  return formConfig.formFields.sort((a, b) => a.order - b.order);
};

export const getFieldById = (fieldId: string): FormField | undefined => {
  return formConfig.formFields.find(field => field.id === fieldId);
};

export const getAppVersion = (): string => {
  return formConfig.version;
};
