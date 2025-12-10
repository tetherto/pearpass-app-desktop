import { parseDataToJson } from './parseDataToJson'

describe('parseDataToJson', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-01T12:34:56.789Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should export a single vault with records to JSON', () => {
    const data = [
      {
        name: 'Personal Vault',
        records: [
          {
            type: 'login',
            data: {
              title: 'GitHub',
              username: 'user1',
              password: 'pass1',
              passwordUpdatedAt: 179
            },
            folder: 'Dev',
            isFavorite: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToJson(data)
    expect(result).toHaveLength(1)
    expect(result[0].filename).toMatch(
      /^PearPass_Personal_Vault_2024_06_01T12_34_56_789Z\.json$/
    )
    const parsed = JSON.parse(result[0].data)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].vaultName).toBe('Personal Vault')
    expect(parsed[0].type).toBe('login')
    expect(parsed[0].data.title).toBe('GitHub')
    expect(parsed[0].data.passwordUpdatedAt).toBe(179)
  })

  it('should handle multiple vaults', () => {
    const data = [
      {
        name: 'Vault1',
        records: [
          {
            type: 'note',
            data: { title: 'Note1' },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      },
      {
        name: 'Vault2',
        records: [
          {
            type: 'login',
            data: { title: 'Login1' },
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-02-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToJson(data)
    expect(result).toHaveLength(2)
    expect(result[0].filename).toMatch(
      /^PearPass_Vault1_2024_06_01T12_34_56_789Z\.json$/
    )
    expect(result[1].filename).toMatch(
      /^PearPass_Vault2_2024_06_01T12_34_56_789Z\.json$/
    )
    expect(JSON.parse(result[0].data)[0].vaultName).toBe('Vault1')
    expect(JSON.parse(result[1].data)[0].vaultName).toBe('Vault2')
  })

  it('should handle vault names with special characters', () => {
    const data = [
      {
        name: 'Vault "Special"',
        records: [
          {
            type: 'login',
            data: { title: 'Test' },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]
    const result = parseDataToJson(data)
    expect(result).toHaveLength(1)
    expect(result[0].filename).toMatch(
      /^PearPass_Vault__Special__2024_06_01T12_34_56_789Z\.json$/
    )
  })

  it('should handle empty records gracefully', () => {
    const data = [
      {
        name: 'EmptyVault',
        records: []
      }
    ]
    const result = parseDataToJson(data)
    expect(result).toHaveLength(1)
    expect(JSON.parse(result[0].data)).toEqual([])
  })

  it('should include all record fields and vaultName', () => {
    const data = [
      {
        name: 'TestVault',
        records: [
          {
            type: 'login',
            data: { title: 'Test' },
            extraField: 'extra',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]
    const result = parseDataToJson(data)
    const parsed = JSON.parse(result[0].data)
    expect(parsed[0].extraField).toBe('extra')
    expect(parsed[0].vaultName).toBe('TestVault')
  })
})
