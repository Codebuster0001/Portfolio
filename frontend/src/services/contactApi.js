import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5225/api' }),
  endpoints: (builder) => ({
    submitContact: builder.mutation({
      query: (contactData) => ({
        url: '/Contact',
        method: 'POST',
        body: contactData,
      }),
    }),
  }),
});

export const { useSubmitContactMutation } = contactApi;
