import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'

const mockCredential = {
  id: 'OLcKHkkaQkO1ik7-DQCejQ',
  rawId: 'OLcKHkkaQkO1ik7-DQCejQ',
  type: 'public-key',
  response: {
    clientDataJSON:
      'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZnVWOWxrSS1FZFljTk5aX01HS3FCM2NvM2V1VXhNRkdRVnVVNFpUdWdkcyIsIm9yaWdpbiI6Imh0dHBzOi8vd3d3LnBhc3NrZXlzLWRlYnVnZ2VyLmlvIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ',
    attestationObject:
      'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViU47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFVdAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDi3Ch5JGkJDtYpO_g0Ano2lAQIDJiABIVggMncC-B3aWkVlxfj8Ir2GxLvvNjsoZ61loh3caiCwKL4iWCD7J3KI1jI0rP8YxAt90voUNiZfE6IMOhWx_QauQMG47A',
    authenticatorData:
      '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFVdAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDi3Ch5JGkJDtYpO_g0Ano2lAQIDJiABIVggMncC-B3aWkVlxfj8Ir2GxLvvNjsoZ61loh3caiCwKL4iWCD7J3KI1jI0rP8YxAt90voUNiZfE6IMOhWx_QauQMG47A',
    publicKey:
      'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMncC-B3aWkVlxfj8Ir2GxLvvNjsoZ61loh3caiCwKL77J3KI1jI0rP8YxAt90voUNiZfE6IMOhWx_QauQMG47A',
    publicKeyAlgorithm: -7,
    transports: ['hybrid', 'internal']
  },
  authenticatorAttachment: 'platform',
  clientExtensionResults: {
    credProps: {
      rk: true
    }
  },
  _privateKey:
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgjB33PY-3v-zhNl2CqFQX-i2pwSMr9E1rTJIqu2nZ1BahRANCAAQydwL4HdpaRWXF-PwivYbEu-82OyhnrWWiHdxqILAovvsncojWMjSs_xjEC33S-hQ2Jl8Togw6FbH9Bq5Awbjs',
  _userId: 'QND9iRzfLqxSDIoB4711RRLXqwISKDmxryYVLW_sEbY'
}

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || [])
}))

describe('validateAndPrepareLoginData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should validate and prepare valid login data', () => {
    const loginData = {
      title: 'My Login',
      username: 'user123',
      password: 'password123',
      credential: mockCredential,
      note: 'This is a note',
      websites: ['https://example.com'],
      customFields: [{ name: 'field1', value: 'value1', type: 'text' }]
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual(loginData)
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      loginData.customFields
    )
  })

  test('should validate with minimal required fields', () => {
    const loginData = {
      title: 'My Login',
      websites: ['https://example.com']
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual({
      title: 'My Login',
      username: undefined,
      password: undefined,
      credential: undefined,
      note: undefined,
      websites: ['https://example.com'],
      customFields: []
    })
  })

  test('should throw error if title is missing', () => {
    const loginData = {
      username: 'user123',
      websites: ['https://example.com']
    }

    expect(() => {
      validateAndPrepareLoginData(loginData)
    }).toThrow('Invalid login data:')
  })

  test('should throw error if websites is not an array', () => {
    const loginData = {
      title: 'My Login',
      websites: 'https://example.com'
    }

    expect(() => {
      validateAndPrepareLoginData(loginData)
    }).toThrow('Invalid login data:')
  })

  test('should accept empty username', () => {
    const loginData = {
      title: 'My Login',
      username: '',
      websites: ['https://example.com']
    }

    const result = validateAndPrepareLoginData(loginData)
    expect(result.username).toBe('')
  })

  test('should accept null and undefined values for optional fields', () => {
    const loginData = {
      title: 'My Login',
      username: null,
      password: undefined,
      credential: null,
      note: null,
      websites: ['https://example.com'],
      customFields: null
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual({
      title: 'My Login',
      username: null,
      password: undefined,
      credential: null,
      note: null,
      websites: ['https://example.com'],
      customFields: []
    })
  })
})
