/**
 * 功能开关配置
 * 用于独立控制各个功能模块的启用/禁用
 * 当某个功能出现问题时，可以快速关闭该功能而不影响其他功能
 */

export const FEATURE_FLAGS = {
  // 统计卡片模块
  STATS_CARDS: true,

  // 搜索功能
  SEARCH: true,

  // 状态筛选
  STATUS_FILTER: true,

  // 职位筛选
  JOB_FILTER: true,

  // 视图切换（列表/看板）
  VIEW_SWITCHER: true,

  // 看板视图
  KANBAN_VIEW: true,

  // 列表视图
  LIST_VIEW: true,

  // 拖拽功能
  DRAG_AND_DROP: true,
};

/**
 * 检查功能是否启用
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * 动态启用/禁用功能
 */
export function setFeatureEnabled(feature: keyof typeof FEATURE_FLAGS, enabled: boolean): void {
  if (typeof window !== 'undefined') {
    console.warn(`[功能开关] ${feature} ${enabled ? '启用' : '禁用'}`);
  }
  (FEATURE_FLAGS as any)[feature] = enabled;
}
