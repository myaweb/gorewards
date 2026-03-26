// Add custom jest matchers from jest-dom
// This file is automatically loaded before tests run

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Clerk auth globally
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
  currentUser: jest.fn(() => ({ id: 'test-user-id' })),
  ClerkProvider: ({ children }) => children,
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
  UserButton: () => 'UserButton',
}))

// Global test utilities
global.testUtils = {
  // Helper to create mock user profile
  createMockUserProfile: (overrides = {}) => ({
    id: 'profile-1',
    userId: 'user-123',
    creditScore: 'GOOD',
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM',
    spendingProfile: {
      grocery: 800,
      gas: 200,
      dining: 400,
      bills: 150,
      travel: 100,
      shopping: 200,
      entertainment: 50,
      utilities: 100,
      other: 50
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Helper to create mock card
  createMockCard: (overrides = {}) => ({
    id: 'card-1',
    name: 'Test Card',
    bank: 'TD',
    network: 'Visa',
    annualFee: { toString: () => '120' },
    baseRewardRate: { toString: () => '0.01' },
    imageUrl: '/test-card.jpg',
    affiliateLink: '/affiliate-link',
    slug: 'test-card',
    features: ['No foreign transaction fees'],
    eligibility: ['Minimum income $60,000'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    bonuses: [],
    multipliers: [],
    ...overrides
  }),

  // Helper to create mock spending profile
  createMockSpendingProfile: (overrides = {}) => ({
    grocery: 800,
    gas: 200,
    dining: 400,
    bills: 150,
    travel: 100,
    shopping: 200,
    entertainment: 50,
    utilities: 100,
    other: 50,
    ...overrides
  })
}

// Suppress console warnings in tests unless explicitly testing them
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = (...args) => {
  if (process.env.SHOW_CONSOLE_WARNINGS === 'true') {
    originalConsoleWarn(...args)
  }
}

console.error = (...args) => {
  if (process.env.SHOW_CONSOLE_ERRORS === 'true') {
    originalConsoleError(...args)
  }
}

// Restore console methods after tests
afterAll(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})