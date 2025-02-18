const charToNumber = (c: string): number => {
  if (c >= "0" && c <= "9") return parseInt(c);
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55;
  if (c === "<") return 0;
  return 0;
};

const calculateCheckDigit = (data: string): number => {
  const weights = [7, 3, 1];
  const total = data
    .split("")
    .reduce(
      (sum, char, index) => sum + charToNumber(char) * weights[index % 3],
      0
    );
  return total % 10;
};

export const verifyMRZ = (
  passportNumber: string,
  dob: string,
  expiry: string,
  passportCheckDigit: string,
  dobCheckDigit: string,
  expiryCheckDigit: string
): boolean => {
  const passportCalculatedCheckDigit = calculateCheckDigit(passportNumber);
  const dobCalculatedCheckDigit = calculateCheckDigit(dob);
  const expiryCalculatedCheckDigit = calculateCheckDigit(expiry);

  const passportValid =
    passportCalculatedCheckDigit === parseInt(passportCheckDigit);
  const dobValid = dobCalculatedCheckDigit === parseInt(dobCheckDigit);
  const expiryValid = expiryCalculatedCheckDigit === parseInt(expiryCheckDigit);

  console.log({
    passportCalculatedCheckDigit,
    passportValid,
    dobCalculatedCheckDigit,
    dobValid,
    expiryCalculatedCheckDigit,
    expiryValid,
  });

  return passportValid && dobValid && expiryValid;
};
