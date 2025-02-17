export const parseMRZ = (mrz: string) => {
  // Two-line MRZ: Split into lines
  const lines = mrz.split("\n");

  if (lines.length < 2) {
    throw new Error("Invalid MRZ format: Expected two lines.");
  }

  const line2 = lines[1]; // Second line of MRZ
  console.log("Second Line of MRZ:", line2);

  // Parse fields from the second line
  const parsedFields = {
    passportNumber: line2.substring(0, 9), // Characters 0–8
    passportCheckDigit: line2.charAt(9), // Character 9
    nationality: line2.substring(10, 13), // Characters 10–12
    dob: line2.substring(13, 19), // Characters 13–18
    dobCheckDigit: line2.charAt(19), // Character 19
    sex: line2.charAt(20), // Character 20
    expiry: line2.substring(21, 27), // Characters 21–26
    expiryCheckDigit: line2.charAt(27), // Character 27
    personalNumber: line2.substring(28, 42), // Characters 28–41
    finalCheckDigit: line2.charAt(42), // Character 42
  };

  return parsedFields;
};
