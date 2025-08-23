import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const DashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    fetchUserDashboard: (state, action) => {
      
      return action.payload;
    },
  },
});

export const { fetchUserDashboard } = DashboardSlice.actions;
export default DashboardSlice.reducer;
