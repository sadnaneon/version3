import React, { useState, useEffect } from 'react';
import {
  Settings, Calculator, DollarSign, Target, Crown, Award, 
  ChefHat, Sparkles, Save, RefreshCw, Info, AlertCircle,
  TrendingUp, Percent, Coins, Zap
} from 'lucide-react';
import { RewardEngineService, RewardEngineConfig } from '../services/rewardEngineService';
import { useAuth } from '../contexts/AuthContext';

const RewardEngineSettings: React.FC = () => {
  const [config, setConfig] = useState<RewardEngineConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewAmount, setPreviewAmount] = useState(100);
  const [previewTier, setPreviewTier] = useState('bronze');
  
  const { restaurant } = useAuth();

  useEffect(() => {
    if (restaurant) {
      fetchConfig();
    }
  }, [restaurant]);

  const fetchConfig = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      const engineConfig = await RewardEngineService.getRewardEngineConfig(restaurant.id);
      setConfig(engineConfig || RewardEngineService.getDefaultConfig());
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant || !config) return;

    try {
      setSaving(true);
      setError('');
      await RewardEngineService.updateRewardEngineConfig(restaurant.id, config);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<RewardEngineConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const updateSmartSettings = (updates: Partial<RewardEngineConfig['smart_settings']>) => {
    if (!config) return;
    setConfig({
      ...config,
      smart_settings: { ...config.smart_settings, ...updates }
    });
  };

  const updateManualSettings = (updates: Partial<RewardEngineConfig['manual_settings']>) => {
    if (!config) return;
    setConfig({
      ...config,
      manual_settings: { ...config.manual_settings, ...updates }
    });
  };

  const updateTierMultipliers = (tier: string, multiplier: number) => {
    if (!config) return;
    setConfig({
      ...config,
      tier_multipliers: {
        ...config.tier_multipliers,
        [tier]: multiplier
      }
    });
  };

  const getPreviewPoints = () => {
    if (!config) return 0;
    return RewardEngineService.calculatePointsPreview(config, previewAmount, previewTier);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return Sparkles;
      case 'gold': return Crown;
      case 'silver': return Award;
      default: return ChefHat;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-400 to-purple-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchConfig}
          className="px-6 py-3 bg-[#1E2A78] text-white rounded-lg hover:bg-[#3B4B9A] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reward Engine Settings</h1>
          <p className="text-gray-600 mt-1">Configure how customers earn points from their orders</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reward Mode Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reward Calculation Mode</h3>
              <p className="text-sm text-gray-500">Choose how points are calculated</p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateConfig({ mode: 'smart' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  config.mode === 'smart'
                    ? 'border-[#1E2A78] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Smart Auto</p>
                <p className="text-xs text-gray-500">Profit-based</p>
              </button>
              
              <button
                onClick={() => updateConfig({ mode: 'manual' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  config.mode === 'manual'
                    ? 'border-[#1E2A78] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Settings className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Manual Ratio</p>
                <p className="text-xs text-gray-500">AED-to-points</p>
              </button>
            </div>
          </div>

          {/* Smart Mode Settings */}
          {config.mode === 'smart' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-900">Smart Calculation Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (AED)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.smart_settings.cost_price}
                      onChange={(e) => updateSmartSettings({ cost_price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (AED)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.smart_settings.selling_price}
                      onChange={(e) => updateSmartSettings({ selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profit Allocation (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={config.smart_settings.profit_allocation_percent}
                    onChange={(e) => updateSmartSettings({ profit_allocation_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                    placeholder="20"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Percentage of profit to allocate as points</p>
              </div>
            </div>
          )}

          {/* Manual Mode Settings */}
          {config.mode === 'manual' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-900">Manual Ratio Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AED Value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.manual_settings.aed_value}
                      onChange={(e) => updateManualSettings({ aed_value: parseFloat(e.target.value) || 1 })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      placeholder="10"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Given
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.manual_settings.point_value}
                      onChange={(e) => updateManualSettings({ point_value: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                      placeholder="1"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Ratio:</strong> For every {config.manual_settings.aed_value} AED spent, 
                  customers earn {config.manual_settings.point_value} points
                </p>
              </div>
            </div>
          )}

          {/* Max Points Limit */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Points Per Order
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={config.max_points_per_order}
                onChange={(e) => updateConfig({ max_points_per_order: parseInt(e.target.value) || 1000 })}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                placeholder="1000"
                min="1"
                step="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Prevent excessive point awards on large orders</p>
          </div>
        </div>

        {/* Tier Multipliers & Preview */}
        <div className="space-y-6">
          {/* Tier Multipliers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tier Multipliers</h3>
                <p className="text-sm text-gray-500">Bonus multipliers for customer tiers</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(config.tier_multipliers).map(([tier, multiplier]) => {
                const TierIcon = getTierIcon(tier);
                const tierGradient = getTierColor(tier);
                
                return (
                  <div key={tier} className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${tierGradient} rounded-lg flex items-center justify-center`}>
                      <TierIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{tier}</p>
                      <p className="text-sm text-gray-500">{multiplier}x points</p>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={multiplier}
                        onChange={(e) => updateTierMultipliers(tier, parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent text-center"
                        min="0.1"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Points Preview</h3>
                <p className="text-sm text-gray-500">Test your configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Amount (AED)
                  </label>
                  <input
                    type="number"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Tier
                  </label>
                  <select
                    value={previewTier}
                    onChange={(e) => setPreviewTier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] rounded-xl p-6 text-white text-center">
                <p className="text-sm opacity-90 mb-2">Points Earned</p>
                <p className="text-4xl font-bold">{getPreviewPoints()}</p>
                <p className="text-sm opacity-90 mt-2">
                  {previewTier.charAt(0).toUpperCase() + previewTier.slice(1)} customer • {previewAmount} AED order
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Calculation Breakdown</span>
                </div>
                {config.mode === 'smart' ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Profit per unit: {config.smart_settings.selling_price - config.smart_settings.cost_price} AED</p>
                    <p>• Profit allocation: {config.smart_settings.profit_allocation_percent}%</p>
                    <p>• Tier multiplier: {config.tier_multipliers[previewTier as keyof typeof config.tier_multipliers]}x</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Base ratio: {config.manual_settings.aed_value} AED = {config.manual_settings.point_value} points</p>
                    <p>• Tier multiplier: {config.tier_multipliers[previewTier as keyof typeof config.tier_multipliers]}x</p>
                    <p>• Max limit: {config.max_points_per_order} points</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardEngineSettings;