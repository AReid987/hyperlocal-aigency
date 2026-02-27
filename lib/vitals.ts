export interface Metric {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface VitalsReport {
  LCP?: number;
  INP?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
}

/**
 * Report Web Vitals to analytics or console
 * Only reports in development or when analytics is enabled
 */
export function reportWebVitals(metric: Metric) {
  const { name, value, rating, delta } = metric;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `[Web Vitals] ${emoji} ${name}:`,
      `${value.toFixed(0)}ms`,
      `(${rating}, delta: ${delta.toFixed(0)}ms)`
    );
  }

  // Send to analytics if enabled
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
    sendToAnalytics(metric);
  }

  // Send to Web Vitals endpoint if enabled
  if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true') {
    sendToVitalsEndpoint(metric);
  }
}

/**
 * Send metrics to analytics service (GA4, PostHog, etc.)
 */
function sendToAnalytics(metric: Metric) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: Math.round(metric.value),
      metric_delta: Math.round(metric.delta),
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // PostHog
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Send metrics to custom Vitals API endpoint
 */
function sendToVitalsEndpoint(metric: Metric) {
  // Replace with your analytics endpoint
  const vitalsEndpoint = '/api/vitals';

  if (typeof fetch !== 'undefined' && navigator.sendBeacon) {
    // Use sendBeacon for reliable delivery even if page unloads
    const data = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: window.location.href,
      timestamp: Date.now(),
    });

    navigator.sendBeacon(vitalsEndpoint, data);
  } else if (typeof fetch !== 'undefined') {
    // Fallback to regular fetch
    fetch(vitalsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Web Vitals] Failed to send metrics:', error);
      }
    });
  }
}

/**
 * Web Vitals threshold values for rating
 */
export const VITALS_THRESHOLDS = {
  LCP: {
    good: 2500, // 2.5s
    needsImprovement: 4000, // 4.0s
  },
  INP: {
    good: 200, // 200ms
    needsImprovement: 500, // 500ms
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800, // 1.8s
    needsImprovement: 3000, // 3.0s
  },
  TTFB: {
    good: 800, // 800ms
    needsImprovement: 1800, // 1.8s
  },
} as const;

/**
 * Get rating for a metric based on thresholds
 */
export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = (VITALS_THRESHOLDS as any)[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Collect all Web Vitals metrics (for development/testing)
 */
export async function collectAllVitals(): Promise<VitalsReport> {
  if (typeof window === 'undefined') return {};

  // Dynamically import web-vitals to avoid SSR issues
  const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import('web-vitals');

  const report: VitalsReport = {};

  return new Promise((resolve) => {
    let completed = 0;
    const total = 5;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        resolve(report);
      }
    };

    onLCP((metric: any) => {
      report.LCP = metric.value;
      checkComplete();
    });

    onINP((metric: any) => {
      report.INP = metric.value;
      checkComplete();
    });

    onCLS((metric: any) => {
      report.CLS = metric.value;
      checkComplete();
    });

    onFCP((metric: any) => {
      report.FCP = metric.value;
      checkComplete();
    });

    onTTFB((metric: any) => {
      report.TTFB = metric.value;
      checkComplete();
    });

    // Timeout after 10 seconds
    setTimeout(() => resolve(report), 10000);
  });
}
