import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, priority: _priority, ...props }: any) =>
    React.createElement('img', { src, alt, ...props }),
}))

if (!global.fetch) {
  global.fetch = vi.fn()
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!global.ResizeObserver) {
  global.ResizeObserver = MockResizeObserver as any
}

if (!global.IntersectionObserver) {
  global.IntersectionObserver = MockIntersectionObserver as any
}

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {}
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {}
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {}
}
