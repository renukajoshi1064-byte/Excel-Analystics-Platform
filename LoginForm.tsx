import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { BarChart3, Mail, Lock, User, Shield, Sparkles, TrendingUp, Zap,Github } from 'lucide-react';
import { upsertActiveUser } from '../../utils/activeUsers';

declare global {
  interface Window {
    google?: any;
  }
}


// allow only Gmail addresses
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

// password rules:
// - at least 6 chars
// - at least 1 uppercase letter
// - at least 1 digit
// - at least 1 special symbol
const passwordRegex = /^(?=.{6,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'user' | 'admin' | 'superadmin' ,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});


  const validateEmail = (email: string) => gmailRegex.test(String(email).trim());
const validatePassword = (pw: string) => passwordRegex.test(String(pw));
const isRegisterFormValid = () =>
  validateEmail(formData.email) && validatePassword(formData.password);


// Get users from localStorage
const getStoredUsers = () => {
  const users = localStorage.getItem("registeredUsers");
  return users ? JSON.parse(users) : [];
};

// Save a new user
const saveUser = (user: any) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem("registeredUsers", JSON.stringify(users));
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    if (isRegistering) {
    const emailValid = validateEmail(formData.email);
    const passwordValid = validatePassword(formData.password);

    setErrors({
      email: emailValid ? '' : 'Email must be a Gmail address (example@gmail.com).',
      password: passwordValid
        ? ''
        : 'Password must be at least 6 chars, include 1 uppercase, 1 number and 1 special symbol.',
    });

    if (!emailValid || !passwordValid) {
      // stop submission if invalid

      const existingUsers = getStoredUsers();
    const userExists = existingUsers.find((u: any) => u.email === formData.email);

    if (userExists) {
      alert("User already registered! Please sign in.");
      setIsRegistering(false);
      return;
    }
  }
    
    // Simulate authentication
    const userData = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      role: formData.role,
      password: formData.password,
    };

    saveUser(userData);
    
    const token = `jwt_token_${Date.now()}`;
    
    dispatch(login({ user: userData, token }));
    upsertActiveUser(userData);
     } else {
    // --- LOGIN ---
    const existingUsers = getStoredUsers();
    const user = existingUsers.find(
      (u: any) => u.email === formData.email && u.password === formData.password
    );

    if (!user) {
      setErrors({
        email: 'Invalid email or password',
        password: 'Invalid email or password',
      });
      return;
    }

    const token = `jwt_token_${Date.now()}`;
    dispatch(login({ user, token }));
    upsertActiveUser(user);
  }

  };

 const handleGoogleSignIn = () => {
    if (window.google && (window as any).google.accounts) {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
        scope: 'email profile openid',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            fetchGoogleUserInfo(tokenResponse.access_token);
          }
        },
      });

      tokenClient.requestAccessToken();
    } else {
      simulateGoogleLogin();
    }
  };

  const fetchGoogleUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userInfo = await response.json();

      const userData = {
        id: `google_${userInfo.id}`,
        email: userInfo.email,
        name: userInfo.name,
        role: 'user' as const,
        avatar: userInfo.picture,
      };
      const token = `google_token_${Date.now()}`;
      dispatch(login({ user: userData, token }));
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      simulateGoogleLogin();
    }
  };

   const simulateGoogleLogin = () => {
    const userData = {
      id: `google_${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      role: 'user' as const,
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };
    const token = `google_token_${Date.now()}`;
    dispatch(login({ user: userData, token }));
  };

  const handleGitHubSignIn = () => {
    const userData = {
      id: `github_${Date.now()}`,
      email: 'user@github.com',
      name: 'GitHub User',
      role: 'user' as const,
    };
    const token = `github_token_${Date.now()}`;
    dispatch(login({ user: userData, token }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-md w-full">
          {/* Main card with enhanced animations */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform hover:scale-105 transition-all duration-500">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-700">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                    <Sparkles className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
                ExcelAnalytics
              </h1>
              <p className="text-white/80 text-lg animate-fade-in-delay">
                {isRegistering ? 'Join the analytics revolution' : 'Transform your data into insights'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-white/60 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 backdrop-blur-sm"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="animate-slide-up">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-white/60 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    required
                     aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 backdrop-blur-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => {
                      const email = e.target.value;
                       setFormData({ ...formData, email: e.target.value });
                       if (isRegistering) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email) ? '' : 'Email must be a Gmail address (example@gmail.com).',
      }));
    }
                     } }
                       />
                </div>
                {errors.email && (
  <p id="email-error" role="alert" className="text-red-300 text-sm mt-2">
    {errors.email}
  </p>
)}
              </div>

              <div className="animate-slide-up delay-100">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-white/60 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    required
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>{
                      const password = e.target.value;
                      setFormData({ ...formData, password: e.target.value });
                       if (isRegistering) {
                        setErrors((prev) => ({
                          ...prev,
                          password: validatePassword(password)
                            ? ''
                            : 'Password must include at least one uppercase letter, one number and one special character.',
                        }));
                      }
                    
                    }}
                  />
                </div>
                {/* {hint +error} */}
                <p id="password-hint" className="text-white/60 text-xs mt-2">
  When registering, password must include: <strong>1 uppercase</strong>, <strong>1 digit</strong>, <strong>1 special symbol</strong>, and be at least 6 characters.
</p>
 {errors.password && (
                  <p id="password-error" role="alert" className="text-red-300 text-sm mt-2">
                    {errors.password}
                  </p>
                )}



              </div>

              {isRegistering && (
                <div className="animate-slide-down delay-200">
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
  <button
    type="button"
    onClick={() => setFormData({ ...formData, role: 'user' })}
    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
      formData.role === 'user'
        ? 'border-blue-400 bg-blue-400/20 text-blue-300 shadow-lg shadow-blue-400/25'
        : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40'
    }`}
  >
    <User className="w-5 h-5 mx-auto mb-2" />
    User
  </button>

  <button
    type="button"
    onClick={() => setFormData({ ...formData, role: 'admin' })}
    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
      formData.role === 'admin'
        ? 'border-purple-400 bg-purple-400/20 text-purple-300 shadow-lg shadow-purple-400/25'
        : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40'
    }`}
  >
    <Shield className="w-5 h-5 mx-auto mb-2" />
    Admin
  </button>

  <button
    type="button"
    onClick={() => setFormData({ ...formData, role: 'superadmin' })}
    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
      formData.role === 'superadmin'
        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-lg shadow-yellow-400/25'
        : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40'
    }`}
  >
    <Zap className="w-5 h-5 mx-auto mb-2" />
    Superadmin
  </button>
</div>

                  
                </div>
              )}

              <button
                type="submit"

                disabled={isRegistering ? !isRegisterFormValid() : false}
                className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-pulse-slow ${
                  isRegistering && !isRegisterFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                </span>
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">Try demo accounts</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                 onClick={handleGoogleSignIn}
                  className="flex items-center justify-center px-4 py-3 border border-white/20 rounded-2xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all transform hover:scale-105 backdrop-blur-sm group"
                >
                  <div className="w-5 h-5 mr-2 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {/* google svg unchanged */}
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  Google
                </button>
                <button
                  onClick={handleGitHubSignIn}
                  className="flex items-center justify-center px-4 py-3 border border-white/20 rounded-2xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all transform hover:scale-105 backdrop-blur-sm group"
                >
                  <Github className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  GitHub
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-white/60 mt-8">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrors({});
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/60 animate-fade-in-delay">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs">Advanced Analytics</p>
            </div>
            <div className="text-white/60 animate-fade-in-delay-2">
              <BarChart3 className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs">Interactive Charts</p>
            </div>
            <div className="text-white/60 animate-fade-in-delay-3">
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs">AI Insights</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s both; }
        .animate-fade-in-delay-2 { animation: fade-in 0.8s ease-out 0.4s both; }
        .animate-fade-in-delay-3 { animation: fade-in 0.8s ease-out 0.6s both; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-down { animation: slide-down 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse 3s infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};
export default LoginForm;

