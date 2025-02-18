import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  passportDetails: {
    name: string;
    dateOfBirth: string;
    passportNumber: string;
    isVerified: boolean;
  };
  validationDetails?: {
    isValidName: boolean;
    isValidDOB: boolean;
    isValidPassport: boolean;
    isValidMRZ: boolean;
  };
  contactDetails?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const initialState: UserState = {
  passportDetails: {
    name: "",
    dateOfBirth: "",
    passportNumber: "",
    isVerified: false,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setPassportDetails: (
      state,
      action: PayloadAction<UserState["passportDetails"]>
    ) => {
      state.passportDetails = action.payload;
    },
    setContactDetails: (
      state,
      action: PayloadAction<UserState["contactDetails"]>
    ) => {
      state.contactDetails = action.payload;
    },
    setValidationDetails: (
      state,
      action: PayloadAction<UserState["validationDetails"]>
    ) => {
      state.validationDetails = action.payload;
    },
  },
});

export const { setPassportDetails, setContactDetails, setValidationDetails } =
  userSlice.actions;
export default userSlice.reducer;
