import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Eye, EyeOff, Search, Filter, 
  Utensils, Coffee, Salad, Cookie, DollarSign, Calculator,
  X, Save, AlertCircle, CheckCircle, TrendingUp, Zap,
  MoreVertical, Copy, Settings, Target, Crown, Award, ChefHat
} from 'lucide-react';
import { MenuItemService, MenuItem } from '../services/menuItemService';
import { useAuth } from '../contexts/AuthContext';

const MenuItemsPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLoyaltyMode, setFilterLoyaltyMode] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
    cost_price: 0,
    selling_price: 0,
    loyalty_mode: 'none' as 'smart' | 'manual' | 'none',
    profit_allocation_percent: 20,
    fixed_points: 1,
    is_active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewTier, setPreviewTier] = useState('bronze');

  const { restaurant } = useAuth();

  const categories = [
    { value: 'main', label: 'Main Course', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { value: 'beverage', label: 'Beverages', icon: Coffee, color: 'bg-blue-100 text-blue-600' },
    { value: 'salad', label: 'Salads', icon: Salad, color: 'bg-green-100 text-green-600' },
    { value: 'dessert', label: 'Desserts', icon: Cookie, color: 'bg-pink-100 text-pink-600' },
    { value: 'appetizer', label: 'Appetizers', icon: Target, color: 'bg-purple-100 text-purple-600' }
  ];

  const tiers = [
    { value: 'bronze', label: 'Bronze', icon: ChefHat, multiplier: 1.0 },
    { value: 'silver', label: 'Silver', icon: Award, multiplier: 1.25 },
    { value: 'gold', label: 'Gold', icon: Crown, multiplier: 1.5 },
    { value: 'platinum', label: 'Platinum', icon: Crown, multiplier: 2.0 }
  ];

  useEffect(() => {
    if (restaurant) {
      fetchMenuItems();
    }
  }, [restaurant]);

  const fetchMenuItems = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      setError(null);
      const items = await MenuItemService.getMenuItems(restaurant.id);
      setMenuItems(items);
      
      // Create sample items if none exist
      if (items.length === 0) {
        await MenuItemService.createSampleMenuItems(restaurant.id);
        const newItems = await MenuItemService.getMenuItems(restaurant.id);
        setMenuItems(newItems);
      }
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!restaurant) return;

    try {
      setFormLoading(true);
      setFormError('');

      if (!formData.name.trim()) {
        setFormError('Item name is required');
        return;
      }

      if (formData.selling_price <= 0) {
        setFormError('Selling price must be greater than 0');
        return;
      }

      if (formData.cost_price < 0) {
        setFormError('Cost price cannot be negative');
        return;
      }

      const loyaltySettings: any = {};
      if (formData.loyalty_mode === 'smart') {
        loyaltySettings.profit_allocation_percent = formData.profit_allocation_percent;
      } else if (formData.loyalty_mode === 'manual') {
        loyaltySettings.fixed_points = formData.fixed_points;
      }

      await MenuItemService.createMenuItem({
        restaurant_id: restaurant.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        loyalty_mode: formData.loyalty_mode,
        loyalty_settings: loyaltySettings,
        is_active: formData.is_active
      });

      await fetchMenuItems();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating menu item:', err);
      setFormError(err.message || 'Failed to create menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!restaurant || !editingItem) return;

    try {
      setFormLoading(true);
      setFormError('');

      if (!formData.name.trim()) {
        setFormError('Item name is required');
        return;
      }

      const loyaltySettings: any = {};
      if (formData.loyalty_mode === 'smart') {
        loyaltySettings.profit_allocation_percent = formData.profit_allocation_percent;
      } else if (formData.loyalty_mode === 'manual') {
        loyaltySettings.fixed_points = formData.fixed_points;
      }

      await MenuItemService.updateMenuItem(restaurant.id, editingItem.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        loyalty_mode: formData.loyalty_mode,
        loyalty_settings: loyaltySettings,
        is_active: formData.is_active
      });

      await fetchMenuItems();
      setEditingItem(null);
      resetForm();
    } catch (err: any) {
      console.error('Error updating menu item:', err);
      setFormError(err.message || 'Failed to update menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurant) return;

    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      await MenuItemService.deleteMenuItem(restaurant.id, itemId);
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main',
      cost_price: 0,
      selling_price: 0,
      loyalty_mode: 'none',
      profit_allocation_percent: 20,
      fixed_points: 1,
      is_active: true
    });
    setFormError('');
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
      loyalty_mode: item.loyalty_mode,
      profit_allocation_percent: item.loyalty_settings.profit_allocation_percent || 20,
      fixed_points: item.loyalty_settings.fixed_points || 1,
      is_active: item.is_active
    });
    setFormError('');
  };

  const getPreviewPoints = () => {
    const mockItem: MenuItem = {
      id: 'preview',
      restaurant_id: restaurant?.id || '',
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cost_price: formData.cost_price,
      selling_price: formData.selling_price,
      loyalty_mode: formData.loyalty_mode,
      loyalty_settings: {
        profit_allocation_percent: formData.profit_allocation_percent,
        fixed_points: formData.fixed_points
      },
      is_active: formData.is_active,
      created_at: '',
      updated_at: ''
    };

    return MenuItemService.calculatePointsPreview(mockItem, 1, previewTier);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLoyalty = filterLoyaltyMode === 'all' || item.loyalty_mode === filterLoyaltyMode;

    return matchesSearch && matchesCategory && matchesLoyalty;
  });

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getLoyaltyModeColor = (mode: string) => {
    switch (mode) {
      case 'smart': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Menu Items</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-6 py-3 bg-[#1E2A78] text-white rounded-lg hover:bg-[#3B4B9A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items & Loyalty Settings</h1>
          <p className="text-gray-600 mt-1">Configure loyalty points for each menu item</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>

            <select
              value={filterLoyaltyMode}
              onChange={(e) => setFilterLoyaltyMode(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
            >
              <option value="all">All Loyalty Modes</option>
              <option value="smart">Smart Auto</option>
              <option value="manual">Manual</option>
              <option value="none">No Rewards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {menuItems.length === 0 ? 'No Menu Items Created' : 'No Items Found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {menuItems.length === 0 
              ? 'Create your first menu item to start configuring loyalty rewards.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {menuItems.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Create Your First Menu Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const categoryInfo = getCategoryInfo(item.category);
            const CategoryIcon = categoryInfo.icon;
            const previewPoints = MenuItemService.calculatePointsPreview(item, 1, 'bronze');

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#1E2A78] transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {categoryInfo.label}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getLoyaltyModeColor(item.loyalty_mode)}`}>
                            {item.loyalty_mode === 'smart' ? 'Smart Auto' : 
                             item.loyalty_mode === 'manual' ? 'Manual' : 'No Rewards'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost Price</span>
                      <span className="font-semibold text-gray-900">{item.cost_price} AED</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Selling Price</span>
                      <span className="font-semibold text-gray-900">{item.selling_price} AED</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className="font-semibold text-green-600">
                        {((item.selling_price - item.cost_price) / item.selling_price * 100).toFixed(1)}%
                      </span>
                    </div>

                    {item.loyalty_mode !== 'none' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points (Bronze)</span>
                        <span className="font-semibold text-[#1E2A78]">{previewPoints} pts</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                    placeholder="e.g., Chicken Shawarma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                    placeholder="Describe the item"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price (AED) *
                    </label>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price (AED) *
                    </label>
                    <input
                      type="number"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Loyalty Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Loyalty Reward Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loyalty Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, loyalty_mode: 'smart' })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.loyalty_mode === 'smart'
                          ? 'border-[#1E2A78] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs font-medium">Smart Auto</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, loyalty_mode: 'manual' })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.loyalty_mode === 'manual'
                          ? 'border-[#1E2A78] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Calculator className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-xs font-medium">Manual</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, loyalty_mode: 'none' })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.loyalty_mode === 'none'
                          ? 'border-[#1E2A78] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <X className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                      <p className="text-xs font-medium">No Rewards</p>
                    </button>
                  </div>
                </div>

                {formData.loyalty_mode === 'smart' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3">Smart Auto Settings</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profit Allocation (%)
                      </label>
                      <input
                        type="number"
                        value={formData.profit_allocation_percent}
                        onChange={(e) => setFormData({ ...formData, profit_allocation_percent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Percentage of profit to allocate as points
                      </p>
                    </div>
                  </div>
                )}

                {formData.loyalty_mode === 'manual' && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-3">Manual Settings</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fixed Points per Item
                      </label>
                      <input
                        type="number"
                        value={formData.fixed_points}
                        onChange={(e) => setFormData({ ...formData, fixed_points: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                        min="0"
                        step="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Points awarded per item purchased
                      </p>
                    </div>
                  </div>
                )}

                {formData.loyalty_mode !== 'none' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Points Preview</h5>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Preview Tier:</span>
                      <select
                        value={previewTier}
                        onChange={(e) => setPreviewTier(e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded text-sm"
                      >
                        {tiers.map(tier => (
                          <option key={tier.value} value={tier.value}>
                            {tier.label} ({tier.multiplier}x)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#1E2A78]">{getPreviewPoints()}</p>
                        <p className="text-sm text-gray-600">points per item</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                disabled={formLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemsPage;