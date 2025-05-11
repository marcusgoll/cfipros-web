'use client';

import { useState } from 'react';
import { FeatureFlagComponent } from '@/components/features/auth/FeatureFlagComponent';
import { FeatureFlagToggle } from '@/components/features/auth/FeatureFlagToggle';

export default function FeatureFlagTestPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Feature Flag Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Toggle Feature Flags</h2>
          <div className="space-y-4">
            <FeatureFlagToggle flag="UNIFIED_SIGNUP_FLOW" label="Unified Signup Flow" />
            <FeatureFlagToggle flag="ANALYTICS_ENABLED" label="Analytics Tracking" />
          </div>
        </div>
        
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Feature Flag Component Test</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Unified Signup Flow:</p>
              <FeatureFlagComponent 
                flag="UNIFIED_SIGNUP_FLOW"
                fallback={<div className="bg-red-100 p-3 rounded">🚫 Feature is OFF</div>}
              >
                <div className="bg-green-100 p-3 rounded">✅ Feature is ON</div>
              </FeatureFlagComponent>
            </div>
            
            <div>
              <p className="font-medium">Analytics Enabled:</p>
              <FeatureFlagComponent 
                flag="ANALYTICS_ENABLED"
                fallback={<div className="bg-red-100 p-3 rounded">🚫 Feature is OFF</div>}
              >
                <div className="bg-green-100 p-3 rounded">✅ Feature is ON</div>
              </FeatureFlagComponent>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
      </div>
    </div>
  );
} 