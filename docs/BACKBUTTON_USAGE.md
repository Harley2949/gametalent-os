# BackButton 组件使用文档

## 概述

`BackButton` 是一个智能返回按钮组件，提供统一的导航体验。它会自动检测浏览器历史记录：
- **有历史记录**：执行 `router.back()` 返回上一页
- **无历史记录**：跳转到指定的 fallback 页面（默认为首页）

## 组件位置

```
apps/web/src/components/shared/BackButton.tsx
```

## 导入方式

```tsx
import { BackButton } from '@/components/shared';
```

## 基础用法

### 1. 默认用法（返回首页）

```tsx
<BackButton />
```

效果：点击后有历史记录则后退，否则跳转到 `/`

### 2. 指定 fallback 路径

```tsx
<BackButton fallbackHref="/dashboard" />
```

效果：点击后有历史记录则后退，否则跳转到 `/dashboard`

### 3. 自定义按钮文本

```tsx
<BackButton label="返回列表" />
```

### 4. 调整样式变体

```tsx
// Ghost 样式（默认，轻量级）
<BackButton variant="ghost" />

// Outline 样式（带边框）
<BackButton variant="outline" />

// Default 样式（实心）
<BackButton variant="default" />
```

### 5. 调整按钮大小

```tsx
// 小号（默认）
<BackButton size="sm" />

// 中号
<BackButton size="md" />

// 大号
<BackButton size="lg" />
```

### 6. 隐藏图标

```tsx
<BackButton showIcon={false} />
```

### 7. 添加自定义类名

```tsx
<BackButton className="mr-4" />
```

## 完整示例

### 在详情页面中使用

```tsx
'use client';

import { BackButton } from '@/components/shared';
import Link from 'next/link';

export default function DetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮和面包屑导航 */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallbackHref="/jobs" />
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              控制台
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/jobs" className="text-gray-500 hover:text-gray-700">
              职位管理
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">职位详情</span>
          </nav>
        </div>

        {/* 页面内容 */}
        <div>
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `fallbackHref` | `string` | `'/'` | 无历史记录时的跳转路径 |
| `label` | `string` | `'返回'` | 按钮文本 |
| `showIcon` | `boolean` | `true` | 是否显示左侧图标 |
| `variant` | `'default' \| 'ghost' \| 'outline'` | `'ghost'` | 按钮样式变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | 按钮大小 |
| `className` | `string` | `''` | 额外的 CSS 类名 |

## 已应用的页面

✅ 职位详情页：`/apps/web/src/app/jobs/[id]/page.tsx`
- Fallback: `/jobs`

✅ 候选人详情页：`/apps/web/src/app/candidates/[id]/page.tsx`
- Fallback: `/candidates`

✅ 应聘详情页：`/apps/web/src/app/applications/[id]/page.tsx`
- Fallback: `/applications`

✅ 面试详情页：`/apps/web/src/app/interviews/[id]/page.tsx`
- Fallback: `/interviews`

## 设计原则

1. **一致性**：所有详情页面都使用相同的返回按钮样式和位置
2. **智能化**：自动检测历史记录，提供最佳的导航体验
3. **可配置**：支持多种样式和布局选项，适应不同场景
4. **无侵入**：不使用全局布局，在需要的地方按需引入

## 注意事项

⚠️ **主页不显示返回按钮**：根据设计要求，主页（`/`）不显示返回按钮。

⚠️ **客户端组件**：此组件使用了 `useRouter` 和 `useEffect`，必须标记为 `'use client'`。

⚠️ **Next.js App Router**：此组件专为 Next.js 14+ App Router 设计，使用了 `next/navigation` 中的 `useRouter`。

## 技术实现

组件通过以下方式实现智能导航：

```tsx
useEffect(() => {
  // 检查浏览器历史记录长度
  if (typeof window !== 'undefined') {
    setHasHistory(window.history.length > 1);
  }
}, []);

const handleClick = () => {
  if (hasHistory) {
    router.back();  // 有历史记录，执行后退
  } else {
    router.push(fallbackHref);  // 无历史记录，跳转到 fallback
  }
};
```

这种实现确保了用户在任何情况下都能顺利返回到合适的页面。
