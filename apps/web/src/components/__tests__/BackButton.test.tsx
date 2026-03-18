/**
 * BackButton 组件测试
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import BackButton from '../BackButton'

// Mock next/navigation
jest.mock('next/navigation')

describe('BackButton 组件', () => {
  const mockPush = jest.fn()
  const mockBack = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    })
  })

  describe('基础渲染', () => {
    it('应该渲染返回按钮和文本', () => {
      render(<BackButton>返回列表</BackButton>)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('返回列表')).toBeInTheDocument()
    })

    it('应该使用正确的样式类', () => {
      const { container } = render(<BackButton>返回</BackButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('text-sm')
    })

    it('应该包含左箭头图标', () => {
      render(<BackButton>返回</BackButton>)

      // 检查 SVG 图标存在
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('点击行为', () => {
    it('默认使用 router.back() 返回', () => {
      render(<BackButton>返回</BackButton>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockBack).toHaveBeenCalledTimes(1)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('有 fallbackPath 时使用 router.push() 跳转', () => {
      render(<BackButton fallbackPath="/candidates">返回候选人</BackButton>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockPush).toHaveBeenCalledWith('/candidates')
      expect(mockBack).not.toHaveBeenCalled()
    })

    it('点击时应该有 hover 效果', () => {
      render(<BackButton>返回</BackButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:text-violet-600')
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 aria-label（当作为纯图标按钮时）', () => {
      render(<BackButton aria-label="返回上一页" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '返回上一页')
    })

    it('应该是键盘可访问的', () => {
      render(<BackButton>返回</BackButton>)

      const button = screen.getByRole('button')

      // 模拟键盘回车
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      expect(mockBack).toHaveBeenCalled()

      // 模拟空格键
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      expect(mockBack).toHaveBeenCalledTimes(2)
    })
  })

  describe('子元素渲染', () => {
    it('应该渲染文本子元素', () => {
      render(<BackButton>返回职位列表</BackButton>)

      expect(screen.getByText('返回职位列表')).toBeInTheDocument()
    })

    it('应该渲染复合子元素', () => {
      render(
        <BackButton>
          <span>返回</span>
          <span className="ml-2">职位列表</span>
        </BackButton>,
      )

      expect(screen.getByText('返回')).toBeInTheDocument()
      expect(screen.getByText('职位列表')).toBeInTheDocument()
    })
  })

  describe('样式变体', () => {
    it('应该支持自定义 className', () => {
      render(<BackButton className="custom-class">返回</BackButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('应该保持默认样式同时添加自定义样式', () => {
      render(<BackButton className="ml-4">返回</BackButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('ml-4')
    })
  })
})
