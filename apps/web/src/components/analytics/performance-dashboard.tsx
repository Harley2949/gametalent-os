/**
 * 性能监控仪表盘组件
 * 用于监控和显示应用性能指标
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { cn } from '@gametalent/ui';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  loadTime: number;
  domContentLoaded: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 监听性能数据
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const navigationEntry = entries.find(
        (entry) => entry.entryType === 'navigation'
      ) as PerformanceNavigationTiming;

      if (navigationEntry) {
        setMetrics({
          fcp: 0, // 将从 Paint Timing API 获取
          lcp: 0, // 将从 Largest Contentful Paint API 获取
          fid: 0, // 将从 Event Timing API 获取
          cls: 0, // 将从 Layout Shift API 获取
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          loadTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
          domContentLoaded:
            navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
        });
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // 获取 Paint Timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

    if (fcpEntry) {
      setMetrics((prev) => (prev ? { ...prev, fcp: fcpEntry.startTime } : null));
    }

    return () => observer.disconnect();
  }, []);

  const getRating = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>性能监控</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">加载性能数据...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MetricRow
              label="FCP (First Contentful Paint)"
              value={`${metrics.fcp.toFixed(0)}ms`}
              rating={getRating(metrics.fcp, { good: 1800, poor: 3000 })}
            />
            <MetricRow
              label="LCP (Largest Contentful Paint)"
              value={`${metrics.lcp.toFixed(0)}ms`}
              rating={getRating(metrics.lcp, { good: 2500, poor: 4000 })}
            />
            <MetricRow
              label="FID (First Input Delay)"
              value={`${metrics.fid.toFixed(0)}ms`}
              rating={getRating(metrics.fid, { good: 100, poor: 300 })}
            />
            <MetricRow
              label="CLS (Cumulative Layout Shift)"
              value={metrics.cls.toFixed(3)}
              rating={getRating(metrics.cls, { good: 0.1, poor: 0.25 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>加载时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MetricRow
              label="TTFB (Time to First Byte)"
              value={`${metrics.ttfb.toFixed(0)}ms`}
              rating={getRating(metrics.ttfb, { good: 800, poor: 1800 })}
            />
            <MetricRow
              label="DOM Content Loaded"
              value={`${metrics.domContentLoaded.toFixed(0)}ms`}
              rating={getRating(metrics.domContentLoaded, { good: 2000, poor: 4000 })}
            />
            <MetricRow
              label="页面完全加载"
              value={`${metrics.loadTime.toFixed(0)}ms`}
              rating={getRating(metrics.loadTime, { good: 3000, poor: 5000 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>资源统计</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceStats />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({
  label,
  value,
  rating,
}: {
  label: string;
  value: string;
  rating: string;
}) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'good':
        return '良好';
      case 'needs-improvement':
        return '需改进';
      case 'poor':
        return '差';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className={cn('text-xs', getRatingColor(rating))}>
          {getRatingLabel(rating)}
        </div>
      </div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ResourceStats() {
  const [stats, setStats] = useState<{
    totalResources: number;
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.endsWith('.js')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css')) {
        cssSize += size;
      } else if (
        resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)
      ) {
        imageSize += size;
      }
    });

    setStats({
      totalResources: resources.length,
      totalSize,
      jsSize,
      cssSize,
      imageSize,
    });
  }, []);

  if (!stats) {
    return <div className="text-center py-4 text-gray-500">加载资源统计...</div>;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">总资源数</span>
        <span className="text-sm font-medium">{stats.totalResources}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">总大小</span>
        <span className="text-sm font-medium">{formatBytes(stats.totalSize)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">JS 大小</span>
        <span className="text-sm font-medium">{formatBytes(stats.jsSize)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">CSS 大小</span>
        <span className="text-sm font-medium">{formatBytes(stats.cssSize)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">图片大小</span>
        <span className="text-sm font-medium">{formatBytes(stats.imageSize)}</span>
      </div>
    </div>
  );
}

/**
 * 性能评分组件
 */
export function PerformanceScore() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 计算性能评分（0-100）
    const calculateScore = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return 0;

      let score = 100;

      // 根据 FCP 扣分
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcp) {
        if (fcp.startTime > 3000) score -= 20;
        else if (fcp.startTime > 1800) score -= 10;
      }

      // 根据 TTFB 扣分
      const ttfb = navigation.responseStart - navigation.requestStart;
      if (ttfb > 1800) score -= 20;
      else if (ttfb > 800) score -= 10;

      // 根据加载时间扣分
      const loadTime = navigation.loadEventEnd - navigation.startTime;
      if (loadTime > 5000) score -= 20;
      else if (loadTime > 3000) score -= 10;

      return Math.max(0, score);
    };

    setScore(calculateScore());
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '差';
  };

  return (
    <div className="text-center">
      <div
        className={cn(
          'text-6xl font-bold',
          getScoreColor(score)
        )}
      >
        {score}
      </div>
      <div className="text-sm text-gray-600 mt-2">{getScoreLabel(score)}</div>
    </div>
  );
}

/**
 * 实时性能监控组件
 */
export function RealTimePerformanceMonitor() {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // 监控内存使用
    if ('memory' in performance) {
      const interval = setInterval(() => {
        const memInfo = (performance as any).memory;
        setMemory(memInfo.usedJSHeapSize / 1024 / 1024); // MB
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="flex gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{fps}</div>
        <div className="text-xs text-gray-600">FPS</div>
      </div>
      {memory > 0 && (
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{memory.toFixed(1)}</div>
          <div className="text-xs text-gray-600">MB</div>
        </div>
      )}
    </div>
  );
}
