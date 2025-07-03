import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Package,
  Clock,
  DollarSign,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Zap,
  Settings,
  Upload
} from 'lucide-react';

const OrderManagement = ({ themeClasses }) => {
  const [orders, setOrders] = useState([
    {
      id: '1',
      shopifyOrderId: '5789123456',
      shopifyOrderNumber: '#1001',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@gmail.com',
      status: 'pending_assignment',
      totalAmount: 89.99,
      createdAt: '2025-07-02T10:30:00Z',
      dueDate: '2025-07-05T15:30:00Z',
      items: [
        {
          id: 'item1',
          productTitle: 'Custom Pet Portrait - Regular Headshot',
          sku: 'Regular_headshot_12x16p',
          paintingStyle: 'Regular Headshot',
          quantity: 1,
          price: 45.99,
          assignedArtist: null,
          status: 'unassigned',
          customerNotes: 'Please make sure his eyes are blue and focus on the happy expression!'
        },
        {
          id: 'item2', 
          productTitle: 'Custom Pet Portrait - Mini Full Body',
          sku: '2pet_mini_fullbody_5x7nw',
          paintingStyle: '2 Pet Mini Full Body',
          quantity: 1,
          price: 44.00,
          assignedArtist: null,
          status: 'unassigned',
          customerNotes: 'Both cats should be sitting. Include the garden background.'
        }
      ],
      shippingAddress: {
        name: 'Sarah Johnson',
        address1: '123 Main St',
        city: 'Los Angeles',
        province: 'CA',
        zip: '90210',
        country: 'United States'
      },
      lastSyncedAt: '2025-07-02T10:30:00Z'
    },
    {
      id: '2',
      shopifyOrderId: '5789123457',
      shopifyOrderNumber: '#1002',
      customerName: 'Mike Chen',
      customerEmail: 'mike.c@outlook.com',
      status: 'in_progress',
      totalAmount: 129.99,
      createdAt: '2025-07-01T14:20:00Z',
      dueDate: '2025-07-03T18:00:00Z',
      items: [
        {
          id: 'item3',
          productTitle: 'Wedding Portrait - Couple',
          sku: 'couple_portrait_16x20f',
          paintingStyle: 'Couple Portrait',
          quantity: 1,
          price: 89.99,
          assignedArtist: 'Sarah Johnson',
          status: 'in_progress',
          customerNotes: 'Please capture the joy in their faces. The bride is wearing a pearl necklace.'
        },
        {
          id: 'item4',
          productTitle: 'Pet Memorial Portrait',
          sku: 'pet_memorial_rainbow_8x10',
          paintingStyle: 'Pet Memorial',
          quantity: 1,
          price: 40.00,
          assignedArtist: 'Demo Artist',
          status: 'completed',
          customerNotes: 'This is for our beloved dog who passed away. Include the rainbow.'
        }
      ],
      shippingAddress: {
        name: 'Mike Chen',
        address1: '456 Oak Ave',
        city: 'San Francisco',
        province: 'CA', 
        zip: '94102',
        country: 'United States'
      },
      lastSyncedAt: '2025-07-01T14:20:00Z'
    },
    {
      id: '3',
      shopifyOrderId: '5789123458',
      shopifyOrderNumber: '#1003',
      customerName: 'Lisa Park',
      customerEmail: 'lisa.park@yahoo.com',
      status: 'completed',
      totalAmount: 79.99,
      createdAt: '2025-06-28T09:15:00Z',
      dueDate: '2025-06-30T12:00:00Z',
      items: [
        {
          id: 'item5',
          productTitle: 'Family Portrait - 4 People',
          sku: 'family_portrait_4people_12x16',
          paintingStyle: 'Family Portrait',
          quantity: 1,
          price: 79.99,
          assignedArtist: 'Demo Artist',
          status: 'completed',
          customerNotes: 'Family of 4 with 2 young kids. Make the kids look well-behaved!'
        }
      ],
      shippingAddress: {
        name: 'Lisa Park',
        address1: '789 Pine Blvd',
        city: 'Seattle',
        province: 'WA',
        zip: '98101',
        country: 'United States'
      },
      lastSyncedAt: '2025-06-28T09:15:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toISOString());

  // Available artists for assignment
  const availableArtists = [
    { id: '1', name: 'Demo Artist', onTimeRate: 85 },
    { id: '2', name: 'Sarah Johnson', onTimeRate: 92 },
    { id: '3', name: 'Mike Chen', onTimeRate: 88 },
    { id: '4', name: 'Lisa Park', onTimeRate: 78 }
  ];

  // Status configurations
  const statusConfig = {
    all: { label: 'All Orders', color: 'gray' },
    pending_assignment: { label: 'Pending Assignment', color: 'yellow' },
    in_progress: { label: 'In Progress', color: 'blue' },
    ready_for_review: { label: 'Ready for Review', color: 'purple' },
    completed: { label: 'Completed', color: 'green' },
    on_hold: { label: 'On Hold', color: 'red' }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = `${order.customerName} ${order.shopifyOrderNumber} ${order.customerEmail}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending_assignment').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    // Simulate API call to sync with Shopify
    setTimeout(() => {
      setLastSyncTime(new Date().toISOString());
      setIsSyncing(false);
      // In real implementation, fetch new orders from API
    }, 2000);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleAssignArtist = (orderId, itemId, artistName) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, assignedArtist: artistName, status: 'assigned' };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.all;
    return `bg-${config.color}-100 text-${config.color}-800`;
  };

  const getStatusText = (status) => {
    const config = statusConfig[status] || statusConfig.all;
    return config.label;
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff <= 0) return { expired: true, text: 'OVERDUE' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return { expired: false, text: `${days}d ${hours % 24}h left` };
    return { expired: false, text: `${hours}h left` };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getOrderProgress = (order) => {
    const totalItems = order.items.length;
    const completedItems = order.items.filter(item => item.status === 'completed').length;
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          color="blue"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Pending Assignment"
          value={stats.pending}
          icon={Clock}
          color="yellow"
          themeClasses={themeClasses}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Users}
          color="purple"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          themeClasses={themeClasses}
        />
      </div>

      {/* Shopify Sync Panel */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Shopify Integration</h3>
              <p className="text-sm text-gray-600">
                Last synced: {formatDate(lastSyncTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSyncModal(true)}
              className="btn btn-secondary inline-flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className="btn btn-primary inline-flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>Order Management</h2>
            <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
              Manage Shopify orders and artist assignments
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button className="btn btn-secondary inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 w-full px-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
            />
          </div>
          
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-10 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-gray-50 ${themeClasses.border} border-b`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Order
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Customer
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Progress
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Due Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${themeClasses.cardBg} divide-y ${themeClasses.border}`}>
              {filteredOrders.map((order) => {
                const timeRemaining = getTimeRemaining(order.dueDate);
                const progress = getOrderProgress(order);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                            {order.shopifyOrderNumber}
                          </div>
                          <div className={`text-xs ${themeClasses.textMuted}`}>
                            Shopify ID: {order.shopifyOrderId}
                          </div>
                          <div className={`text-xs ${themeClasses.textMuted}`}>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                          {order.customerName}
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          {order.customerEmail}
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          {order.shippingAddress.city}, {order.shippingAddress.province}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className={`ml-2 text-xs ${themeClasses.textMuted}`}>
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm ${themeClasses.textPrimary}`}>
                          {new Date(order.dueDate).toLocaleDateString()}
                        </div>
                        <div className={`text-xs ${timeRemaining.expired ? 'text-red-600 font-medium' : themeClasses.textMuted}`}>
                          {timeRemaining.text}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://admin.shopify.com/store/your-store/orders/${order.shopifyOrderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                          title="View in Shopify"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>No orders found</h3>
            <p className={`${themeClasses.textMuted}`}>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here when synced from Shopify'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          availableArtists={availableArtists}
          onAssignArtist={handleAssignArtist}
          themeClasses={themeClasses}
        />
      )}

      {/* Sync Settings Modal */}
      {showSyncModal && (
        <SyncSettingsModal
          onClose={() => setShowSyncModal(false)}
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
    yellow: 'from-yellow-500 to-yellow-600'
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

// Order Detail Modal
const OrderDetailModal = ({ order, onClose, availableArtists, onAssignArtist, themeClasses }) => {
  const [selectedArtists, setSelectedArtists] = useState({});

  const handleArtistChange = (itemId, artistName) => {
    setSelectedArtists(prev => ({ ...prev, [itemId]: artistName }));
  };

  const handleAssign = (itemId) => {
    const artistName = selectedArtists[itemId];
    if (artistName) {
      onAssignArtist(order.id, itemId, artistName);
      setSelectedArtists(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Order {order.shopifyOrderNumber}
              </h3>
              <p className={`text-sm ${themeClasses.textMuted}`}>
                Shopify ID: {order.shopifyOrderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 rounded-lg ${themeClasses.textMuted}`}
            >
              ×
            </button>
          </div>

          {/* Customer Info */}
          <div className={`${themeClasses.border} border rounded-lg p-4 mb-6`}>
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Name</p>
                <p className={`font-medium ${themeClasses.textPrimary}`}>{order.customerName}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Email</p>
                <p className={`font-medium ${themeClasses.textPrimary}`}>{order.customerEmail}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Shipping Address</p>
                <p className={`font-medium ${themeClasses.textPrimary}`}>
                  {order.shippingAddress.address1}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Order Total</p>
                <p className={`font-medium ${themeClasses.textPrimary}`}>${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-4`}>Order Items</h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className={`${themeClasses.border} border rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className={`font-medium ${themeClasses.textPrimary}`}>
                        {item.productTitle}
                      </h5>
                      <p className={`text-sm ${themeClasses.textMuted}`}>
                        SKU: {item.sku} • Style: {item.paintingStyle}
                      </p>
                      <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'unassigned' ? 'Unassigned' : 
                       item.status === 'assigned' ? 'Assigned' :
                       item.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>

                  {item.customerNotes && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Customer Notes:</p>
                      <p className="text-sm text-blue-700">{item.customerNotes}</p>
                    </div>
                  )}

                  {item.assignedArtist ? (
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-green-600 font-medium">
                        Assigned to: {item.assignedArtist}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <select
                        value={selectedArtists[item.id] || ''}
                        onChange={(e) => handleArtistChange(item.id, e.target.value)}
                        className={`flex-1 px-3 py-2 border ${themeClasses.border} rounded-lg text-sm`}
                      >
                        <option value="">Select artist...</option>
                        {availableArtists.map((artist) => (
                          <option key={artist.id} value={artist.name}>
                            {artist.name} ({artist.onTimeRate}% on-time)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(item.id)}
                        disabled={!selectedArtists[item.id]}
                        className="btn btn-primary text-sm disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sync Settings Modal
const SyncSettingsModal = ({ onClose, themeClasses }) => {
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 15,
    shopifyDomain: 'your-store.myshopify.com',
    apiKey: 'sk_*********************',
    webhookEnabled: true
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
            Shopify Sync Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Shopify Store Domain
              </label>
              <input
                type="text"
                value={settings.shopifyDomain}
                onChange={(e) => setSettings({...settings, shopifyDomain: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                  Auto Sync
                </label>
                <p className={`text-xs ${themeClasses.textMuted}`}>
                  Automatically sync new orders
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => setSettings({...settings, autoSync: e.target.checked})}
                className="h-4 w-4 text-blue-600"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Sync Interval (minutes)
              </label>
              <input
                type="number"
                value={settings.syncInterval}
                onChange={(e) => setSettings({...settings, syncInterval: parseInt(e.target.value)})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                  Webhook Enabled
                </label>
                <p className={`text-xs ${themeClasses.textMuted}`}>
                  Real-time order notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.webhookEnabled}
                onChange={(e) => setSettings({...settings, webhookEnabled: e.target.checked})}
                className="h-4 w-4 text-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
