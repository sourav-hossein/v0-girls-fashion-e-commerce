import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
