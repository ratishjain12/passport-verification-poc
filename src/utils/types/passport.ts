export interface PassportMRZData {
  passportNumber: string;
  passportCheckDigit: string;
  nationality: string;
  dob: string;
  dobCheckDigit: string;
  sex: string;
  expiry: string;
  expiryCheckDigit: string;
  personalNumber: string;
  finalCheckDigit: string;
}

export interface ExtractedPassportData {
  name: string;
  date_of_birth: string;
  passport_number: string;
  expiry_date: string;
  mrz: string;
  city?: string;
  address1: string;
  address2?: string;
  postalCode?: string;
  state?: string;
  country?: string;
}

export interface ValidationParams {
  inputName: string;
  inputDOB: string;
  inputPassportNumber: string;
  extractedData: ExtractedPassportData;
  mrz: string;
}

export interface ValidationResult {
  isValid: boolean;
  details: {
    isValidName: boolean;
    isValidDOB: boolean;
    isValidPassport: boolean;
    isValidExpiry: boolean;
  };
}

export interface GoogleSheetsData {
  name: string;
  dob: string;
  passportNumber: string;
  expiry: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  address1?: string;
  address2?: string;
  isValid: boolean;
  frontImageUrl: string;
  backImageUrl: string;
}
