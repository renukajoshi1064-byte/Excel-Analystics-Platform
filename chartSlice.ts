import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | '3d-bar';
  xAxis: string;
  yAxis: string;
  title: string;
  backgroundColor: string;
  borderColor: string;
}

interface ChartHistory {
  id: string;
  config: ChartConfig;
  datasetName: string;
  createdAt: string;
  userId: string;
}

interface ChartState {
  currentChart: ChartConfig | null;
  history: ChartHistory[];
  recentlyViewed: string[];
}

const initialState: ChartState = {
  currentChart: null,
  history: JSON.parse(localStorage.getItem('chartHistory') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewedCharts') || '[]'),
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setCurrentChart: (state, action: PayloadAction<ChartConfig>) => {
      state.currentChart = action.payload;
    },
    saveChartToHistory: (state, action: PayloadAction<Omit<ChartHistory, 'id' | 'createdAt'>>) => {
      const newChart: ChartHistory = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.history.unshift(newChart);
      localStorage.setItem('chartHistory', JSON.stringify(state.history));
    },
    deleteChartFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(chart => chart.id !== action.payload);
      localStorage.setItem('chartHistory', JSON.stringify(state.history));
    },
    clearChartHistory: (state) => {
      state.history = [];
      localStorage.removeItem('chartHistory');
    },
     addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const chartId = action.payload;
      // Remove if already exists to avoid duplicates
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== chartId);
      // Add to beginning of array
      state.recentlyViewed.unshift(chartId);
      // Keep only last 10 viewed charts
      state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      localStorage.setItem('recentlyViewedCharts', JSON.stringify(state.recentlyViewed));
    },


  },
});

export const { setCurrentChart, saveChartToHistory, deleteChartFromHistory, clearChartHistory,addToRecentlyViewed } = chartSlice.actions;
export default chartSlice.reducer;