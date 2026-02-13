'use client';

import { useEffect } from 'react';

export function FormHydrationFix() {
  useEffect(() => {
    // Remove fdprocessedid attributes after hydration
    document.querySelectorAll('[fdprocessedid]').forEach(el => {
      el.removeAttribute('fdprocessedid');
    });
  }, []);

  return null;
}
