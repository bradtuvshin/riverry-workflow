import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, Download, Eye, Edit, Package, Clock, DollarSign, User, MapPin, Calendar, AlertCircle, CheckCircle, XCircle, Users, Play, Pause, RotateCcw, ExternalLink, Zap, Settings, Upload, FileText, Send, ArrowRight, UserCheck, Palette, Image, Truck, Building, X, AlertTriangle, ChevronDown, ChevronRight, Plus
} from 'lucide-react';

const OrderManagement = ({ themeClasses, userRole = 'admin' }) => {
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
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [statusOverrides, setStatusOverrides] = useState(new Map());
  const [addOnOverrides, setAddOnOverrides] = useState(new Map());

  const availableArtists = [
    { id: '1', name: 'Demo Artist', onTimeRate: 85, speciality: 'Pet Portraits' },
    { id: '2', name: 'Sarah Johnson', onTimeRate: 92, speciality: 'Family Portraits' },
    { id: '3', name: 'Mike Chen', onTimeRate: 88, speciality: 'House Portraits' },
    { id: '4', name: 'Lisa Park', onTimeRate: 78, speciality: 'Abstract Art' }
  ];

  const workflowStatuses = {
    'waiting_for_photos': { label: 'Waiting for Photos', color: 'orange', icon: Upload, description: 'Customer needs to upload reference photos', nextActions: ['Send photo reminder', 'Contact customer'] },
    'pending_assign': { label: 'Pending Assignment', color: 'yellow', icon: UserCheck, description: 'Ready to assign to artist (photos received)', nextActions: ['Assign to artist', 'Smart assignment'] },
    'in_progress': { label: 'In Progress', color: 'blue', icon: Palette, description: 'Artist is working on the painting', nextActions: ['Check progress', 'Send reminder'] },
    'pending_edit': { label: 'Pending Edit', color: 'purple', icon: Edit, description: 'Editor needs to edit artist raw files', nextActions: ['Rush edit', 'Reassign editor'] },
    'pending_qc': { label: 'Pending QC', color: 'indigo', icon: Eye, description: 'Admin needs to QC edited files before customer', nextActions: ['Approve & Send Proof', 'Reject to Editor'] },
    'revisor_review': { label: 'Customer Revision', color: 'pink', icon: RotateCcw, description: 'Customer requested changes, revisor handling', nextActions: ['Fix revision', 'Send to artist', 'Send direct to customer'] },
    'artist_revision': { label: 'Artist Revision', color: 'red', icon: Palette, description: 'Artist fixing issues revisor could not handle', nextActions: ['Check progress', 'Contact artist'] },
    'final_qc': { label: 'Final QC', color: 'green', icon: CheckCircle, description: 'Customer approved, admin choosing fulfillment method', nextActions: ['Send to PD', 'Studio fulfillment'] },
    'studio_fulfillment': { label: 'Studio Fulfillment', color: 'gray', icon: Building, description: 'Being fulfilled by studio (manual process)', nextActions: ['Mark complete', 'Check status'] },
    'completed': { label: 'Completed', color: 'green', icon: CheckCircle, description: 'Order finished and shipped/delivered', nextActions: ['View details', 'Reorder'] }
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      'waiting_for_photos': ['pending_assign'],
      'pending_assign': ['in_progress'],
      'in_progress': ['pending_edit'],
      'pending_edit': ['pending_qc'],
      'pending_qc': ['final_qc', 'pending_edit'],
      'revisor_review': ['artist_revision'],
      'artist_revision': ['revisor_review'],
      'final_qc': ['studio_fulfillment', 'completed'],
      'studio_fulfillment': ['completed']
    };
    return statusFlow[currentStatus] || [];
  };

  const getPortalStatuses = (role) => {
    const portalFilters = {
      'admin': ['pending_assign', 'pending_qc', 'final_qc'],
      'artist': ['in_progress', 'artist_revision'],
      'editor': ['pending_edit'],
      'revisor': ['revisor_review', 'artist_revision'],
      'master': Object.keys(workflowStatuses)
    };
    return portalFilters[role] || Object.keys(workflowStatuses);
  };

  const addOnPatterns = ['rush', 'gift', 'shipping', 'upgrade', 'express', 'priority', 'expedite', 'message', 'wrap', 'package', 'frame', 'mat', 'rush order'];

  const detectAddOn = (item) => {
    const itemText = `${item.title} ${item.sku || ''} ${item.variant_title || ''}`.toLowerCase();
    return addOnPatterns.some(pattern => itemText.includes(pattern));
  };

  const extractFulfillByDate = (order) => {
    const notes = order.note || '';
    const attributes = order.note_attributes || [];
    
    const fulfillByAttr = attributes.find(attr => 
      attr.name?.toLowerCase().includes('fulfill') || 
      attr.name?.toLowerCase().includes('due') ||
      attr.name?.toLowerCase().includes('deadline')
    );
    
    if (fulfillByAttr?.value) return fulfillByAttr.value;
    
    const dateMatch = notes.match(/fulfill[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|due[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dateMatch) return dateMatch[1] || dateMatch[2];
    
    const tags = order.tags ? order.tags.toLowerCase() : '';
    if (tags.includes('rush') || tags.includes('urgent')) {
      const orderDate = new Date(order.created_at);
      orderDate.setDate(orderDate.getDate() + 3);
      return orderDate.toISOString().split('T')[0];
    }
    
    const orderDate = new Date(order.created_at);
    orderDate.setDate(orderDate.getDate() + 7);
    return orderDate.toISOString().split('T')[0];
  };

  const getFulfillByUrgency = (fulfillByDate) => {
    if (!fulfillByDate) return 'good';
    const today = new Date();
    const fulfillDate = new Date(fulfillByDate);
    const diffDays = Math.ceil((fulfillDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'urgent';
    if (diffDays <= 5) return 'warning';
    return 'good';
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-red-50 text-red-700 border-red-100';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'good': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'overdue':
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

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
        const transformedOrders = data.orders.map(shopifyOrder => ({
          id: shopifyOrder.id.toString(),
          shopifyOrderId: shopifyOrder.id.toString(),
          shopifyOrderNumber: shopifyOrder.name,
          customerName: shopifyOrder.customer ? 
            `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim() : 
            'Unknown Customer',
          customerEmail: shopifyOrder.customer?.email || shopifyOrder.email || '',
          status: statusOverrides.get(shopifyOrder.id.toString()) || determineWorkflowStatus(shopifyOrder),
          totalAmount: parseFloat(shopifyOrder.total_price || 0),
          createdAt: shopifyOrder.created_at,
          dueDate: calculateDueDate(shopifyOrder.created_at),
          fulfillByDate: extractFulfillByDate(shopifyOrder),
          priority: determinePriority(shopifyOrder),
          fulfillmentType: determineFulfillmentType(shopifyOrder),
          items: shopifyOrder.line_items?.map(item => ({
            id: `${shopifyOrder.id}-${item.id || Math.random()}`,
            productTitle: item.title || item.name || 'Unknown Product',
            sku: item.sku || `shopify-${item.product_id || 'unknown'}`,
            variantTitle: item.variant_title || '',
            paintingStyle: getPaintingStyleFromTitle(item.title || ''),
            quantity: item.quantity || 1,
            price: parseFloat(item.price || 0),
            assignedArtist: null,
            status: 'unassigned',
            customerNotes: getCustomerNotes(item, shopifyOrder),
            isDigital: isDigitalProduct(item),
            isAddOn: addOnOverrides.get(`${shopifyOrder.id}-${item.id}`) ?? detectAddOn(item)
          })) || [],
          shippingAddress: {
            name: shopifyOrder.shipping_address?.name || (shopifyOrder.customer ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}` : ''),
            address1: shopifyOrder.shipping_address?.address1 || '',
            city: shopifyOrder.shipping_address?.city || '',
            province: shopifyOrder.shipping_address?.province || '',
            zip: shopifyOrder.shipping_address?.zip || '',
            country: shopifyOrder.shipping_address?.country || ''
          },
          customerNotes: shopifyOrder.note || '',
          tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map(tag => tag.trim()) : [],
          lastSyncedAt: new Date().toISOString(),
          workflowHistory: [{
            status: 'waiting_for_photos',
            timestamp: shopifyOrder.created_at,
            user: 'System',
            notes: 'Order received from Shopify'
          }]
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

  const determineWorkflowStatus = (shopifyOrder) => {
    if (shopifyOrder.cancelled_at) return 'cancelled';
    if (shopifyOrder.fulfillment_status === 'fulfilled') return 'completed';
    if (shopifyOrder.financial_status === 'paid') return 'pending_assign';
    return 'waiting_for_photos';
  };

  const calculateDueDate = (createdAt) => {
    const created = new Date(createdAt);
    const due = new Date(created);
    due.setDate(due.getDate() + 7);
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

  const toggleAddOn = (orderId, itemId) => {
    const key = `${orderId}-${itemId}`;
    const currentValue = addOnOverrides.get(key);
    const order = orders.find(o => o.id === orderId);
    const item = order?.items?.find(i => i.id === itemId);
    
    if (!item) return;
    
    const newValue = currentValue !== undefined ? !currentValue : !detectAddOn(item);
    setAddOnOverrides(prev => new Map(prev.set(key, newValue)));
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? {
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, isAddOn: newValue } : item
            )
          }
        : order
    ));
  };

  const assignAllPaintable = (orderId, artistName) => {
    const order = orders.find(o => o.id === orderId);
    const paintableItems = order?.items?.filter(item => !item.isAddOn) || [];
    
    if (paintableItems.length > 0) {
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? {
              ...o,
              status: 'in_progress',
              items: o.items.map(item => 
                !item.isAddOn 
                  ? { ...item, assignedArtist: artistName, status: 'assigned' }
                  : item
              ),
              workflowHistory: [
                ...o.workflowHistory,
                {
                  status: 'in_progress',
                  timestamp: new Date().toISOString(),
                  user: 'Admin',
                  notes: `Smart assigned ${paintableItems.length} paintable items to ${artistName}`
                }
              ]
            }
          : o
      ));
      
      setStatusOverrides(prev => new Map(prev.set(orderId, 'in_progress')));
      console.log(`Smart assigned ${paintableItems.length} paintable items to ${artistName} for order ${orderId}`);
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes = '') => {
    try {
      setStatusOverrides(prev => new Map(prev.set(orderId, newStatus)));
      
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
                user: 'Admin',
                notes: notes || `Status changed to ${workflowStatuses[newStatus]?.label}`
              }
            ]
          };
          return updatedOrder;
        }
        return order;
      }));

      console.log(`Order ${orderId} status changed to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleFileUpload = (orderId, fileType, event) => {
    const files = Array.from(event.target.files);
    console.log(`Uploading ${files.length} files for order ${orderId}, type: ${fileType}`);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    await fetchOrders();
    setIsSyncing(false);
  };

  const portalStatuses = getPortalStatuses(userRole);
  const filteredOrders = orders.filter(order => {
    const matchesSearch = `${order.customerName} ${order.shopifyOrderNumber} ${order.customerEmail}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPortal = userRole === 'master' || portalStatuses.includes(order.status);
    return matchesSearch && matchesStatus && matchesPortal;
  });

  const stats = {
    total: filteredOrders.length,
    waitingPhotos: filteredOrders.filter(o => o.status === 'waiting_for_photos').length,
    pendingAssign: filteredOrders.filter(o => o.status === 'pending_assign').length,
    inProgress: filteredOrders.filter(o => o.status === 'in_progress').length,
    pendingQC: filteredOrders.filter(o => o.status === 'pending_qc').length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
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
        <button onClick={fetchOrders} className="mt-4 btn btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Orders" value={stats.total} icon={Package} color="blue" themeClasses={themeClasses} />
        <StatCard title="Waiting Photos" value={stats.waitingPhotos} icon={Upload} color="orange" themeClasses={themeClasses} />
        <StatCard title="Pending Assign" value={stats.pendingAssign} icon={UserCheck} color="yellow" themeClasses={themeClasses} />
        <StatCard title="In Progress" value={stats.inProgress} icon={Palette} color="blue" themeClasses={themeClasses} />
        <StatCard title="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={DollarSign} color="green" themeClasses={themeClasses} />
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
            <button onClick={() => setShowSyncModal(true)} className="btn btn-secondary inline-flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button onClick={handleSyncOrders} disabled={isSyncing} className="btn btn-primary inline-flex items-center">
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
            <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
              {userRole === 'master' ? 'Master Portal' : 
               userRole === 'admin' ? 'Admin Portal' : 
               userRole === 'artist' ? 'Artist Portal' :
               userRole === 'editor' ? 'Editor Portal' :
               userRole === 'revisor' ? 'Revisor Portal' : 'Order Management'}
            </h2>
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
              {portalStatuses.map(status => (
                <option key={status} value={status}>
                  {workflowStatuses[status]?.label || status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Orders Table */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-gray-50 ${themeClasses.border} border-b`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Order</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Customer</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Items</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Fulfill By</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Assignment</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${themeClasses.cardBg} divide-y ${themeClasses.border}`}>
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const urgency = getFulfillByUrgency(order.fulfillByDate);
                const paintableItems = order.items?.filter(item => !item.isAddOn) || [];
                const addOnItems = order.items?.filter(item => item.isAddOn) || [];
                const StatusIcon = workflowStatuses[order.status]?.icon || Package;
                
                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button onClick={() => toggleOrderExpansion(order.id)} className="mr-2 text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div className="flex-shrink-0">
                            <StatusIcon className={`w-5 h-5 text-${workflowStatuses[order.status]?.color || 'gray'}-600`} />
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>#{order.shopifyOrderNumber}</div>
                            <div className={`text-xs ${themeClasses.textMuted}`}>ID: {order.shopifyOrderId}</div>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(order.priority)}`}>{order.priority}</span>
                              {order.fulfillmentType === 'digital' && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Digital</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>{order.customerName}</div>
                          <div className={`text-xs ${themeClasses.textMuted}`}>{order.customerEmail}</div>
                          <div className={`text-xs ${themeClasses.textMuted}`}>{order.shippingAddress.city}, {order.shippingAddress.province}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`${themeClasses.textPrimary}`}>{paintableItems.length} paintable</div>
                          {addOnItems.length > 0 && (
                            <div className={`text-xs ${themeClasses.textMuted}`}>{addOnItems.length} add-on</div>
                          )}
                          <div className={`text-xs ${themeClasses.textMuted}`}>${order.totalAmount.toFixed(2)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm border ${getUrgencyStyles(urgency)}`}>
                          {getUrgencyIcon(urgency)}
                          <span className="ml-1">{formatDate(order.fulfillByDate)}</span>
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
                        {order.status === 'pending_assign' && paintableItems.length > 0 && (
                          <div className="space-y-1">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignAllPaintable(order.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Assign All Paintable</option>
                              {availableArtists.map(artist => (
                                <option key={artist.id} value={artist.name}>{artist.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleViewOrder(order)} className="text-blue-600 hover:text-blue-800 p-1 rounded" title="View order details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a href={`https://admin.shopify.com/store/riverry/orders/${order.shopifyOrderId}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 p-1 rounded" title="View in Shopify">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-3">Order Items</h4>
                              
                              {paintableItems.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Paintable Items ({paintableItems.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {paintableItems.map((item) => (
                                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{item.productTitle}</div>
                                            {item.variantTitle && (
                                              <div className="text-sm text-gray-600">{item.variantTitle}</div>
                                            )}
                                            <div className="text-sm text-gray-500">
                                              SKU: {item.sku || 'N/A'} • Qty: {item.quantity} • ${item.price}
                                            </div>
                                          </div>
                                          <button onClick={() => toggleAddOn(order.id, item.id)} className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                                            Mark as Add-on
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {addOnItems.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Package className="w-4 h-4 mr-2" />
                                    Add-on Items ({addOnItems.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {addOnItems.map((item) => (
                                      <div key={item.id} className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-700">{item.productTitle}</div>
                                            {item.variantTitle && (
                                              <div className="text-sm text-gray-600">{item.variantTitle}</div>
                                            )}
                                            <div className="text-sm text-gray-500">
                                              SKU: {item.sku || 'N/A'} • Qty: {item.quantity} • ${item.price}
                                            </div>
                                          </div>
                                          <button onClick={() => toggleAddOn(order.id, item.id)} className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                                            Mark as Paintable
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-3">File Management</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center mb-3">
                                    <User className="w-5 h-5 text-blue-600 mr-2" />
                                    <h5 className="font-medium text-gray-900">Customer Photos</h5>
                                  </div>
                                  <label className="block">
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(order.id, 'customer_photos', e)} className="hidden" />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer">
                                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm text-gray-600">Upload reference photos</div>
                                    </div>
                                  </label>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center mb-3">
                                    <Palette className="w-5 h-5 text-green-600 mr-2" />
                                    <h5 className="font-medium text-gray-900">Artist Artwork</h5>
                                  </div>
                                  <label className="block">
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(order.id, 'artist_artwork', e)} className="hidden" />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer">
                                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm text-gray-600">Upload completed artwork</div>
                                    </div>
                                  </label>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center mb-3">
                                    <Edit className="w-5 h-5 text-purple-600 mr-2" />
                                    <h5 className="font-medium text-gray-900">Editor Files</h5>
                                  </div>
                                  <label className="block">
                                    <input type="file" multiple accept="image/*,.psd,.ai" onChange={(e) => handleFileUpload(order.id, 'editor_files', e)} className="hidden" />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer">
                                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm text-gray-600">Upload edited files</div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {order.customerNotes && (
                              <div>
                                <h4 className="text-md font-medium text-gray-900 mb-2">Order Notes</h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <p className="text-gray-700 whitespace-pre-wrap">{order.customerNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
            <button onClick={handleSyncOrders} className="mt-4 btn btn-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Orders Now
            </button>
          </div>
        )}
      </div>

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
                    Order #{selectedOrder.shopifyOrderNumber}
                  </h3>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    Shopify ID: {selectedOrder.shopifyOrderId} • Created: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setShowOrderModal(false)} className={`p-2 hover:bg-gray-100 rounded-lg ${themeClasses.textMuted}`}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${themeClasses.border} border rounded-lg p-4`}>
                  <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Customer Information</h4>
                  <div className="space-y-2">
                    <div><span className="text-sm text-gray-500">Name:</span> <span className="font-medium">{selectedOrder.customerName}</span></div>
                    <div><span className="text-sm text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.customerEmail}</span></div>
                    <div><span className="text-sm text-gray-500">Address:</span> <span className="font-medium">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}</span></div>
                  </div>
                </div>
                <div className={`${themeClasses.border} border rounded-lg p-4`}>
                  <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Order Summary</h4>
                  <div className="space-y-2">
                    <div><span className="text-sm text-gray-500">Total:</span> <span className="font-bold text-lg">${selectedOrder.totalAmount.toFixed(2)}</span></div>
                    <div><span className="text-sm text-gray-500">Items:</span> <span className="font-medium">{selectedOrder.items.length}</span></div>
                    <div><span className="text-sm text-gray-500">Priority:</span> <span className={`px-2 py-1 rounded text-xs ${selectedOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{selectedOrder.priority}</span></div>
                    <div><span className="text-sm text-gray-500">Fulfill By:</span> <span className="font-medium">{new Date(selectedOrder.fulfillByDate).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <a
                  href={`https://admin.shopify.com/store/riverry/orders/${selectedOrder.shopifyOrderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Shopify
                </a>
                
                <button onClick={() => setShowOrderModal(false)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSyncModal && (
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
                    value="riverry.myshopify.com"
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
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Sync Interval (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue={15}
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
                    defaultChecked={false}
                    className="h-4 w-4 text-blue-600"
                    disabled
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowSyncModal(false)} className="btn btn-secondary">
                  Close
                </button>
                <button onClick={() => setShowSyncModal(false)} className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, themeClasses }) => {
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
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
