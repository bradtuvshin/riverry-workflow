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
  Upload
} from 'lucide-react';

const OrderManagement = ({ themeClasses }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real orders from Shopify API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://riverry-workflow-production.up.railway.app/api/shopify/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders.map(order => ({
          id: order.id.toString(),
          shopifyOrderNumber: order.name,
          customerName: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Unknown',
          customerEmail: order.customer?.email || '',
          totalAmount: parseFloat(order.total_price || 0),
          status: 'pending_assignment',
          items: order.line_items?.map(item => ({
            id: `${order.id}-${item.id}`,
            productTitle: item.title,
            sku: item.sku,
            price: parseFloat(item.price || 0)
          })) || []
        })));
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading Shopify orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h2>Real Shopify Orders ({orders.length})</h2>
      <button onClick={fetchOrders} className="btn btn-primary">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Orders
      </button>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded">
            <h3>Order #{order.shopifyOrderNumber}</h3>
            <p>Customer: {order.customerName}</p>
            <p>Email: {order.customerEmail}</p>
            <p>Total: ${order.totalAmount}</p>
            <p>Items: {order.items.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
