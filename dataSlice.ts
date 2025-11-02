import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExcelData {
  id: string;
  filename: string;
  data: any[];
  columns: string[];
  uploadDate: string;
  userId: string;
}

interface DataState {
  uploads: ExcelData[];
  currentData: ExcelData | null;
  loading: boolean;
}

const initialState: DataState = {
  uploads: JSON.parse(localStorage.getItem('excelUploads') || '[]'),
  currentData: null,
  loading: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addUpload: (state, action: PayloadAction<ExcelData>) => {
      state.uploads.unshift(action.payload);
      localStorage.setItem('excelUploads', JSON.stringify(state.uploads));
    },
    setCurrentData: (state, action: PayloadAction<ExcelData | null>) => {
      state.currentData = action.payload;
    },
    deleteUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(upload => upload.id !== action.payload);
      localStorage.setItem('excelUploads', JSON.stringify(state.uploads));
    },
    clearAllData: (state) => {
      state.uploads = [];
      state.currentData = null;
      localStorage.removeItem('excelUploads');
    },
  },
});

export const { setLoading, addUpload, setCurrentData, deleteUpload, clearAllData } = dataSlice.actions;
export default dataSlice.reducer;