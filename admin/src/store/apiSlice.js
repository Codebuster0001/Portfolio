import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5225/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && (result.error.status === 401 || result.error.originalStatus === 401)) {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300, // Keep cached data for 5 minutes globally
  tagTypes: ['AboutContent', 'AboutSkills', 'Stats', 'Hero', 'Projects', 'Experiences', 'Contacts'],
  endpoints: (builder) => ({
    // Auth Endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: '/Auth/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: '/Auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),
    
    // Hero Section
    getHero: builder.query({
      query: () => '/Hero',
      providesTags: ['Hero'],
    }),
    updateHero: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Hero/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Hero'],
    }),

    // About Content
    getAboutContent: builder.query({
      query: () => '/About/content',
      providesTags: ['AboutContent'],
    }),
    updateAboutContent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/About/content/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AboutContent'],
    }),

    // About Skills
    getAboutSkills: builder.query({
      query: () => '/About/skills',
      providesTags: ['AboutSkills'],
    }),
    addAboutSkill: builder.mutation({
      query: (body) => ({
        url: '/About/skills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AboutSkills'],
    }),
    updateAboutSkill: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/About/skills/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AboutSkills'],
    }),
    deleteAboutSkill: builder.mutation({
      query: (id) => ({
        url: `/About/skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AboutSkills'],
    }),

    // Stats
    getStats: builder.query({
      query: () => '/About/stats',
      providesTags: ['Stats'],
    }),
    addStat: builder.mutation({
      query: (body) => ({
        url: '/About/stats',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Stats'],
    }),
    updateStat: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/About/stats/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Stats'],
    }),
    deleteStat: builder.mutation({
      query: (id) => ({
        url: `/About/stats/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stats'],
    }),

    // File Upload
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/Upload/single',
        method: 'POST',
        body: formData,
      }),
    }),
    generateResume: builder.mutation({
      query: (id) => ({
        url: `/Hero/${id}/generate-resume`,
        method: 'POST',
      }),
      invalidatesTags: ['Hero'],
    }),

    // Projects CRUD
    getProjects: builder.query({
      query: () => '/Projects',
      providesTags: ['Projects'],
    }),
    getProjectById: builder.query({
      query: (id) => `/Projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),
    createProject: builder.mutation({
      query: (body) => ({
        url: '/Projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/Projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),

    // Experience CRUD
    getExperiences: builder.query({
      query: () => '/Experience',
      providesTags: ['Experiences'],
    }),
    createExperience: builder.mutation({
      query: (body) => ({
        url: '/Experience',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Experiences'],
    }),
    updateExperience: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Experience/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Experiences'],
    }),
    deleteExperience: builder.mutation({
      query: (id) => ({
        url: `/Experience/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Experiences'],
    }),
    reorderExperiences: builder.mutation({
      query: (items) => ({
        url: '/Experience/reorder',
        method: 'PUT',
        body: items,
      }),
      invalidatesTags: ['Experiences'],
    }),
    // Contacts CRUD
    getContacts: builder.query({
      query: ({ page = 1, pageSize = 10, search = '', status = 'all' }) => 
        `/Contact?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&status=${status}`,
      providesTags: ['Contacts'],
    }),
    getContactById: builder.query({
      query: (id) => `/Contact/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contacts', id }],
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/Contact/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Contacts'],
    }),
    markContactAsRead: builder.mutation({
      query: ({ id, isRead }) => ({
        url: `/Contact/${id}/read`,
        method: 'PUT',
        body: { isRead },
      }),
      invalidatesTags: ['Contacts'],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/Contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contacts'],
    }),
    replyToContact: builder.mutation({
      query: ({ id, message }) => ({
        url: `/Contact/${id}/reply`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Contacts'],
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAboutContentQuery,
  useUpdateAboutContentMutation,
  useGetAboutSkillsQuery,
  useAddAboutSkillMutation,
  useUpdateAboutSkillMutation,
  useDeleteAboutSkillMutation,
  useGetStatsQuery,
  useAddStatMutation,
  useUpdateStatMutation,
  useDeleteStatMutation,
  useGetHeroQuery,
  useUpdateHeroMutation,
  useUploadFileMutation,
  useGenerateResumeMutation,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  
  useGetExperiencesQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
  useReorderExperiencesMutation,

  useGetContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactStatusMutation,
  useMarkContactAsReadMutation,
  useDeleteContactMutation,
  useReplyToContactMutation,
} = apiSlice;
