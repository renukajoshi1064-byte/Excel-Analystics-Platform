import React  , { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearAllData } from '../../store/slices/dataSlice';
import { clearChartHistory } from '../../store/slices/chartSlice';
import { Shield, Users, Database, BarChart3, Trash2, Download, AlertTriangle } from 'lucide-react';
import { getActiveUsers, removeActiveUser, ActiveUser } from '../../utils/activeUsers';
const AdminPanel: React.FC = () => {
  const dispatch = useDispatch();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>(() => getActiveUsers());
const [showActiveList, setShowActiveList] = useState(false);

useEffect(() => {
  const refresh = () => setActiveUsers(getActiveUsers());
  // update immediately
  refresh();
  // listen to storage events so other tabs updates reflect here
  const onStorage = () => refresh();
  window.addEventListener('storage', onStorage);
  const interval = setInterval(refresh, 30_000); // refresh every 30s
  return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
}, []);

  const { uploads } = useSelector((state: RootState) => state.data);
  const { history } = useSelector((state: RootState) => state.chart);

  const totalUsers = new Set(uploads.map(upload => upload.userId)).size;
  const totalDataPoints = uploads.reduce((acc, upload) => acc + upload.data.length, 0);
  const totalStorage = uploads.reduce((acc, upload) => acc + (upload.filename.length * 1024), 0); // Simulated storage

  const clearAllSystemData = () => {
    if (confirm('Are you sure you want to clear all system data? This action cannot be undone.')) {
      dispatch(clearAllData());
      dispatch(clearChartHistory());
      alert('All system data has been cleared.');
    }
  };

  const exportSystemData = () => {
    const systemData = {
      uploads,
      chartHistory: history,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'blue',
      change: '+2 this week',
    },
    {
      title: 'Data Files',
      value: uploads.length,
      icon: Database,
      color: 'green',
      change: `${uploads.filter(u => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.uploadDate) > weekAgo;
      }).length} this week`,
    },
    {
      title: 'Charts Created',
      value: history.length,
      icon: BarChart3,
      color: 'purple',
      change: `${history.filter(h => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(h.createdAt) > weekAgo;
      }).length} this week`,
    },
    {
      title: 'Storage Used',
      value: `${(totalStorage / 1024 / 1024).toFixed(2)} MB`,
      icon: Database,
      color: 'orange',
      change: 'Simulated value',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Manage users, data, and system settings
            </p>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600',
          };

          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-gray-500 text-xs">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Active Users quick card */}
      {/* Active Users quick card */}
<div className="mt-6">
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-semibold">Active Users</h4>
          <p className="text-sm text-gray-500">Click to view currently active users (localStorage)</p>
        </div>
      </div>
      <div>
        <button
          onClick={() => setShowActiveList(s => !s)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {activeUsers.length} {showActiveList ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>

    {showActiveList && (
      <div className="mt-4">
        {activeUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No active users right now</p>
        ) : (
          <ul className="space-y-3">
            {activeUsers.map(u => (
              <li key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{u.name} <span className="text-xs text-gray-500">({u.role})</span></p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{new Date(u.lastActive).toLocaleString()}</span>
                  {/* optional: remove a fake/stale session */}
                  <button
                    onClick={() => {
                      if (!confirm(`Remove ${u.name} from active list?`)) return;
                      const remaining = removeActiveUser(u.id);
                      setActiveUsers(remaining);
                    }}
                    className="text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
</div>


      {/* System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={exportSystemData}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Export System Data</span>
            </button>
            
            <button
              onClick={clearAllSystemData}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Clear All Data</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-900">System Health</span>
              </div>
              <span className="text-green-700 text-sm">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-900">Database</span>
              </div>
              <span className="text-blue-700 text-sm">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-yellow-900">Storage</span>
              </div>
              <span className="text-yellow-700 text-sm">75% Used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent System Activity</h3>
        <div className="space-y-4">
          {uploads.slice(0, 10).map((upload) => (
            <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">File Upload: {upload.filename}</p>
                  <p className="text-sm text-gray-500">
                    User: {upload.userId} • {new Date(upload.uploadDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">{upload.data.length} rows</span>
            </div>
          ))}
          
          {uploads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No system activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;