/**
 * Error tracking utilities with Sentry integration
 * Gracefully degrades if Sentry is not configured
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry error tracking
 * Only initializes if DSN is provided
 */
export function initErrorTracking() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Error Tracking] Sentry not configured - skipping initialization');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate:
        process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Filter out common 3D library errors in development
      beforeSend(event, hint) {
        if (process.env.NODE_ENV === 'development') {
          // Don't send events in development
          return null;
        }

        // Filter out known Three.js warnings
        const errorMessage = hint?.originalException?.toString() || '';
        if (errorMessage.includes('THREE.WebGLRenderer')) {
          return null;
        }

        return event;
      },

      // Attach stack traces to all messages
      attachStacktrace: true,

      // Track performance
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
    });

    console.log('[Error Tracking] Sentry initialized successfully');
  } catch (error) {
    console.error('[Error Tracking] Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Tracking]', error, context);
    }
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Error Tracking] [${level.toUpperCase()}] ${message}`);
    }
    return;
  }

  Sentry.captureMessage(message, {
    level,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Track a custom event
 */
export function trackEvent(name: string, data?: Record<string, any>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Error Tracking] Event: ${name}`, data);
    }
    return;
  }

  Sentry.addBreadcrumb({
    type: 'user',
    category: name,
    data,
  });
}

/**
 * Performance tracking wrapper
 */
export async function trackPerformance<T>(
  name: string,
  fn: () => Promise<T> | T,
  context?: Record<string, any>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    trackEvent('performance_metric', {
      name,
      duration: Math.round(duration),
      status: 'success',
      ...context,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    captureException(error as Error, {
      operation: name,
      duration: Math.round(duration),
      ...context,
    });

    throw error;
  }
}

/**
 * React error boundary for catching errors
 */
export function reportReactError(error: Error, errorInfo: React.ErrorInfo) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Tracking] React Error:', error, errorInfo);
    }
    return;
  }

  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
