import React, { useState, useEffect } from 'react';
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
  Upload,
  FileText,
  Send,
  ArrowRight,
  UserCheck,
  Palette,
  Image,
  Truck,
  Building,
  X,
  Plus
} from 'lucide-react';

const OrderManagement = ({ themeClasses }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toISOString());

  // Available artists for assignment
  const availableArtists = [
    { id: '1', name: 'Demo Artist', onTimeRate: 85, speciality: 'Pet Portraits' },
    { id: '2', name: 'Sarah Johnson', onTimeRate: 92, speciality: 'Family Portraits' },
    { id: '3', name: 'Mike Chen', onTimeRate: 88, speciality: 'House Portraits' },
    { id: '4', name: 'Lisa Park', onTimeRate: 78, speciality: 'Abstract Art' }
  ];

  // Workflow status configurations
  const workflowStatuses = {
    'waiting_for_photos': { 
      label: 'Waiting for Photos', 
      color: 'orange', 
      icon: Upload,
      description: 'Customer needs to upload photos',
      nextActions: ['Send photo reminder', 'Contact customer']
    },
    'pending_assign': { 
      label: 'Pending Assignment', 
      color: 'yellow', 
      icon: UserCheck,
      description: 'Ready to assign to artist',
      nextActions: ['Assign to artist', 'Put on hold']
    },
    'in_progress': { 
      label: 'In Progress', 
      color: 'blue', 
      icon: Palette,
      description: 'Artist is painting',
      nextActions: ['Check progress', 'Send reminder']
    },
    'pending_edit': { 
      label: 'Pending Edit', 
      color: 'purple', 
      icon: Edit,
      description: 'Waiting for editor',
      nextActions: ['Rush edit', 'Reassign editor']
    },
    'pending_qc': { 
      label: 'Pending QC', 
      color: 'indigo', 
      icon: Eye,
      description: 'Ready for admin QC',
      nextActions: ['Approve', 'Request revision']
    },
    'revisor_review': { 
      label: 'Customer Revision', 
      color: 'pink', 
      icon: RotateCcw,
      description: 'Customer requested changes',
      nextActions: ['Fix revision', 'Send to artist']
    },
    'artist_revision': { 
      label: 'Artist Revision', 
      color: 'red', 
      icon: Palette,
      description: 'Artist fixing revision',
      nextActions: ['Check progress', 'Contact artist']
    },
    'final_qc': { 
      label: 'Final QC', 
      color: 'green', 
      icon: CheckCircle,
      description: 'Final quality check',
      nextActions: ['Send to fulfillment', 'Studio fulfillment']
    },
    'studio_fulfillment': { 
      label: 'Studio Fulfillment', 
      color: 'gray', 
      icon: Building,
      description: 'Being fulfilled by studio',
      nextActions: ['Mark complete', 'Check status']
    },
    'completed': { 
      label: 'Completed', 
      color: 'green', 
      icon: CheckCircle,
      description: 'Order completed and delivered',
      nextActions: ['View details', 'Reorder']
    }
  };

  // Fetch real orders from Shopify API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://riverry-workflow-production.up.railway.app/api/shopify/orders');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform Shopify orders to our workflow format
        const transformedOrders = data.orders.map(shopifyOrder => ({
          id: shopifyOrder.id.toString(),
          shopifyOrderId: shopifyOrder.id.toString(),
          shopifyOrderNumber: shopifyOrder.name,
          customerName: shopifyOrder.customer ? 
            `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim() : 
            'Unknown Customer',
          customerEmail: shopifyOrder.customer?.email || shopifyOrder.email || '',
          status: determineWorkflowStatus(shopifyOrder),
          totalAmount: parseFloat(shopifyOrder.total_price || 0),
          createdAt: shopifyOrder.created_at,
          dueDate: calculateDueDate(shopifyOrder.created_at),
          priority: determinePriority(shopifyOrder),
          fulfillmentType: determineFulfillmentType(shopifyOrder),
          items: shopifyOrder.line_items?.map(item => ({
            id: `${shopifyOrder.id}-${item.id || Math.random()}`,
            productTitle: item.title || item.name || 'Unknown Product',
            sku: item.sku || `shopify-${item.product_id || 'unknown'}`,
            paintingStyle: getPaintingStyleFromTitle(item.title || ''),
            quantity: item.quantity || 1,
            price: parseFloat(item.price || 0),
            assignedArtist: null,
            status: 'unassigned',
            customerNotes: getCustomerNotes(item, shopifyOrder),
            isDigital: isDigitalProduct(item)
          })) || [],
          shippingAddress: {
            name: shopifyOrder.shipping_address?.name || 
                  (shopifyOrder.customer ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}` : ''),
            address1: shopifyOrder.shipping_address?.address1 || '',
            city: shopifyOrder.shipping_address?.city || '',
            province: shopifyOrder.shipping_address?.province || '',
            zip: shopifyOrder.shipping_address?.zip || '',
            country: shopifyOrder.shipping_address?.country || ''
          },
          customerNotes: shopifyOrder.note || '',
          tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map(tag => tag.trim()) : [],
          lastSyncedAt: new Date().toISOString(),
          workflowHistory: [
            {
              status: 'waiting_for_photos',
              timestamp: shopifyOrder.created_at,
              user: 'System',
              notes: 'Order received from Shopify'
            }
          ]
        }));
        
        setOrders(transformedOrders);
        setLastSyncTime(new Date().toISOString());
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const determineWorkflowStatus = (shopifyOrder) => {
    if (shopifyOrder.cancelled_at) return 'cancelled';
    if (shopifyOrder.fulfillment_status === 'fulfilled') return 'completed';
    if (shopifyOrder.financial_status === 'paid') {
      // Check if customer uploaded photos (this would come from your system)
      return 'pending_assign'; // Default to pending assignment for paid orders
    }
    return 'waiting_for_photos';
  };

  const calculateDueDate = (createdAt) => {
    const created = new Date(createdAt);
    const due = new Date(created);
    due.setDate(due.getDate() + 7); // 7 business days
    return due.toISOString();
  };

  const determinePriority = (shopifyOrder) => {
    const tags = shopifyOrder.tags ? shopifyOrder.tags.toLowerCase() : '';
    if (tags.includes('rush') || tags.includes('urgent')) return 'urgent';
    if (tags.includes('vip') || tags.includes('priority')) return 'high';
    return 'normal';
  };

  const determineFulfillmentType = (shopifyOrder) => {
    const hasDigitalItems = shopifyOrder.line_items?.some(item => 
      item.title?.toLowerCase().includes('digital') || 
      item.sku?.toLowerCase().includes('digital')
    );
    return hasDigitalItems ? 'digital' : 'physical';
  };

  const getPaintingStyleFromTitle = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('pet')) return 'Pet Portrait';
    if (titleLower.includes('family')) return 'Family Portrait';
    if (titleLower.includes('house') || titleLower.includes('home')) return 'House Portrait';
    if (titleLower.includes('memorial')) return 'Pet Memorial';
    if (titleLower.includes('couple')) return 'Couple Portrait';
    if (titleLower.includes('watercolor')) return 'Watercolor';
    if (titleLower.includes('oil')) return 'Oil Painting';
    return 'Custom Portrait';
  };

  const getCustomerNotes = (item, order) => {
    // Check for line item properties (Shopify custom fields)
    const properties = item.properties || [];
    const notesProperty = properties.find(p => 
      p.name?.toLowerCase().includes('note') || 
      p.name?.toLowerCase().includes('instruction')
    );
    
    if (notesProperty) return notesProperty.value;
    if (order.note) return order.note;
    return 'No special instructions provided';
  };

  const isDigitalProduct = (item) => {
    return item.title?.toLowerCase().includes('digital') || 
           item.sku?.toLowerCase().includes('digital') ||
           item.product_type?.toLowerCase().includes('digital');
  };

  // Status change handler
  const handleStatusChange = async (orderId, newStatus, notes = '') => {
    try {
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus,
            workflowHistory: [
              ...order.workflowHistory,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                user: 'Admin', // This would come from auth context
                notes: notes || `Status changed to ${workflowStatuses[newStatus]?.label}`
              }
            ]
          };
          return updatedOrder;
        }
        return order;
      }));

      // Here you would make an API call to update the order status in your database
      console.log(`Order ${orderId} status changed to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Artist assignment handler
  const handleAssignArtist = async (orderId, itemId, artistName) => {
    try {
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'in_progress',
            items: order.items.map(item => {
              if (item.id === itemId) {
                return { ...item, assignedArtist: artistName, status: 'assigned' };
              }
              return item;
            }),
            workflowHistory: [
              ...order.workflowHistory,
              {
                status: 'in_progress',
                timestamp: new Date().toISOString(),
                user: 'Admin',
                notes: `Assigned to artist: ${artistName}`
              }
            ]
          };
        }
        return order;
      }));

      console.log(`Order ${orderId} item ${itemId} assigned to ${artistName}`);
      
    } catch (error) {
      console.error('Error assigning artist:', error);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    await fetchOrders();
    setIsSyncing(false);
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
    waitingPhotos: orders.filter(o => o.status === 'waiting_for_photos').length,
    pendingAssign: orders.filter(o => o.status === 'pending_assign').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    pendingQC: orders.filter(o => o.status === 'pending_qc').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const config = workflowStatuses[status];
    if (!config) return 'bg-gray-100 text-gray-800';
    return `bg-${config.color}-100 text-${config.color}-800`;
  };

  const getStatusText = (status) => {
    return workflowStatuses[status]?.label || status;
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
    const statusOrder = ['waiting_for_photos', 'pending_assign', 'in_progress', 'pending_edit', 'pending_qc', 'final_qc', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    return Math.round((currentIndex / (statusOrder.length - 1)) * 100);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Shopify orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-red-800 font-medium">Error loading orders</h3>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 btn btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          color="blue"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Waiting Photos"
          value={stats.waitingPhotos}
          icon={Upload}
          color="orange"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Pending Assign"
          value={stats.pendingAssign}
          icon={UserCheck}
          color="yellow"
          themeClasses={themeClasses}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Palette}
          color="blue"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(0)}`}
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
                Last synced: {formatDate(lastSyncTime)} • {stats.total} orders • riverry.myshopify.com
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
              Complete workflow management • Real-time Shopify integration
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button className="btn btn-secondary inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="btn btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Manual Order
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <input
              type="text"
              placeholder="Search orders, customers, SKUs..."
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
              <option value="all">All Statuses</option>
              {Object.entries(workflowStatuses).map(([key, config]) => (
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
                const StatusIcon = workflowStatuses[order.status]?.icon || Package;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <StatusIcon className={`w-5 h-5 text-${workflowStatuses[order.status]?.color || 'gray'}-600`} />
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                            #{order.shopifyOrderNumber}
                          </div>
                          <div className={`text-xs ${themeClasses.textMuted}`}>
                            ID: {order.shopifyOrderId}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(order.priority)}`}>
                              {order.priority}
                            </span>
                            {order.fulfillmentType === 'digital' && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                Digital
                              </span>
                            )}
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
                        <div className={`text-xs ${themeClasses.textMuted} mt-1`}>
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        {order.items.some(item => item.assignedArtist) && (
                          <div className="mt-1 text-xs text-gray-500">
                            Assigned to: {order.items.find(item => item.assignedArtist)?.assignedArtist}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : progress >= 80 ? 'bg-blue-500' : progress >= 40 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className={`ml-2 text-xs ${themeClasses.textMuted}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className={`text-xs ${themeClasses.textMuted} mt-1`}>
                          {workflowStatuses[order.status]?.description}
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
                        <div className={`text-xs ${themeClasses.textMuted}`}>
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className={`text-xs ${themeClasses.textMuted}`}>
                        {order.items.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://admin.shopify.com/store/riverry/orders/${order.shopifyOrderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="View in Shopify"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {order.status === 'pending_assign' && (
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-purple-600 hover:text-purple-800 p-1 rounded"
                            title="Assign artist"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
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
            <button
              onClick={handleSyncOrders}
              className="mt-4 btn btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Orders Now
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <EnhancedOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          availableArtists={availableArtists}
          onAssignArtist={handleAssignArtist}
          onStatusChange={handleStatusChange}
          workflowStatuses={workflowStatuses}
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

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, themeClasses, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${themeClasses.textMuted}`}>{title}</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary} mt-1`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Enhanced Order Detail Modal with Full Workflow Management
const EnhancedOrderModal = ({ order, onClose, availableArtists, onAssignArtist, onStatusChange, workflowStatuses, themeClasses }) => {
  const [selectedArtists, setSelectedArtists] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [newStatusNotes, setNewStatusNotes] = useState('');

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

  const handleStatusChange = (newStatus) => {
    onStatusChange(order.id, newStatus, newStatusNotes);
    setNewStatusNotes('');
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      'waiting_for_photos': ['pending_assign'],
      'pending_assign': ['in_progress', 'on_hold'],
      'in_progress': ['pending_edit', 'artist_revision'],
      'pending_edit': ['pending_qc'],
      'pending_qc': ['final_qc', 'pending_edit'],
      'revisor_review': ['final_qc', 'artist_revision'],
      'artist_revision': ['revisor_review'],
      'final_qc': ['studio_fulfillment', 'completed'],
      'studio_fulfillment': ['completed']
    };
    return statusFlow[currentStatus] || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
                  Order #{order.shopifyOrderNumber}
                </h3>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Shopify ID: {order.shopifyOrderId} • Created: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${workflowStatuses[order.status]?.color || 'gray'}-100 text-${workflowStatuses[order.status]?.color || 'gray'}-800`}>
                  {workflowStatuses[order.status]?.label || order.status}
                </span>
                {order.priority === 'urgent' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    URGENT
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 rounded-lg ${themeClasses.textMuted}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-gray-200">
            {[
              { id: 'details', label: 'Order Details', icon: FileText },
              { id: 'workflow', label: 'Workflow', icon: ArrowRight },
              { id: 'items', label: 'Items & Assignment', icon: Package },
              { id: 'history', label: 'History', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'details' && (
              <OrderDetailsTab order={order} themeClasses={themeClasses} />
            )}
            
            {activeTab === 'workflow' && (
              <WorkflowTab 
                order={order} 
                workflowStatuses={workflowStatuses}
                onStatusChange={handleStatusChange}
                getNextStatuses={getNextStatuses}
                newStatusNotes={newStatusNotes}
                setNewStatusNotes={setNewStatusNotes}
                themeClasses={themeClasses} 
              />
            )}
            
            {activeTab === 'items' && (
              <ItemsAssignmentTab 
                order={order}
                availableArtists={availableArtists}
                selectedArtists={selectedArtists}
                onArtistChange={handleArtistChange}
                onAssign={handleAssign}
                themeClasses={themeClasses}
              />
            )}
            
            {activeTab === 'history' && (
              <HistoryTab order={order} themeClasses={themeClasses} />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <a
                href={`https://admin.shopify.com/store/riverry/orders/${order.shopifyOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Shopify
              </a>
              {order.status === 'pending_assign' && (
                <button className="btn btn-primary">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Quick Assign
                </button>
              )}
            </div>
            
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

// Order Details Tab Component
const OrderDetailsTab = ({ order, themeClasses }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Customer Information */}
    <div className={`${themeClasses.border} border rounded-lg p-4`}>
      <h4 className={`font-medium ${themeClasses.textPrimary} mb-3 flex items-center`}>
        <User className="w-5 h-5 mr-2" />
        Customer Information
      </h4>
      <div className="space-y-3">
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
            {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}<br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>
    </div>

    {/* Order Summary */}
    <div className={`${themeClasses.border} border rounded-lg p-4`}>
      <h4 className={`font-medium ${themeClasses.textPrimary} mb-3 flex items-center`}>
        <Package className="w-5 h-5 mr-2" />
        Order Summary
      </h4>
      <div className="space-y-3">
        <div>
          <p className={`text-sm ${themeClasses.textMuted}`}>Order Total</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>${order.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.textMuted}`}>Items</p>
          <p className={`font-medium ${themeClasses.textPrimary}`}>{order.items.length} items</p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.textMuted}`}>Fulfillment Type</p>
          <p className={`font-medium ${themeClasses.textPrimary} capitalize`}>{order.fulfillmentType}</p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.textMuted}`}>Priority</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
            order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.priority}
          </span>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.textMuted}`}>Due Date</p>
          <p className={`font-medium ${themeClasses.textPrimary}`}>
            {new Date(order.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>

    {/* Customer Notes */}
    {order.customerNotes && (
      <div className={`lg:col-span-2 ${themeClasses.border} border rounded-lg p-4`}>
        <h4 className={`font-medium ${themeClasses.textPrimary} mb-3 flex items-center`}>
          <FileText className="w-5 h-5 mr-2" />
          Customer Notes
        </h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{order.customerNotes}</p>
        </div>
      </div>
    )}

    {/* Tags */}
    {order.tags && order.tags.length > 0 && (
      <div className={`lg:col-span-2 ${themeClasses.border} border rounded-lg p-4`}>
        <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Tags</h4>
        <div className="flex flex-wrap gap-2">
          {order.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Workflow Tab Component  
const WorkflowTab = ({ order, workflowStatuses, onStatusChange, getNextStatuses, newStatusNotes, setNewStatusNotes, themeClasses }) => {
  const nextStatuses = getNextStatuses(order.status);
  const currentStatus = workflowStatuses[order.status];
  const StatusIcon = currentStatus?.icon || Package;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={`${themeClasses.border} border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-${currentStatus?.color || 'gray'}-100`}>
            <StatusIcon className={`w-8 h-8 text-${currentStatus?.color || 'gray'}-600`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentStatus?.label || order.status}
            </h3>
            <p className="text-gray-600">
              {currentStatus?.description || 'Current status'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <div className={`${themeClasses.border} border rounded-lg p-6`}>
          <h4 className={`font-medium ${themeClasses.textPrimary} mb-4`}>Available Actions</h4>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                Change Status To:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nextStatuses.map(statusKey => {
                  const status = workflowStatuses[statusKey];
                  const Icon = status?.icon || ArrowRight;
                  return (
                    <button
                      key={statusKey}
                      onClick={() => onStatusChange(statusKey)}
                      className={`flex items-center p-3 border-2 border-dashed border-${status?.color || 'gray'}-300 rounded-lg hover:border-${status?.color || 'gray'}-500 hover:bg-${status?.color || 'gray'}-50 transition-colors`}
                    >
                      <Icon className={`w-5 h-5 text-${status?.color || 'gray'}-600 mr-3`} />
                      <div className="text-left">
                        <div className={`font-medium text-${status?.color || 'gray'}-900`}>
                          {status?.label || statusKey}
                        </div>
                        <div className={`text-sm text-${status?.color || 'gray'}-600`}>
                          {status?.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                Notes (Optional)
              </label>
              <textarea
                value={newStatusNotes}
                onChange={(e) => setNewStatusNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500`}
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`${themeClasses.border} border rounded-lg p-6`}>
        <h4 className={`font-medium ${themeClasses.textPrimary} mb-4`}>Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentStatus?.nextActions?.map((action, index) => (
            <button
              key={index}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{action}</div>
            </button>
          )) || (
            <p className="text-gray-500 col-span-3">No quick actions available for current status</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Items & Assignment Tab Component
const ItemsAssignmentTab = ({ order, availableArtists, selectedArtists, onArtistChange, onAssign, themeClasses }) => (
  <div className="space-y-6">
    <h4 className={`font-medium ${themeClasses.textPrimary} mb-4`}>
      Order Items ({order.items.length})
    </h4>
    
    <div className="space-y-4">
      {order.items.map((item) => (
        <div key={item.id} className={`${themeClasses.border} border rounded-lg p-4`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h5 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
                {item.productTitle}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className={`${themeClasses.textMuted}`}>SKU</p>
                  <p className={`font-medium ${themeClasses.textPrimary}`}>{item.sku}</p>
                </div>
                <div>
                  <p className={`${themeClasses.textMuted}`}>Style</p>
                  <p className={`font-medium ${themeClasses.textPrimary}`}>{item.paintingStyle}</p>
                </div>
                <div>
                  <p className={`${themeClasses.textMuted}`}>Quantity</p>
                  <p className={`font-medium ${themeClasses.textPrimary}`}>{item.quantity}</p>
                </div>
                <div>
                  <p className={`${themeClasses.textMuted}`}>Price</p>
                  <p className={`font-medium ${themeClasses.textPrimary}`}>${item.price.toFixed(2)}</p>
                </div>
              </div>
              {item.isDigital && (
                <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Digital Product
                </span>
              )}
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

          {/* Customer Notes for Item */}
          {item.customerNotes && item.customerNotes !== 'No special instructions provided' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Customer Instructions:</p>
                  <p className="text-sm text-blue-700">{item.customerNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Artist Assignment */}
          {item.assignedArtist ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-sm">
                <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-green-600 font-medium">
                  Assigned to: {item.assignedArtist}
                </span>
                {availableArtists.find(a => a.name === item.assignedArtist) && (
                  <span className="ml-2 text-green-500">
                    ({availableArtists.find(a => a.name === item.assignedArtist).onTimeRate}% on-time)
                  </span>
                )}
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Reassign
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <select
                value={selectedArtists[item.id] || ''}
                onChange={(e) => onArtistChange(item.id, e.target.value)}
                className={`flex-1 px-3 py-2 border ${themeClasses.border} rounded-lg text-sm`}
              >
                <option value="">Select artist...</option>
                {availableArtists.map((artist) => (
                  <option key={artist.id} value={artist.name}>
                    {artist.name} ({artist.onTimeRate}% on-time) - {artist.speciality}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onAssign(item.id)}
                disabled={!selectedArtists[item.id]}
                className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Assign
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Bulk Assignment */}
    {order.items.some(item => !item.assignedArtist) && (
      <div className={`${themeClasses.border} border rounded-lg p-4 bg-yellow-50`}>
        <h4 className="font-medium text-yellow-800 mb-3">Bulk Assignment</h4>
        <div className="flex items-center space-x-3">
          <select className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm">
            <option value="">Assign all unassigned items to...</option>
            {availableArtists.map((artist) => (
              <option key={artist.id} value={artist.name}>
                {artist.name} ({artist.onTimeRate}% on-time) - {artist.speciality}
              </option>
            ))}
          </select>
          <button className="btn bg-yellow-600 text-white hover:bg-yellow-700 text-sm">
            <Users className="w-4 h-4 mr-1" />
            Assign All
          </button>
        </div>
      </div>
    )}
  </div>
);

// History Tab Component
const HistoryTab = ({ order, themeClasses }) => (
  <div className="space-y-4">
    <h4 className={`font-medium ${themeClasses.textPrimary} mb-4`}>
      Workflow History
    </h4>
    
    <div className="space-y-4">
      {order.workflowHistory?.map((entry, index) => (
        <div key={index} className={`flex items-start space-x-4 p-4 ${themeClasses.border} border rounded-lg`}>
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full bg-blue-500 mt-2`}></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h5 className={`font-medium ${themeClasses.textPrimary}`}>
                Status changed to: {entry.status}
              </h5>
              <span className={`text-sm ${themeClasses.textMuted}`}>
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
              By: {entry.user}
            </p>
            {entry.notes && (
              <p className={`text-sm ${themeClasses.textSecondary} mt-2 p-2 bg-gray-50 rounded`}>
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      )) || (
        <p className="text-gray-500 text-center py-8">No workflow history available</p>
      )}
    </div>
  </div>
);

// Sync Settings Modal
const SyncSettingsModal = ({ onClose, themeClasses }) => {
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 15,
    shopifyDomain: 'riverry.myshopify.com',
    webhookEnabled: false
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
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg`}
                disabled
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
                  Real-time order notifications (coming soon)
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.webhookEnabled}
                onChange={(e) => setSettings({...settings, webhookEnabled: e.target.checked})}
                className="h-4 w-4 text-blue-600"
                disabled
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
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
