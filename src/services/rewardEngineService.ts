import { supabase } from '../lib/supabase';

export interface SmartSettings {
  cost_price: number;
  selling_price: number;
  profit_allocation_percent: number;
}

export interface ManualSettings {
  aed_value: number;
  point_value: number;
}

export interface TierMultipliers {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface RewardEngineConfig {
  mode: 'smart' | 'manual';
  smart_settings: SmartSettings;
  manual_settings: ManualSettings;
  tier_multipliers: TierMultipliers;
  max_points_per_order: number;
}

export class RewardEngineService {
  static async getRewardEngineConfig(restaurantId: string): Promise<RewardEngineConfig | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('settings')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;

      return data?.settings?.reward_engine || null;
    } catch (error) {
      console.error('Error fetching reward engine config:', error);
      return null;
    }
  }

  static async updateRewardEngineConfig(
    restaurantId: string, 
    config: RewardEngineConfig
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          settings: supabase.raw(`
            jsonb_set(
              COALESCE(settings, '{}'),
              '{reward_engine}',
              ?::jsonb
            )
          `, [JSON.stringify(config)])
        })
        .eq('id', restaurantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reward engine config:', error);
      throw error;
    }
  }

  static async calculatePointsForOrder(
    restaurantId: string,
    orderAmount: number,
    customerTier: string = 'bronze'
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_points_for_order', {
        p_restaurant_id: restaurantId,
        p_order_amount: orderAmount,
        p_customer_tier: customerTier
      });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }

  static calculatePointsPreview(
    config: RewardEngineConfig,
    orderAmount: number,
    customerTier: string = 'bronze'
  ): number {
    let basePoints = 0;

    if (config.mode === 'smart') {
      const { cost_price, selling_price, profit_allocation_percent } = config.smart_settings;
      if (selling_price > 0) {
        const profit = (selling_price - cost_price) * (orderAmount / selling_price);
        const rewardValue = profit * (profit_allocation_percent / 100);
        basePoints = Math.floor(rewardValue);
      }
    } else {
      const { aed_value, point_value } = config.manual_settings;
      if (aed_value > 0) {
        basePoints = Math.floor((orderAmount / aed_value) * point_value);
      }
    }

    // Apply tier multiplier
    const tierMultiplier = config.tier_multipliers[customerTier as keyof TierMultipliers] || 1.0;
    const finalPoints = Math.floor(basePoints * tierMultiplier);

    // Apply maximum limit
    return Math.min(Math.max(finalPoints, 0), config.max_points_per_order);
  }

  static getDefaultConfig(): RewardEngineConfig {
    return {
      mode: 'manual',
      smart_settings: {
        cost_price: 0,
        selling_price: 0,
        profit_allocation_percent: 20
      },
      manual_settings: {
        aed_value: 10,
        point_value: 1
      },
      tier_multipliers: {
        bronze: 1.0,
        silver: 1.25,
        gold: 1.5,
        platinum: 2.0
      },
      max_points_per_order: 1000
    };
  }
}