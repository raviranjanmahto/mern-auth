import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
  },
  reducers: {
    // Set the credentials in the Redux store
    setCredentials: (state, action) => {
      state.user = action.payload;
    },
    // Clear the user data and access token
    removeCredentials: state => {
      state.user = null;
    },
  },
});

export const { setCredentials, removeCredentials } = userSlice.actions;

export default userSlice.reducer;
