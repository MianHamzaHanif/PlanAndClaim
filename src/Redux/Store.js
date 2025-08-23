import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./AuthSlice";
import dashboardReducer from "./DashboardSlice";
import storageSession from "redux-persist/lib/storage/session";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage: storageSession,
};
const reducer = combineReducers({
  UserAuth: AuthSlice,
  dashboard: dashboardReducer,
});
const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
