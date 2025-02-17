const charToNumber = (c: string): number => {
  if (c >= "0" && c <= "9") return parseInt(c); // Digits
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55; // Letters (A=10, B=11, ..., Z=35)
  if (c === "<") return 0; // Filler character
  return 0; // Invalid characters
};

// Calculate check digit for MRZ
const calculateCheckDigit = (data: string): number => {
  const weights = [7, 3, 1]; // Weights for check digit calculation
  const total = data
    .split("")
    .reduce(
      (sum, char, index) => sum + charToNumber(char) * weights[index % 3],
      0
    );
  return total % 10;
};

// MRZ Validation function
export const verifyMRZ = (
  passportNumber: string,
  dob: string,
  expiry: string,
  passportCheckDigit: string,
  dobCheckDigit: string,
  expiryCheckDigit: string
): boolean => {
  // Passport Number Check Digit Validation
  const passportCalculatedCheckDigit = calculateCheckDigit(passportNumber);
  const passportValid =
    passportCalculatedCheckDigit === parseInt(passportCheckDigit);

  // Date of Birth Check Digit Validation
  const dobCalculatedCheckDigit = calculateCheckDigit(dob);
  const dobValid = dobCalculatedCheckDigit === parseInt(dobCheckDigit);

  // Expiry Date Check Digit Validation
  const expiryCalculatedCheckDigit = calculateCheckDigit(expiry);
  const expiryValid = expiryCalculatedCheckDigit === parseInt(expiryCheckDigit);

  // Log results for debugging
  console.log({
    passportCalculatedCheckDigit,
    passportValid,
    dobCalculatedCheckDigit,
    dobValid,
    expiryCalculatedCheckDigit,
    expiryValid,
  });

  // Return true if all check digits are valid
  return passportValid && dobValid && expiryValid;
};
