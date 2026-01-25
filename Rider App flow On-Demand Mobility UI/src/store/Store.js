import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./AppSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});
