import '@testing-library/jest-dom'

// Note: Removed global Request/Response mocks as they interfere with NextRequest

// Mock IndexedDB for testing
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
}

// Mock FileReader for file handling tests
global.FileReader = class {
  constructor() {
    this.readAsText = jest.fn()
    this.readAsArrayBuffer = jest.fn()
    this.result = ''
    this.error = null
  }
}

// Mock File API
global.File = class {
  constructor(parts, name, options = {}) {
    this.name = name
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
    this.webkitRelativePath = options.webkitRelativePath || ''
  }
}

// Mock FileList
global.FileList = class {
  constructor(files = []) {
    this.length = files.length
    files.forEach((file, index) => {
      this[index] = file
    })
  }
}

// Mock showDirectoryPicker for File System Access API
global.showDirectoryPicker = jest.fn()

// Suppress console.error for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})