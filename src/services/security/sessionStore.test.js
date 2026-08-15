jest.mock('sodium-native', () => {
  let counter = 0
  return {
    randombytes_buf: jest.fn((buffer) => {
      counter += 1
      buffer.fill(counter % 256)
    }),
    crypto_hash_sha256: jest.fn((out) => out.fill(9))
  }
})

import {
  clearAllSessions,
  closeSessionsForClient,
  createSession,
  getSession
} from './sessionStore'

const SHARED_SECRET = new Uint8Array(32).fill(1)
const TRANSCRIPT = new Uint8Array(96).fill(2)

describe('sessionStore', () => {
  beforeEach(() => {
    clearAllSessions()
  })

  it('records which client a session belongs to', () => {
    const { sessionId } = createSession(SHARED_SECRET, TRANSCRIPT, 'chromeKey')

    expect(getSession(sessionId).clientPublicKey).toBe('chromeKey')
  })

  it('defaults to no client when none is given', () => {
    const { sessionId } = createSession(SHARED_SECRET, TRANSCRIPT)

    expect(getSession(sessionId).clientPublicKey).toBeNull()
  })

  describe('closeSessionsForClient', () => {
    it('closes only the sessions of the named client', () => {
      const chromeA = createSession(SHARED_SECRET, TRANSCRIPT, 'chromeKey')
      const chromeB = createSession(SHARED_SECRET, TRANSCRIPT, 'chromeKey')
      const firefox = createSession(SHARED_SECRET, TRANSCRIPT, 'firefoxKey')

      expect(closeSessionsForClient('chromeKey')).toBe(2)

      expect(getSession(chromeA.sessionId)).toBeNull()
      expect(getSession(chromeB.sessionId)).toBeNull()
      // Unpairing one browser must not disconnect the others
      expect(getSession(firefox.sessionId)).not.toBeNull()
    })

    it('is a no-op for a client with no sessions', () => {
      const firefox = createSession(SHARED_SECRET, TRANSCRIPT, 'firefoxKey')

      expect(closeSessionsForClient('chromeKey')).toBe(0)
      expect(getSession(firefox.sessionId)).not.toBeNull()
    })
  })

  it('clears every session regardless of client', () => {
    const chrome = createSession(SHARED_SECRET, TRANSCRIPT, 'chromeKey')
    const firefox = createSession(SHARED_SECRET, TRANSCRIPT, 'firefoxKey')

    expect(clearAllSessions()).toBe(2)
    expect(getSession(chrome.sessionId)).toBeNull()
    expect(getSession(firefox.sessionId)).toBeNull()
  })
})
