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
  mrz: string;
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
    isValidMRZ: boolean;
  };
}

export interface GoogleSheetsData {
  name: string;
  dob: string;
  passportNumber: string;
  isValid: boolean;
  frontImageUrl: string;
  backImageUrl: string;
}
