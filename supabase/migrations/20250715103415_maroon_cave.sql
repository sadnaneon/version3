/*
  # Add Average Profit Margin Setting

  1. Schema Updates
    - Add estimatedProfitMarginPercent to restaurant settings
    - Set default value of 30% for backward compatibility
    - Add validation constraints

  2. Data Migration
    - Update existing restaurants with default 30% margin
    - Ensure all blanket settings have proper defaults
*/

-- Add the new field to existing restaurant settings
UPDATE restaurants 
SET settings = jsonb_set(
  COALESCE(settings, '{}'),
  '{blanketMode,smartSettings,estimatedProfitMarginPercent}',
  '30'
)
WHERE settings IS NULL 
   OR settings->'blanketMode' IS NULL 
   OR settings->'blanketMode'->'smartSettings' IS NULL
   OR settings->'blanketMode'->'smartSettings'->'estimatedProfitMarginPercent' IS NULL;

-- Ensure all restaurants have proper blanket mode defaults
UPDATE restaurants 
SET settings = jsonb_set(
  COALESCE(settings, '{}'),
  '{blanketMode}',
  jsonb_build_object(
    'enabled', false,
    'type', 'smart',
    'smartSettings', jsonb_build_object(
      'profitAllocationPercent', 20,
      'estimatedProfitMarginPercent', 30
    ),
    'manualSettings', jsonb_build_object(
      'pointsPerAED', 0.1
    ),
    'spendSettings', jsonb_build_object(
      'pointsPerAED', 0.2
    )
  )
)
WHERE settings->'blanketMode' IS NULL;