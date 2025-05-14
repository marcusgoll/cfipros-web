'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFeatureFlag, setFeatureFlag } from '@/lib/feature-flags/client';
import type { FeatureFlag } from '@/lib/feature-flags';

interface FeatureFlagToggleProps {
  flag: FeatureFlag;
  label?: string;
}

export function FeatureFlagToggle({ flag, label }: FeatureFlagToggleProps) {
  const isEnabled = useFeatureFlag(flag);
  const [checked, setChecked] = useState(isEnabled);

  // Initialize state from the feature flag
  useEffect(() => {
    setChecked(isEnabled);
  }, [isEnabled]);

  // Toggle the feature flag
  const handleToggle = (value: boolean) => {
    setChecked(value);
    setFeatureFlag(flag, value);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch id={`toggle-${flag}`} checked={checked} onCheckedChange={handleToggle} />
      <Label htmlFor={`toggle-${flag}`}>
        {label || flag}: {checked ? 'ON' : 'OFF'}
      </Label>
    </div>
  );
}
