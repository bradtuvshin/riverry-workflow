import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Mail,
  Key,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const UserManagement = ({ themeClasses }) => {
  const [users, setUsers] = useState([
    {
      id: '1',
      firstName: 'Demo',
      lastName: 'Artist',
      email: 'artist@riverry.com',
      role: 'artist',
      status: 'active',
      onTimeRate: 85,
      totalOrders: 45,
      earnings: 850,
      lastActive: '2025-07-02T10:30:00Z',
      joinDate: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'Demo',
      lastName: 'Master',
      email: 'master@riverry.com',
      role: 'master',
      status: 'active',
      onTimeRate: null,
      totalOrders: null,
      earnings: null,
      lastActive: '2025-07-02T11:15:00Z',
      joinDate: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      firstName: 'Demo',
      lastName: 'Admin',
      email: 'admin@riverry.com',
      role: 'admin',
      status: 'active',
      onTimeRate: null,
      totalOrders: null,
      earnings: null,
      lastActive: '2025-07-02T09:45:00Z',
      joinDate: '2025-01-10T00:00:00Z'
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@riverry.com',
      role: 'artist',
      status: 'active',
      onTimeRate: 92,
      totalOrders: 67,
      earnings: 1240,
      lastActive: '2025-07-02T08:20:00Z',
      joinDate: '2024-12-01T00:00:00Z'
    },
    {
      id: '5',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.c@riverry.com',
      role: 'editor',
      status: 'active',
      onTimeRate: null,
      totalOrders: 234,
      earnings: null,
      lastActive: '2025-07-01T16:30:00Z',
      joinDate: '2024-11-15T00:00:00Z'
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Park',
      email: 'lisa.p@riverry.com',
      role: 'revisor',
      status: 'inactive',
      onTimeRate: null,
      totalOrders: 156,
      earnings: null,
      lastActive: '2025-06-28T14:15:00Z',
      joinDate: '2024-10-20T00:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Role configurations
  const roleConfig = {
    all: { label: 'All Users', color: 'gray' },
    artist: { label: 'Artists', color: 'blue' },
    editor: { label: 'Editors', color: 'green' },
    revisor: { label: 'Revisors', color: 'purple' },
    admin: { label: 'Admins', color: 'orange' },
    master: { label: 'Masters', color: 'yellow' }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = activeTab === 'all' || user.role === activeTab;
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    artists: users.filter(u => u.role === 'artist').length,
    avgOnTime: Math.round(users.filter(u => u.onTimeRate).reduce((sum, u) => sum + u.onTimeRate, 0) / users.filter(u => u.onTimeRate).length) || 0
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'master': return <Crown className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'artist': return <Users className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'revisor': return <CheckCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'master': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'artist': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'revisor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          color="blue"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Active Users"
          value={stats.active}
          icon={UserCheck}
          color="green"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Artists"
          value={stats.artists}
          icon={Users}
          color="purple"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Avg On-Time"
          value={`${stats.avgOnTime}%`}
          icon={TrendingUp}
          color="orange"
          themeClasses={themeClasses}
        />
      </div>

      {/* Header Actions */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>User Management</h2>
            <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
              Manage user accounts, roles, and permissions
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 w-full max-w-md px-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
            />
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(roleConfig).map(([key, config]) => {
            const count = key === 'all' ? users.length : users.filter(u => u.role === key).length;
            const isActive = activeTab === key;
            
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-${config.color}-600 text-white shadow-lg`
                    : `bg-${config.color}-50 text-${config.color}-700 hover:bg-${config.color}-100`
                }`}
              >
                {config.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-white bg-opacity-25' 
                    : `bg-${config.color}-200`
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-gray-50 ${themeClasses.border} border-b`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Performance
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Last Active
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${themeClasses.cardBg} divide-y ${themeClasses.border}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        user.role === 'master' ? 'bg-yellow-600' :
                        user.role === 'admin' ? 'bg-orange-600' :
                        user.role === 'artist' ? 'bg-blue-600' :
                        user.role === 'editor' ? 'bg-green-600' :
                        'bg-purple-600'
                      }`}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className={`text-sm ${themeClasses.textMuted}`}>
                          {user.email}
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          Joined {formatDate(user.joinDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <UserX className="w-4 h-4 mr-1" />
                      )}
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'artist' && user.onTimeRate !== null ? (
                      <div>
                        <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                          {user.onTimeRate}% On-Time
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          {user.totalOrders} orders • ${user.earnings} earned
                        </div>
                      </div>
                    ) : user.totalOrders ? (
                      <div>
                        <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                          {user.totalOrders} orders
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          {user.role === 'editor' ? 'edited' : 'reviewed'}
                        </div>
                      </div>
                    ) : (
                      <span className={`text-sm ${themeClasses.textMuted}`}>
                        Admin role
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${themeClasses.textPrimary}`}>
                      {getTimeAgo(user.lastActive)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={user.status === 'active' ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>No users found</h3>
            <p className={`${themeClasses.textMuted}`}>
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first user'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSave={(newUser) => {
            setUsers([...users, { 
              ...newUser, 
              id: Date.now().toString(),
              onTimeRate: newUser.role === 'artist' ? 0 : null,
              totalOrders: 0,
              earnings: newUser.role === 'artist' ? 0 : null,
              lastActive: new Date().toISOString(),
              joinDate: new Date().toISOString()
            }]);
            setShowAddModal(false);
          }}
          themeClasses={themeClasses}
        />
      )}

      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={(updatedUser) => {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
            setShowEditModal(false);
            setEditingUser(null);
          }}
          themeClasses={themeClasses}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, themeClasses }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${themeClasses.textMuted}`}>{title}</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary} mt-1`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Add User Modal
const AddUserModal = ({ onClose, onSave, themeClasses }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'artist',
    password: '',
    status: 'active'
  });
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({...formData, password});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Add New User</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="john.doe@riverry.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              >
                <option value="artist">Artist</option>
                <option value="editor">Editor</option>
                <option value="revisor">Revisor</option>
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Temporary Password
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-3 py-2 pr-10 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                    placeholder="Enter temporary password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Eye className={`w-4 h-4 ${themeClasses.textMuted}`} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="btn btn-secondary text-sm whitespace-nowrap"
                >
                  <Key className="w-4 h-4 mr-1" />
                  Generate
                </button>
              </div>
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                User will be prompted to change this on first login
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className={`ml-2 block text-sm ${themeClasses.textPrimary}`}>
                Active account
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ user, onClose, onSave, themeClasses }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Edit User</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              >
                <option value="artist">Artist</option>
                <option value="editor">Editor</option>
                <option value="revisor">Revisor</option>
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
