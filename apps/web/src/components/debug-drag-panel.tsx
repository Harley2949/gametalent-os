/**
 * 应聘管理拖拽调试工具
 * 将此组件添加到 applications/page.tsx 中，用于实时显示拖拽状态
 */

import React, { useState, useEffect } from 'react';

export function DragDebugPanel() {
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: string; details?: string }>>([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedId: null,
    dragOverColumn: null,
    mousePosition: { x: 0, y: 0 }
  });

  useEffect(() => {
    // 监听所有拖拽事件
    const handleDragStart = (e: any) => {
      const target = e.target.closest('[data-application-id]');
      if (target) {
        const appId = target.dataset.applicationId;
        addLog('🎯 拖拽开始', `卡片 ID: ${appId}`, 'success');
        setDragState({
          isDragging: true,
          draggedId: appId,
          dragOverColumn: null,
          mousePosition: { x: e.clientX, y: e.clientY }
        });
      }
    };

    const handleDragOver = (e: any) => {
      const column = e.target.closest('[data-column-status]');
      if (column) {
        const status = column.dataset.columnStatus;
        if (status !== dragState.dragOverColumn) {
          addLog('📍 拖拽经过', `列: ${status}`, 'info');
          setDragState(prev => ({ ...prev, dragOverColumn: status }));
        }
      }
      setDragState(prev => ({
        ...prev,
        mousePosition: { x: e.clientX, y: e.clientY }
      }));
    };

    const handleDragLeave = (e: any) => {
      const column = e.target.closest('[data-column-status]');
      if (column) {
        addLog('⬅️ 拖拽离开', `列: ${column.dataset.columnStatus}`, 'warning');
        setDragState(prev => ({ ...prev, dragOverColumn: null }));
      }
    };

    const handleDrop = async (e: any) => {
      const column = e.target.closest('[data-column-status]');
      if (column) {
        const newStatus = column.dataset.columnStatus;
        addLog('🎯 拖拽放置', `目标列: ${newStatus}`, 'success');
        setDragState({
          isDragging: false,
          draggedId: null,
          dragOverColumn: null,
          mousePosition: { x: e.clientX, y: e.clientY }
        });
      }
    };

    const handleDragEnd = () => {
      addLog('✅ 拖拽结束', '', 'info');
      setDragState({
        isDragging: false,
        draggedId: null,
        dragOverColumn: null,
        mousePosition: { x: 0, y: 0 }
      });
    };

    // 添加事件监听
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);

    // 检查页面状态
    setTimeout(() => {
      const cards = document.querySelectorAll('[draggable="true"]');
      addLog('📊 页面检查', `找到 ${cards.length} 个可拖拽元素`, 'info');

      const columns = document.querySelectorAll('[data-column-status]');
      addLog('📊 页面检查', `找到 ${columns.length} 个放置列`, 'info');
    }, 1000);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const addLog = (message: string, details: string, type: string) => {
    const time = new Date().toLocaleTimeString('zh-CN');
    setLogs(prev => [{ time, message, details, type }, ...prev].slice(0, 19));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* 标题栏 */}
      <div style={{
        background: '#333',
        color: 'white',
        padding: '10px',
        borderRadius: '6px 6px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <strong>🔍 拖拽调试面板</strong>
        <button
          onClick={clearLogs}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          清除日志
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>拖拽状态：</strong>
          <span style={{
            marginLeft: '10px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: dragState.isDragging ? '#4caf50' : '#9e9e9e',
            color: 'white'
          }}>
            {dragState.isDragging ? '拖拽中' : '空闲'}
          </span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>拖拽卡片：</strong>
          <span style={{ marginLeft: '10px', color: dragState.draggedId ? '#2196f3' : '#999' }}>
            {dragState.draggedId || '无'}
          </span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>目标列：</strong>
          <span style={{ marginLeft: '10px', color: dragState.dragOverColumn ? '#ff9800' : '#999' }}>
            {dragState.dragOverColumn || '无'}
          </span>
        </div>
        <div>
          <strong>鼠标位置：</strong>
          <span style={{ marginLeft: '10px', color: '#666' }}>
            X: {dragState.mousePosition.x}, Y: {dragState.mousePosition.y}
          </span>
        </div>
      </div>

      {/* 日志区域 */}
      <div style={{
        padding: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
        background: '#f5f5f5'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            等待拖拽事件...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: '4px 8px',
                marginBottom: '2px',
                borderRadius: '3px',
                fontSize: '11px',
                background: log.type === 'success' ? '#c8e6c9' :
                          log.type === 'warning' ? '#ffe0b2' :
                          log.type === 'error' ? '#ffcdd2' :
                          '#e3f2fd',
                color: log.type === 'success' ? '#1b5e20' :
                         log.type === 'warning' ? '#e65100' :
                         log.type === 'error' ? '#c62828' :
                         '#0d47a1',
                borderBottom: '1px solid #e0e0e0'
              }}
            >
              <span style={{ color: '#999', fontSize: '10px' }}>{log.time}</span>
              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{log.message}</span>
              {log.details && <span style={{ marginLeft: '8px', color: '#666' }}>{log.details}</span>}
            </div>
          ))
        )}
      </div>

      {/* 测试按钮 */}
      <div style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            const cards = document.querySelectorAll('[draggable="true"]');
            alert(`找到 ${cards.length} 个可拖拽元素`);
          }}
          style={{
            flex: 1,
            padding: '6px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          检查拖拽元素
        </button>
        <button
          onClick={() => {
            const token = localStorage.getItem('auth_token');
            alert(`Token: ${token ? '已登录' : '未登录'}\n${token ? `Token前10位: ${token.substring(0, 10)}` : ''}`);
          }}
          style={{
            flex: 1,
            padding: '6px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          检查登录状态
        </button>
      </div>
    </div>
  );
}
