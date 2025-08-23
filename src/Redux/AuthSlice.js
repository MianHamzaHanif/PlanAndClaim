import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuth: false,
  userId: null,
  jwtToken: null,
  ipAddress: null,
  status:"In-Active"
};

export const AuthSlice = createSlice({
  name: "UserAuth",
  initialState,
  reducers: {
    UpdateAuth: (state, action) => {
      state.isAuth = action.payload.isAuth;
      state.userId = action.payload.userId;
      state.jwtToken = action.payload.jwtToken;
      state.ipAddress = action.payload.ipAddress;
    },
    updateStatus: (state, action) => {
      state.status = action.payload.status;
    },
  },
});
export const { UpdateAuth, updateStatus } = AuthSlice.actions;
export default AuthSlice.reducer;
