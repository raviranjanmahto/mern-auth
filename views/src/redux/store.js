import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import userReducer from "./userSlice";
import { userApi } from "./userApi";

// Create and configure the Redux store
const store = configureStore({
  // Combine the reducers for the store
  reducer: {
    // Combine the reducers for the store
    user: userReducer, // Add user reducer to manage user-related state
    [userApi.reducerPath]: userApi.reducer, // Add userApi reducer to handle API requests and caching for user-related data
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(userApi.middleware), // Apply default middleware and add the userApi middleware for handling API requests
});

setupListeners(store.dispatch); // Set up listeners for refetching data when the internet connection is restored

export default store;
