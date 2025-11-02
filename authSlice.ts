import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
   loggedInUsers?: User[]
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loggedInUsers:[],
};

// Load initial state from localStorage
const loadAuthState = (): AuthState => {
  try {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      return {
        ...initialState,
        ...parsedAuth,
        isAuthenticated: !!parsedAuth.token,
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }
  return initialState;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthState(),
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth', JSON.stringify(state));
      }
    },
  },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;