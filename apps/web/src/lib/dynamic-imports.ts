/**
 * 动态导入配置
 * 用于代码分割和懒加载，优化首屏加载性能
 */

import { lazy } from 'react';
import dynamic from 'next/dynamic';

// ========================================
// 页面级懒加载
// ========================================

export const DashboardPage = dynamic(() =>
  import('@/app/dashboard/page').then((mod) => mod.default),
  {
    loading: () => <PageLoadingSkeleton />,
    ssr: true,
  }
);

export const CandidatesPage = dynamic(() =>
  import('@/app/candidates/page').then((mod) => mod.default),
  {
    loading: () => <PageLoadingSkeleton />,
    ssr: true,
  }
);

export const ApplicationsPage = dynamic(() =>
  import('@/app/applications/page').then((mod) => mod.default),
  {
    loading: () => <PageLoadingSkeleton />,
    ssr: true,
  }
);

export const JobsPage = dynamic(() =>
  import('@/app/jobs/page').then((mod) => mod.default),
  {
    loading: () => <PageLoadingSkeleton />,
    ssr: true,
  }
);

export const AnalyticsPage = dynamic(() =>
  import('@/app/analytics/page').then((mod) => mod.default),
  {
    loading: () => <PageLoadingSkeleton />,
    ssr: true,
  }
);

// ========================================
// 组件级懒加载（重型组件）
// ========================================

// 图表组件（延迟加载）
export const TrendChart = dynamic(
  () => import('@/components/analytics/trend-chart').then((mod) => mod.TrendChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // 图表组件只在客户端渲染
  }
);

export const FunnelChart = dynamic(
  () => import('@/components/analytics/funnel-chart').then((mod) => mod.FunnelChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const CompetitorGraph = dynamic(
  () => import('@/components/competitor-graph').then((mod) => mod.CompetitorGraph),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// 数据表格组件（带虚拟滚动）
export const DataTable = dynamic(
  () => import('@/components/shared/data-table').then((mod) => mod.DataTable),
  {
    loading: () => <TableSkeleton />,
  }
);

// 富文本编辑器
export const RichTextEditor = dynamic(
  () => import('@/components/shared/rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
);

// 文件上传组件
export const FileUpload = dynamic(
  () => import('@/components/shared/file-upload').then((mod) => mod.FileUpload),
  {
    loading: () => <UploadSkeleton />,
  }
);

// PDF 预览组件
export const PDFViewer = dynamic(
  () => import('@/components/shared/pdf-viewer').then((mod) => mod.PDFViewer),
  {
    loading: () => <PDFSkeleton />,
    ssr: false,
  }
);

// ========================================
// 模态框组件（按需加载）
// ========================================

export const CreateCandidateModal = dynamic(() =>
  import('@/components/candidates/create-candidate-modal').then((mod) => mod.CreateCandidateModal)
);

export const CreateApplicationModal = dynamic(() =>
  import('@/components/applications/create-application-modal').then((mod) => mod.CreateApplicationModal)
);

export const InterviewSchedulerModal = dynamic(() =>
  import('@/components/applications/interview-scheduler-modal').then((mod) => mod.InterviewSchedulerModal)
);

// ========================================
// Loading Skeleton 组件
// ========================================

function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-64 bg-gray-200 rounded animate-pulse flex items-center justify-center">
      <div className="text-gray-400">加载图表...</div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-64 bg-gray-200 rounded animate-pulse flex items-center justify-center">
      <div className="text-gray-400">加载编辑器...</div>
    </div>
  );
}

function UploadSkeleton() {
  return (
    <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400">加载上传组件...</div>
    </div>
  );
}

function PDFSkeleton() {
  return (
    <div className="h-96 bg-gray-200 rounded animate-pulse flex items-center justify-center">
      <div className="text-gray-400">加载 PDF...</div>
    </div>
  );
}

// ========================================
// 预加载策略
// ========================================

/**
 * 预加载指定的模块
 * 使用场景：用户即将导航到某个页面时，提前加载该页面的代码
 */
export async function preloadPage(pageName: string) {
  switch (pageName) {
    case 'candidates':
      import('@/app/candidates/page');
      break;
    case 'applications':
      import('@/app/applications/page');
      break;
    case 'jobs':
      import('@/app/jobs/page');
      break;
    case 'analytics':
      import('@/app/analytics/page');
      break;
  }
}

/**
 * 预加载图片资源
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 批量预加载资源
 */
export async function preloadResources(resources: string[]) {
  const promises = resources.map((src) => preloadImage(src));
  return Promise.allSettled(promises);
}

// ========================================
// 代码分割提示
// ========================================

/**
 * 获取组件的 chunk 名称
 * 用于调试和监控
 */
export function getChunkName(componentName: string): string {
  return `${componentName}-chunk`;
}

/**
 * 监控动态加载性能
 */
export function trackDynamicImport(componentName: string, startTime: number) {
  const endTime = Date.now();
  const loadTime = endTime - startTime;

  // 发送到分析服务
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'dynamic_import', {
      component_name: componentName,
      load_time: loadTime,
    });
  }

  // 开发环境打印
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Dynamic Import] ${componentName} loaded in ${loadTime}ms`);
  }
}
