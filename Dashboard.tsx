import React , { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { BarChart3, FileSpreadsheet, TrendingUp, Users, Calendar, Download, Sparkles, Zap, Target, Award } from 'lucide-react';;
import { getActiveUsers, upsertActiveUser, ActiveUser } from '../../utils/activeUsers';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // local state to show realtime active count in this page
const [activeUsersList, setActiveUsersList] = useState<ActiveUser[]>(() => getActiveUsers());

// mark this user active on mount (and whenever user changes)
useEffect(() => {
  if (user?.id) {
    upsertActiveUser({
      id: user.id,
      name: user.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email || '',
      role: (user as any).role || 'user',
    });
    setActiveUsersList(getActiveUsers());
  }
  const onStorage = () => setActiveUsersList(getActiveUsers());
  window.addEventListener('storage', onStorage);
  const interval = setInterval(() => setActiveUsersList(getActiveUsers()), 30_000); // optional refresh
  return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
}, [user]);

  const { uploads } = useSelector((state: RootState) => state.data);
  const { history } = useSelector((state: RootState) => state.chart);
  const { recentlyViewed } = useSelector((state: RootState) => state.chart);
  const userUploads = uploads.filter(upload => upload.userId === user?.id);
  const userCharts = history.filter(chart => chart.userId === user?.id);
  
  const recentUploads = userUploads.slice(0, 5);



  // Get recently viewed charts in order
  const recentlyViewedCharts = recentlyViewed
    .map(chartId => userCharts.find(chart => chart.id === chartId))
    .filter(Boolean)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Uploads',
      value: userUploads.length,
      icon: FileSpreadsheet,
      color: 'blue',
      trend: '+12%',
      description: 'Files processed',
    },
    {
      title: 'Charts Created',
      value: userCharts.length,
      icon: BarChart3,
      color: 'green',
      trend: '+5%',
      description: 'Visualizations made',
    },
    {
      title: 'Data Points',
      value: userUploads.reduce((acc, upload) => acc + upload.data.length, 0),
      icon: TrendingUp,
      color: 'purple',
      trend: '+23%',
      description: 'Records analyzed',
    },
    {
      title: 'Active Sessions',
      value: activeUsersList.length,
      icon: Users,
      color: 'orange',
      trend: '0%',
      description: 'Current activity',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl text-white p-8 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <h1 className="text-4xl font-bold animate-slide-right">
                Welcome back, {user?.name}!
              </h1>
            </div>
            <p className="text-blue-100 text-xl max-w-2xl animate-slide-right delay-200">
              Ready to transform your data into powerful insights? Let's create something amazing together.
            </p>
            <div className="flex items-center space-x-4 animate-slide-right delay-400">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Target className="w-4 h-4 text-green-300" />
                <span className="text-sm">Goal: 100% Data Accuracy</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Analytics Expert</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm transform rotate-12 hover:rotate-0 transition-transform duration-700 animate-float">
                <BarChart3 className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin-slow">
                <Zap className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
            green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
            purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
            orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600',
          };

          return (
            <div 
              key={index} 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[1]} shadow-lg transform hover:rotate-12 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-green-600 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900 animate-count-up">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.title}</p>
                <p className="text-gray-500 text-sm">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-slide-left">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Uploads</h3>
                <p className="text-gray-500 text-sm">Your latest data files</p>
              </div>
            </div>
          </div>
          
          {recentUploads.length > 0 ? (
            <div className="space-y-4">
              {recentUploads.map((upload, index) => (
                <div 
                  key={upload.id} 
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-102 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                      <FileSpreadsheet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{upload.filename}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(upload.uploadDate).toLocaleDateString()} • {upload.data.length} rows
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-100 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FileSpreadsheet className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium">No uploads yet</p>
              <p className="text-sm">Upload your first Excel file to get started</p>
            </div>
          )}
        </div>

        {/* Recent Charts */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-slide-right">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Charts</h3>
                <p className="text-gray-500 text-sm">Your latest visualizations</p>
              </div>
            </div>
          </div>
          
          {recentlyViewedCharts.length > 0 ? (
            <div className="space-y-4">
              {recentlyViewedCharts.map((chart, index) => (
                <div 
                  key={chart.id} 
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-102 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{chart.config.title}</p>
                      <p className="text-sm text-gray-500">
                        Last viewed • {chart.config.type} chart
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      Recently viewed
                    </span>
                  <button className="text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-100 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <BarChart3 className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium">No charts viewed yet</p>
              <p className="text-sm">View charts to see them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-slide-up delay-600">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-900 text-lg">Upload New File</p>
              <p className="text-blue-700 text-sm">Add Excel data for analysis</p>
            </div>
          </button>
          <button className="group flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-900 text-lg">Create Chart</p>
              <p className="text-purple-700 text-sm">Build interactive visualizations</p>
            </div>
          </button>
          <button className="group flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-green-900 text-lg">View Analytics</p>
              <p className="text-green-700 text-sm">Explore data insights</p>
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }

          to { transform: rotate(360deg); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-left { animation: slide-left 0.6s ease-out; }
        .animate-slide-right { animation: slide-right 0.6s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-count-up { animation: fade-in 1s ease-out; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-600 { animation-delay: 0.6s; }
        .hover\:scale-102:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default Dashboard;