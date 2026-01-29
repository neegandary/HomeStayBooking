'use client';

import React, { useEffect, useState, type ComponentType } from 'react';

/**
 * AgentationWrapper - Wrapper for Agentation visual feedback tool
 * Only loads in development mode for AI agent feedback workflow
 */
export default function AgentationWrapper() {
  const [Agentation, setAgentation] = useState<ComponentType | null>(null);

  useEffect(() => {
    // Only load in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    import('agentation')
      .then((mod) => {
        if (mod.Agentation) {
          setAgentation(() => mod.Agentation);
        }
      })
      .catch(() => {
        // Silently fail - agentation not available
      });
  }, []);

  if (!Agentation) {
    return null;
  }

  return <Agentation />;
}