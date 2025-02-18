import { PassportMRZData } from "../types/passport";

export const parseMRZ = (mrz: string): PassportMRZData => {
  const lines = mrz.split("\n");

  if (lines.length < 2) {
    throw new Error("Invalid MRZ format: Expected two lines.");
  }

  const line2 = lines[1];
  console.log("Second Line of MRZ:", line2);
  console.log(line2.charAt(9));

  return {
    passportNumber: line2.substring(0, 9),
    passportCheckDigit: line2.charAt(9),
    nationality: line2.substring(10, 13),
    dob: line2.substring(13, 19),
    dobCheckDigit: line2.charAt(19),
    sex: line2.charAt(20),
    expiry: line2.substring(21, 27),
    expiryCheckDigit: line2.charAt(27),
    personalNumber: line2.substring(28, 42),
    finalCheckDigit: line2.charAt(42),
  };
};
