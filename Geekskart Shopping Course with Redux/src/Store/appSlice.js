import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: [],
  cart: {},
  wishlist: {},
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCourseData: (state, action) => {
      state.courses = action.payload;
    },
    addToCart: (state, action) => {
      state.cart[action.payload.id] = { ...action.payload };
    },
    removeFromCart: (state, action) => {
      delete state.cart[action.payload.id];
    },
    addToWishlist: (state, action) => {
      state.wishlist[action.payload.id] = { ...action.payload };
    },
    removeFromWishlist: (state, action) => {
      delete state.wishlist[action.payload.id];
    },
  },
});

export const {
  setCourseData,
  addToCart,
  removeFromCart,
  removeFromWishlist,
  addToWishlist,
} = appSlice.actions;

export default appSlice.reducer;
