import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Eye,
  MoreVertical,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const SKUManagement = ({ themeClasses }) => {
  const [skus, setSKUs] = useState([
    {
      id: '1',
      paintingStyle: 'Regular Headshot',
      sku: 'Regular_headshot_12x16p',
      printSku: 'PH-12x16-POSTER',
      payRate: 10,
      category: 'Pet Portraits',
      isActive: true,
      usage: 45,
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      paintingStyle: '2 Pet Mini Full Body',
      sku: '2pet_mini_fullbody_5x7nw',
      printSku: 'PMF-5x7-NATWOOD',
      payRate: 10,
      category: 'Pet Portraits',
      isActive: true,
      usage: 32,
      createdAt: '2025-01-15'
    },
    {
      id: '3',
      paintingStyle: 'House + Landscape + 3 Pets',
      sku: 'house+landscape+3pets_8x10bf',
      printSku: 'HLP-8x10-BLACKFRAME',
      payRate: 25,
      category: 'Landscape',
      isActive: true,
      usage: 18,
      createdAt: '2025-01-15'
    },
    {
      id: '4',
      paintingStyle: 'Family Portrait Large',
      sku: 'family_portrait_16x20f',
      printSku: 'FP-16x20-FRAME',
      payRate: 35,
      category: 'Family Portraits',
      isActive: true,
      usage: 12,
      createdAt: '2025-01-10'
    },
    {
      id: '5',
      paintingStyle: 'Pet Memorial w/ Rainbow',
      sku: 'pet_memorial_rainbow_8x10',
      printSku: 'PMR-8x10-SPECIAL',
      payRate: 20,
      category: 'Pet Memorials',
      isActive: false,
      usage: 8,
      createdAt: '2025-01-05'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSKU, setEditingSKU] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Get unique categories
  const categories = ['all', ...new Set(skus.map(sku => sku.category))];

  // Filter SKUs
  const filteredSKUs = skus.filter(sku => {
    const matchesSearch = sku.paintingStyle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sku.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || sku.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    total: skus.length,
    active: skus.filter(s => s.isActive).length,
    avgPayRate: Math.round(skus.reduce((sum, s) => sum + s.payRate, 0) / skus.length),
    totalUsage: skus.reduce((sum, s) => sum + s.usage, 0)
  };

  const handleEdit = (sku) => {
    setEditingSKU(sku);
    setShowEditModal(true);
  };

  const handleToggleActive = (id) => {
    setSKUs(skus.map(sku => 
      sku.id === id ? { ...sku, isActive: !sku.isActive } : sku
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this SKU?')) {
      setSKUs(skus.filter(sku => sku.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total SKUs"
          value={stats.total}
          icon={Package}
          color="blue"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Active SKUs"
          value={stats.active}
          icon={Check}
          color="green"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Avg Pay Rate"
          value={`$${stats.avgPayRate}`}
          icon={DollarSign}
          color="purple"
          themeClasses={themeClasses}
        />
        <StatCard
          title="Total Usage"
          value={stats.totalUsage}
          icon={TrendingUp}
          color="orange"
          themeClasses={themeClasses}
        />
      </div>

      {/* Header Actions */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>SKU Library</h2>
            <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
              Manage painting styles, SKUs, and pay rates
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary inline-flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button className="btn btn-secondary inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add SKU
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <input
              type="text"
              placeholder="Search SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 w-full px-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
            />
          </div>
          
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`pl-10 pr-10 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SKU Table */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-gray-50 ${themeClasses.border} border-b`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Painting Style
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  SKU Code
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Print SKU
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Pay Rate
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Usage
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${themeClasses.cardBg} divide-y ${themeClasses.border}`}>
              {filteredSKUs.map((sku) => (
                <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.textPrimary}`}>
                    {sku.paintingStyle}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary} font-mono`}>
                    {sku.sku}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary} font-mono`}>
                    {sku.printSku}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.textPrimary}`}>
                    ${sku.payRate}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                    {sku.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                    {sku.usage} orders
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sku.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sku.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(sku)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(sku.id)}
                        className={sku.isActive ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"}
                      >
                        {sku.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(sku.id)}
                        className="text-red-600 hover:text-red-800"
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
        
        {filteredSKUs.length === 0 && (
          <div className="text-center py-12">
            <Package className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>No SKUs found</h3>
            <p className={`${themeClasses.textMuted}`}>
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first SKU'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSKUModal
          onClose={() => setShowAddModal(false)}
          onSave={(newSKU) => {
            setSKUs([...skus, { ...newSKU, id: Date.now().toString(), usage: 0, createdAt: new Date().toISOString().split('T')[0] }]);
            setShowAddModal(false);
          }}
          themeClasses={themeClasses}
        />
      )}

      {showEditModal && editingSKU && (
        <EditSKUModal
          sku={editingSKU}
          onClose={() => {
            setShowEditModal(false);
            setEditingSKU(null);
          }}
          onSave={(updatedSKU) => {
            setSKUs(skus.map(s => s.id === editingSKU.id ? { ...s, ...updatedSKU } : s));
            setShowEditModal(false);
            setEditingSKU(null);
          }}
          themeClasses={themeClasses}
        />
      )}

      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImport={(importedSKUs) => {
            setSKUs([...skus, ...importedSKUs]);
            setShowImportModal(false);
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

// Add SKU Modal
const AddSKUModal = ({ onClose, onSave, themeClasses }) => {
  const [formData, setFormData] = useState({
    paintingStyle: '',
    sku: '',
    printSku: '',
    payRate: '',
    category: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      payRate: parseFloat(formData.payRate)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Add New SKU</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Painting Style
              </label>
              <input
                type="text"
                required
                value={formData.paintingStyle}
                onChange={(e) => setFormData({...formData, paintingStyle: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="e.g., Regular Headshot"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                SKU Code
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="e.g., regular_headshot_12x16p"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Print SKU
              </label>
              <input
                type="text"
                required
                value={formData.printSku}
                onChange={(e) => setFormData({...formData, printSku: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="e.g., PH-12x16-POSTER"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Pay Rate ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.payRate}
                onChange={(e) => setFormData({...formData, payRate: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="e.g., 10.00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Category
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
                placeholder="e.g., Pet Portraits"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className={`ml-2 block text-sm ${themeClasses.textPrimary}`}>
                Active
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
                Add SKU
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit SKU Modal (similar to Add, but with existing data)
const EditSKUModal = ({ sku, onClose, onSave, themeClasses }) => {
  const [formData, setFormData] = useState({
    paintingStyle: sku.paintingStyle,
    sku: sku.sku,
    printSku: sku.printSku,
    payRate: sku.payRate.toString(),
    category: sku.category,
    isActive: sku.isActive
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      payRate: parseFloat(formData.payRate)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Edit SKU</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Painting Style
              </label>
              <input
                type="text"
                required
                value={formData.paintingStyle}
                onChange={(e) => setFormData({...formData, paintingStyle: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                SKU Code
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Print SKU
              </label>
              <input
                type="text"
                required
                value={formData.printSku}
                onChange={(e) => setFormData({...formData, printSku: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Pay Rate ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.payRate}
                onChange={(e) => setFormData({...formData, payRate: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                Category
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="editIsActive" className={`ml-2 block text-sm ${themeClasses.textPrimary}`}>
                Active
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Import CSV Modal
const ImportCSVModal = ({ onClose, onImport, themeClasses }) => {
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        setCsvData(csv);
        
        // Simple CSV parsing for preview
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',');
          return {
            id: `import-${index}`,
            paintingStyle: values[0]?.trim() || '',
            sku: values[1]?.trim() || '',
            printSku: values[2]?.trim() || '',
            payRate: parseFloat(values[3]) || 0,
            category: values[4]?.trim() || ''
          };
        });
        setPreview(data.slice(0, 5)); // Show first 5 rows
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (csvData) {
      const lines = csvData.split('\n').filter(line => line.trim());
      const importedSKUs = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        return {
          id: `imported-${Date.now()}-${index}`,
          paintingStyle: values[0]?.trim() || '',
          sku: values[1]?.trim() || '',
          printSku: values[2]?.trim() || '',
          payRate: parseFloat(values[3]) || 0,
          category: values[4]?.trim() || '',
          isActive: true,
          usage: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
      });
      onImport(importedSKUs);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-lg w-full max-w-2xl`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Import SKUs from CSV</h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className={`w-full px-3 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.cardBg} ${themeClasses.textPrimary}`}
              />
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                Expected format: paintingStyle, sku, printSku, payRate, category
              </p>
            </div>

            {preview.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-2`}>Preview (first 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className={`w-full text-sm border ${themeClasses.border} rounded`}>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Painting Style</th>
                        <th className="px-3 py-2 text-left">SKU</th>
                        <th className="px-3 py-2 text-left">Print SKU</th>
                        <th className="px-3 py-2 text-left">Pay Rate</th>
                        <th className="px-3 py-2 text-left">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className={`border-t ${themeClasses.border}`}>
                          <td className="px-3 py-2">{row.paintingStyle}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.printSku}</td>
                          <td className="px-3 py-2">${row.payRate}</td>
                          <td className="px-3 py-2">{row.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!csvData}
                className="btn btn-primary disabled:opacity-50"
              >
                Import {preview.length} SKUs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SKUManagement;
