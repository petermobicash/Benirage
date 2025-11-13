// Performance monitoring utilities for the donation page

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  // Mark when a section becomes visible
  markSectionVisible(sectionName: string): void {
    const metric: PerformanceMetric = {
      name: `section_visible_${sectionName}`,
      value: performance.now(),
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    console.log(`📊 Section "${sectionName}" became visible at ${metric.value}ms`);
  }

  // Mark donation form interaction
  markFormInteraction(action: string): void {
    const metric: PerformanceMetric = {
      name: `form_${action}`,
      value: performance.now(),
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    console.log(`📋 Form action "${action}" at ${metric.value}ms`);
  }

  // Mark payment method selection
  markPaymentMethodSelection(method: string): void {
    const metric: PerformanceMetric = {
      name: `payment_method_${method}`,
      value: performance.now(),
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    console.log(`💳 Payment method "${method}" selected at ${metric.value}ms`);
  }

  // Track image loading performance
  trackImageLoad(imageSrc: string, loadTime: number): void {
    const metric: PerformanceMetric = {
      name: `image_load_${imageSrc}`,
      value: loadTime,
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    
    if (loadTime > 2000) {
      console.warn(`⚠️  Slow image load: ${imageSrc} took ${loadTime}ms`);
    }
  }

  // Get performance report
  getReport(): string {
    const report = this.metrics
      .map(m => `${m.name}: ${m.value.toFixed(2)}ms`)
      .join('\n');
    
    console.log('📈 Performance Report:\n' + report);
    return report;
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
  }
}

// Performance observer for Core Web Vitals
class CoreWebVitals {
  private observers: PerformanceObserver[] = [];

  observeLCP(callback: (metric: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        callback(lastEntry);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch {
      console.log('LCP observation not supported');
    }
  }

  observeFID(callback: (metric: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch {
      console.log('FID observation not supported');
    }
  }

  observeCLS(callback: (metric: any) => void): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        callback({ name: 'CLS', value: clsValue });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch {
      console.log('CLS observation not supported');
    }
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance budget checker
interface PerformanceBudget {
  name: string;
  limit: number;
  current: number;
  status: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceBudgetChecker {
  private budgets: PerformanceBudget[] = [
    { name: 'Image Load Time', limit: 2000, current: 0, status: 'good' },
    { name: 'Section Visibility', limit: 100, current: 0, status: 'good' },
    { name: 'Form Interaction', limit: 50, current: 0, status: 'good' }
  ];

  updateBudget(name: string, value: number): void {
    const budget = this.budgets.find(b => b.name === name);
    if (budget) {
      budget.current = value;
      budget.status = this.getStatus(value, budget.limit);
    }
  }

  private getStatus(value: number, limit: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= limit * 0.5) return 'good';
    if (value <= limit) return 'needs-improvement';
    return 'poor';
  }

  getStatusReport(): string {
    return this.budgets
      .map(b => `${b.name}: ${b.status.toUpperCase()} (${b.current.toFixed(2)}ms/${b.limit}ms)`)
      .join('\n');
  }

  getAllBudgets(): PerformanceBudget[] {
    return [...this.budgets];
  }
}

// Export instances
export const performanceMonitor = new PerformanceMonitor();
export const coreWebVitals = new CoreWebVitals();
export const budgetChecker = new PerformanceBudgetChecker();

// Utility functions
export const measureImageLoad = (imageSrc: string): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackImageLoad(imageSrc, loadTime);
      budgetChecker.updateBudget('Image Load Time', loadTime);
      resolve(loadTime);
    };
    
    img.onerror = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackImageLoad(imageSrc, loadTime);
      resolve(loadTime);
    };
    
    img.src = imageSrc;
  });
};

export const measureFunctionExecution = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const startTime = performance.now();
  const result = await fn();
  const executionTime = performance.now() - startTime;
  
  console.log(`⚡ Function "${name}" executed in ${executionTime.toFixed(2)}ms`);
  return result;
};

// Performance optimization hints
export const getOptimizationHints = (): string[] => {
  const hints: string[] = [];
  
  // Check for large images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    if (rect.width * rect.height > 1000000) { // > 1MP
      hints.push(`Image ${index} is very large (${rect.width}x${rect.height}). Consider optimization.`);
    }
  });
  
  // Check for unoptimized animations
  const animations = document.querySelectorAll('[style*="animation"]');
  if (animations.length > 10) {
    hints.push('Many animated elements detected. Consider reducing animations for better performance.');
  }
  
  return hints;
};

export default {
  performanceMonitor,
  coreWebVitals,
  budgetChecker,
  measureImageLoad,
  measureFunctionExecution,
  getOptimizationHints
};