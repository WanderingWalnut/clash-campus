'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Custom hook that tracks whether the page has been scrolled past a threshold.
 * Useful for triggering navigation bar style changes on scroll.
 *
 * @param threshold - The scroll position (in pixels) that triggers the scrolled state (number, default: 50)
 * @returns Boolean indicating whether the page has scrolled past the threshold
 *
 * @example
 * ```tsx
 * const isScrolled = useScrolled(100);
 * // Returns true when window.scrollY > 100
 * ```
 */
export function useScrolled(threshold: number = 50): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToThreshold(threshold, onStoreChange),
    [threshold]
  );
  const getSnapshot = useCallback(() => getThresholdValue(threshold), [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

// ============================================================================
// Shared scroll store (single window listener)
// ============================================================================

type Listener = () => void;

let isListening = false;
let currentScrollY = 0;

const thresholdStores = new Map<
  number,
  { value: boolean; listeners: Set<Listener> }
>();

function ensureListening() {
  if (typeof window === 'undefined') {
    return;
  }

  if (isListening) {
    return;
  }

  isListening = true;
  currentScrollY = window.scrollY;
  window.addEventListener('scroll', handleScroll, { passive: true });
}

function teardownIfIdle() {
  if (typeof window === 'undefined') {
    return;
  }

  const hasAnyListeners = Array.from(thresholdStores.values()).some(
    (store) => store.listeners.size > 0
  );

  if (!hasAnyListeners && isListening) {
    window.removeEventListener('scroll', handleScroll);
    isListening = false;
  }
}

function handleScroll() {
  if (typeof window === 'undefined') {
    return;
  }

  currentScrollY = window.scrollY;

  // Only notify listeners when the boolean for a threshold changes.
  for (const [threshold, store] of thresholdStores.entries()) {
    const nextValue = currentScrollY > threshold;
    if (nextValue !== store.value) {
      store.value = nextValue;
      for (const listener of store.listeners) {
        listener();
      }
    }
  }
}

function getOrCreateThresholdStore(threshold: number) {
  const existing = thresholdStores.get(threshold);
  if (existing) {
    return existing;
  }

  const store = {
    value: currentScrollY > threshold,
    listeners: new Set<Listener>(),
  };
  thresholdStores.set(threshold, store);
  return store;
}

function getThresholdValue(threshold: number) {
  if (typeof window === 'undefined') {
    return false;
  }

  ensureListening();
  return getOrCreateThresholdStore(threshold).value;
}

function subscribeToThreshold(threshold: number, listener: Listener) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  ensureListening();
  const store = getOrCreateThresholdStore(threshold);
  store.listeners.add(listener);

  // Initialize the store value on subscribe, so first paint reflects reality.
  const nextValue = window.scrollY > threshold;
  if (nextValue !== store.value) {
    store.value = nextValue;
  }

  return () => {
    store.listeners.delete(listener);
    teardownIfIdle();
  };
}

