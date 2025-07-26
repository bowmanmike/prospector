import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Minimal polyfills for Next.js server functions
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js cache functions for testing
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))


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