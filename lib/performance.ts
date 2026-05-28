

export function reportWebVitals(metric: any) {
  // Custom logging - you can send to analytics endpoint
  console.log('[Web Vitals]', metric);
}

export default function initPerformance() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Import web-vitals lazily
    import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getLCP(reportWebVitals);
      getFCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });
  }
}

// Initialize on import
initPerformance();
