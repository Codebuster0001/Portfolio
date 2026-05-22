import { configureStore } from '@reduxjs/toolkit';
import { portfolioApi } from './portfolioApi';
import { contactApi } from '../services/contactApi';
import skillsReducer from './skillsSlice';
import experienceReducer from './experienceSlice';

export const store = configureStore({
  reducer: {
    [portfolioApi.reducerPath]: portfolioApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    skills: skillsReducer,
    experience: experienceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(portfolioApi.middleware, contactApi.middleware),
});
