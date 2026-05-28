

export function reportWebVitals(metric: any) {
  // Custom logging - you can send to analytics endpoint
  console.log('[Web Vitals]', metric);
}

export default function initPerformance() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Import web-vitals lazily
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onINP(reportWebVitals);
      onLCP(reportWebVitals);
      onFCP(reportWebVitals);
      onTTFB(reportWebVitals);
    });
  }
}

// Initialize on import
initPerformance();
