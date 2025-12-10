// Mock for bare-os module
const os = {
  platform: jest.fn(),
  tmpdir: jest.fn()
}

export default os
