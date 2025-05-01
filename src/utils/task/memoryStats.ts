/**
 * Utility for tracking memory usage and performance of the task sync system
 */

// Memory stats interface for monitoring resource usage
export interface MemoryStats {
  // Number of active listeners
  activeListeners: number;
  
  // Number of active subscriptions
  activeSubscriptions: number;
  
  // Total number of events emitted
  totalEmissions: number;
  
  // Total number of events handled
  totalHandledEvents: number;
  
  // Peak memory usage estimate
  peakMemoryUsage: number;
  
  // Current cache size
  cacheSize: number;
}

// Global stats tracker
let stats: MemoryStats = {
  activeListeners: 0,
  activeSubscriptions: 0,
  totalEmissions: 0,
  totalHandledEvents: 0,
  peakMemoryUsage: 0,
  cacheSize: 0
};

// Reset stats to initial values
export function resetMemoryStats(): void {
  stats = {
    activeListeners: 0,
    activeSubscriptions: 0,
    totalEmissions: 0,
    totalHandledEvents: 0,
    peakMemoryUsage: 0,
    cacheSize: 0
  };
}

// Get a snapshot of current memory stats
export function getMemoryStats(): MemoryStats {
  return { ...stats };
}

// Update listener count
export function updateListenerCount(delta: number): void {
  stats.activeListeners += delta;
}

// Update subscription count
export function updateSubscriptionCount(delta: number): void {
  stats.activeSubscriptions += delta;
}

// Record an event emission
export function recordEmission(): void {
  stats.totalEmissions++;
}

// Record an event being handled
export function recordHandledEvent(): void {
  stats.totalHandledEvents++;
}

// Update cache size
export function updateCacheSize(size: number): void {
  stats.cacheSize = size;
  
  // Update peak memory usage estimate based on cache size
  // This is a rough estimate - each task might be ~2KB in memory
  const estimatedMemoryUsage = size * 2048; // Size in bytes
  
  if (estimatedMemoryUsage > stats.peakMemoryUsage) {
    stats.peakMemoryUsage = estimatedMemoryUsage;
  }
}

// Generate a memory usage report
export function generateMemoryReport(): string {
  const kb = (bytes: number) => Math.round(bytes / 1024);
  
  return `
Memory Usage Report:
-------------------
Active Listeners: ${stats.activeListeners}
Active Subscriptions: ${stats.activeSubscriptions}
Total Events Emitted: ${stats.totalEmissions}
Total Events Handled: ${stats.totalHandledEvents}
Cache Size: ${stats.cacheSize} items
Estimated Memory Usage: ${kb(stats.peakMemoryUsage)} KB
`.trim();
}