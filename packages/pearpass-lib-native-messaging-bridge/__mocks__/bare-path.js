// Mock for bare-path module
const path = {
  join: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn(),
  resolve: jest.fn()
}

export default path
