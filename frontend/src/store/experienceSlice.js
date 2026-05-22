import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { experienceApi } from '../services/experienceApi';

// ============================================================
// Async Thunks
// ============================================================
export const fetchExperiences = createAsyncThunk(
  'experience/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await experienceApi.get('/experience');
      // Handle generic unwrapped list or $values list from backend
      return Array.isArray(response.data) ? response.data : response.data.$values || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load experiences');
    }
  }
);

export const createExperience = createAsyncThunk(
  'experience/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await experienceApi.post('/experience', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create experience');
    }
  }
);

export const updateExperience = createAsyncThunk(
  'experience/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await experienceApi.put(`/experience/${id}`, data);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update experience');
    }
  }
);

export const deleteExperience = createAsyncThunk(
  'experience/delete',
  async (id, { rejectWithValue }) => {
    try {
      await experienceApi.delete(`/experience/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete experience');
    }
  }
);

// ============================================================
// Slice Definition
// ============================================================
const experienceSlice = createSlice({
  name: 'experience',
  initialState: {
    experiences: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchExperiences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperiences.fulfilled, (state, action) => {
        state.loading = false;
        state.experiences = action.payload;
      })
      .addCase(fetchExperiences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create
      .addCase(createExperience.fulfilled, (state, action) => {
        state.experiences.push(action.payload);
      })
      
      // Update
      .addCase(updateExperience.fulfilled, (state, action) => {
        const index = state.experiences.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.experiences[index] = { ...state.experiences[index], ...action.payload.data };
        }
      })
      
      // Delete
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.experiences = state.experiences.filter((e) => e.id !== action.payload);
      });
  },
});

export default experienceSlice.reducer;
