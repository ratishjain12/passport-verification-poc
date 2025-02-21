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
    isValidExpiry: boolean;
    isValidCountry: boolean;
  };
  contactDetails?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  selectedCountry?: string;
  ticketDetails?: {
    imageUrl: string;
  };
  visaDetails?: {
    fileUrl: string;
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
    setSelectedCountry: (state, action: PayloadAction<string>) => {
      state.selectedCountry = action.payload;
    },
    setTicketDetails: (
      state,
      action: PayloadAction<UserState["ticketDetails"]>
    ) => {
      state.ticketDetails = action.payload;
    },
    setVisaDetails: (
      state,
      action: PayloadAction<UserState["visaDetails"]>
    ) => {
      state.visaDetails = action.payload;
    },
  },
});

export const {
  setPassportDetails,
  setContactDetails,
  setValidationDetails,
  setSelectedCountry,
  setTicketDetails,
  setVisaDetails,
} = userSlice.actions;
export default userSlice.reducer;
