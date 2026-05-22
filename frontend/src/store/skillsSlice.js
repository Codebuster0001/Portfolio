import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { skillCategoriesApi, skillsApi } from '../services/skillsApi';

// ============================================================
// ASYNC THUNKS
// ============================================================

/** Fetch all categories (with nested skills) */
export const fetchCategories = createAsyncThunk(
  'skills/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await skillCategoriesApi.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load categories');
    }
  }
);

/** Fetch paginated skills with optional search/filter */
export const fetchSkills = createAsyncThunk(
  'skills/fetchSkills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await skillsApi.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load skills');
    }
  }
);

/** Create a new category */
export const createCategory = createAsyncThunk(
  'skills/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const res = await skillCategoriesApi.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create category');
    }
  }
);

/** Update a category */
export const updateCategory = createAsyncThunk(
  'skills/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await skillCategoriesApi.update(id, data);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update category');
    }
  }
);

/** Delete a category */
export const deleteCategory = createAsyncThunk(
  'skills/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await skillCategoriesApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to delete category');
    }
  }
);

/** Create a new skill */
export const createSkill = createAsyncThunk(
  'skills/createSkill',
  async (data, { rejectWithValue }) => {
    try {
      const res = await skillsApi.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create skill');
    }
  }
);

/** Update a skill */
export const updateSkill = createAsyncThunk(
  'skills/updateSkill',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await skillsApi.update(id, data);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update skill');
    }
  }
);

/** Delete a skill */
export const deleteSkill = createAsyncThunk(
  'skills/deleteSkill',
  async (id, { rejectWithValue }) => {
    try {
      await skillsApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to delete skill');
    }
  }
);

// ============================================================
// SLICE
// ============================================================
const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    categories: [],
    skills: [],
    pagination: { page: 1, pageSize: 50, totalCount: 0, totalPages: 1 },
    loading: false,
    categoriesLoading: false,
    error: null,
    searchQuery: '',
    selectedCategoryId: null,
  },
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSelectedCategoryId(state, action) {
      state.selectedCategoryId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    /** Optimistic reorder for drag-and-drop */
    reorderCategoriesLocally(state, action) {
      state.categories = action.payload;
    },
    reorderSkillsLocally(state, action) {
      const { categoryId, skills } = action.payload;
      const cat = state.categories.find((c) => c.id === categoryId);
      if (cat) cat.skills = skills;
    },
  },
  extraReducers: (builder) => {
    // --- fetchCategories ---
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      });

    // --- fetchSkills ---
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- deleteCategory ---
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    });

    // --- deleteSkill ---
    builder.addCase(deleteSkill.fulfilled, (state, action) => {
      state.categories = state.categories.map((cat) => ({
        ...cat,
        skills: cat.skills.filter((s) => s.id !== action.payload),
      }));
    });
  },
});

export const {
  setSearchQuery,
  setSelectedCategoryId,
  clearError,
  reorderCategoriesLocally,
  reorderSkillsLocally,
} = skillsSlice.actions;

export default skillsSlice.reducer;
