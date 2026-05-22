import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5225/api',
  }),
  keepUnusedDataFor: 300, // Keep cached data for 5 minutes globally
  tagTypes: ['Projects', 'Hero', 'AboutContent'],
  endpoints: (builder) => ({
    // About page data
    getAboutContent: builder.query({
      query: () => '/About/content',
    }),
    getAboutSkills: builder.query({
      query: () => '/About/skills',
    }),
    getStats: builder.query({
      query: () => '/About/stats',
    }),
    getHero: builder.query({
      query: () => '/Hero',
      keepUnusedDataFor: 0, // Always re-fetch hero data (no stale cache)
    }),
  }),
});

export const {
  useGetAboutContentQuery,
  useGetAboutSkillsQuery,
  useGetStatsQuery,
  useGetHeroQuery,
} = portfolioApi;
