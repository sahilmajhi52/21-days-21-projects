import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurantData: [],
  cart: {},
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setRestaurantData: (state, action) => {
      state.restaurantData = action.payload;
    },
    addToCart: (state, action) => {
      const intialQunatity = state.cart[action.payload.item_id]?.quantity || 0;
      state.cart[action.payload.item_id] = {
        ...action.payload,
        quantity: intialQunatity + 1,
      };
    },
    decreseQuantity: (state, action) => {
      const intialQunatity = state.cart[action.payload.item_id]?.quantity;
      if (intialQunatity == 1) {
        return;
      } else {
        state.cart[action.payload.item_id] = {
          ...action.payload,
          quantity: intialQunatity - 1,
        };
      }
    },
    removeItem: (state, action) => {
      const idToRemove = action.payload.item_id;

      if (!state.cart[idToRemove]) return;

      const { [idToRemove]: removedItem, ...updatedCart } = state.cart;

      state.cart = updatedCart;
    },
  },
});

export const { setRestaurantData, addToCart, decreseQuantity, removeItem } =
  appSlice.actions;

export default appSlice.reducer;
