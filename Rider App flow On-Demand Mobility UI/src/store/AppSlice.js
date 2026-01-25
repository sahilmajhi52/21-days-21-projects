import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: {
    name: "Sahil majhi",
    email: "sahilmajhi52@gmai.com",
    phoneNumber: "7735034135",
  },
  walletBalance: 0,
  savedLocations: ["123 Downtown ,Delhi", "456, Canada,"],
  currentTrip: {
    pickup: "",
    drop: "",
    selectedMode: "",
  },
};

export const appSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    addWalletBalance: (state, action) => {
      state.walletBalance += parseFloat(action.payload);
    },
    setCurrentTrip: (state, action) => {
      state.currentTrip = { ...state.currentTrip, ...action.payload };
    },
    resetCurrentTrip: (state) => {
      state.currentTrip = {
        pickup: "",
        drop: "",
        selectedMode: "",
      };
    },
  },
});

export const {
  setUserData,
  addWalletBalance,
  setCurrentTrip,
  resetCurrentTrip,
} = appSlice.actions;

export default appSlice.reducer;
