/**
 * Web Vitals 监控组件
 * 实时监控 Core Web Vitals 指标
 */

'use client';

import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isLoaded = false;

    const loadWebVitals = async () => {
      if (isLoaded) return;
      isLoaded = true;

      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      // ========================================
      // CLS (Cumulative Layout Shift)
      // ========================================
      getCLS((metric) => {
        sendToAnalytics(metric);
        console.log(`CLS: ${metric.value.toFixed(4)} [${metric.rating}]`);
      });

      // ========================================
      // FID (First Input Delay)
      // ========================================
      getFID((metric) => {
        sendToAnalytics(metric);
        console.log(`FID: ${metric.value.toFixed(2)}ms [${metric.rating}]`);
      });

      // ========================================
      // FCP (First Contentful Paint)
      // ========================================
      getFCP((metric) => {
        sendToAnalytics(metric);
        console.log(`FCP: ${metric.value.toFixed(2)}ms [${metric.rating}]`);
      });

      // ========================================
      // LCP (Largest Contentful Paint)
      // ========================================
      getLCP((metric) => {
        sendToAnalytics(metric);
        console.log(`LCP: ${metric.value.toFixed(2)}ms [${metric.rating}]`);
      });

      // ========================================
      // TTFB (Time to First Byte)
      // ========================================
      getTTFB((metric) => {
        sendToAnalytics(metric);
        console.log(`TTFB: ${metric.value.toFixed(2)}ms [${metric.rating}]`);
      });
    };

    loadWebVitals();
  }, []);

  return null;
}

// ========================================
// 发送数据到分析服务
// ========================================

function sendToAnalytics(metric: any) {
  const { name, value, rating, delta, id } = metric;

  // 发送到 Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
      custom_map: {
        metric_rating: rating,
      },
    });
  }

  // 发送到自定义分析端点
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        value,
        rating,
        delta,
        id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
      // 使用 keepalive 确保数据发送
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send web vitals:', error);
    });
  }
}

// ========================================
// Web Vitals 评分标准
// ========================================

export const WebVitalsThresholds = {
  LCP: {
    good: 2500, // 2.5s
    needsImprovement: 4000, // 4s
    poor: Infinity,
  },
  FID: {
    good: 100, // 100ms
    needsImprovement: 300, // 300ms
    poor: Infinity,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: Infinity,
  },
  FCP: {
    good: 1800, // 1.8s
    needsImprovement: 3000, // 3s
    poor: Infinity,
  },
  TTFB: {
    good: 800, // 800ms
    needsImprovement: 1800, // 1.8s
    poor: Infinity,
  },
} as const;

// ========================================
// 判断评分等级
// ========================================

export function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WebVitalsThresholds[metricName as keyof typeof WebVitalsThresholds];
  if (!thresholds) return 'good';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// ========================================
// Web Vitals 显示组件（开发环境）
// ========================================

export function WebVitalsDebug() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#4ade80' }}>
        Core Web Vitals
      </div>
      <div id="web-vitals-data">
        <div style={{ color: '#999' }}>加载中...</div>
      </div>
    </div>
  );
}

// ========================================
// 性能监控 Hook
// ========================================

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Performance Entry:', entry);
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

    return () => observer.disconnect();
  }, []);
}
