import { parseDataToCsvText } from './parseDataToCsvText'

describe('parseDataToCsvText', () => {
  it('should export a single vault with login records to CSV', () => {
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
              websites: ['https://github.com']
            },
            folder: 'Dev',
            isFavorite: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].filename).toMatch(/^PearPass_Personal_Vault_/)
    expect(result[0].data).toContain(
      'type,vaultName,title,username,password,passwordUpdatedAt,websites,note,customFields,folder,isFavorite,createdAt,updatedAt'
    )
    expect(result[0].data).toContain(
      '"login","Personal Vault","GitHub","user1","pass1","","https://github.com","","","Dev","true","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })

  it('should handle multiple vaults and record types', () => {
    const data = [
      {
        name: 'Vault1',
        records: [
          {
            type: 'creditCard',
            data: {
              title: 'Visa',
              name: 'John Doe',
              number: '1234',
              expireDate: '12/25',
              securityCode: '999',
              pinCode: '0000'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      },
      {
        name: 'Vault2',
        records: [
          {
            type: 'identity',
            data: {
              title: 'ID',
              fullName: 'Jane Smith',
              email: 'jane@example.com',
              phoneNumber: '1234567890',
              address: '123 Main St',
              zip: '12345',
              city: 'Metropolis',
              region: 'CA',
              country: 'USA'
            },
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-02-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(2)
    expect(result[0].filename).toMatch(/^PearPass_Vault1_/)
    expect(result[1].filename).toMatch(/^PearPass_Vault2_/)
    expect(result[0].data).toContain('creditCard')
    expect(result[1].data).toContain('identity')
    expect(result[0].data).toContain('"John Doe","1234","12/25","999","0000"')
    expect(result[1].data).toContain(
      '"Jane Smith","jane@example.com","1234567890","123 Main St","12345","Metropolis","CA","USA"'
    )
  })

  it('should escape double quotes in field values', () => {
    const data = [
      {
        name: 'Vault"Special',
        records: [
          {
            type: 'login',
            data: {
              title: 'My "Special" Site',
              username: 'user"name',
              password: 'pass"word',
              websites: ['https://example.com']
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].data).toContain('"My ""Special"" Site"')
    expect(result[0].data).toContain('"user""name"')
    expect(result[0].data).toContain('"pass""word"')
    expect(result[0].filename).toMatch(/^PearPass_Vault_Special_/)
  })

  it('should handle empty records gracefully', () => {
    const data = [
      {
        name: 'EmptyVault',
        records: []
      }
    ]
    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(0)
  })

  it('should handle missing optional fields', () => {
    const data = [
      {
        name: 'TestVault',
        records: [
          {
            type: 'login',
            data: {
              title: 'NoUsernamePassword'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]
    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].data).toContain(
      '"login","TestVault","NoUsernamePassword","","","","","","","","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })

  it('should handle customFields and note fields', () => {
    const data = [
      {
        name: 'CustomVault',
        records: [
          {
            type: 'note',
            data: {
              title: 'NoteTitle',
              note: 'This is a note',
              customFields: [
                { type: 'tag', note: 'important' },
                { note: 'misc' }
              ]
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]
    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].data).toContain('"This is a note"')
    expect(result[0].data).toContain('"tag:important;note:misc"')
  })

  it('should handle passPhrase type records', () => {
    const data = [
      {
        name: 'PassPhraseVault',
        records: [
          {
            type: 'passPhrase',
            data: {
              title: 'My Secret Passphrase',
              passPhrase: 'super-secret-passphrase-123'
            },
            folder: 'Secrets',
            isFavorite: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].filename).toMatch(/^PearPass_PassPhraseVault_/)
    expect(result[0].data).toContain(
      'type,vaultName,title,passPhrase,note,customFields,folder,isFavorite,createdAt,updatedAt'
    )
    expect(result[0].data).toContain(
      '"passPhrase","PassPhraseVault","My Secret Passphrase","super-secret-passphrase-123","","","Secrets","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })

  it('should include passPhrase field in headers when passPhrase type is present', () => {
    const data = [
      {
        name: 'MixedVault',
        records: [
          {
            type: 'login',
            data: {
              title: 'GitHub Login',
              username: 'user1',
              password: 'pass1'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          },
          {
            type: 'passPhrase',
            data: {
              title: 'Secret Phrase',
              passPhrase: 'my-secret-phrase'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    // Should include both login fields and passPhrase field
    expect(result[0].data).toContain(
      'type,vaultName,title,username,password,passwordUpdatedAt,websites,passPhrase,note,customFields,folder,isFavorite,createdAt,updatedAt'
    )
    expect(result[0].data).toContain(
      '"login","MixedVault","GitHub Login","user1","pass1","","","","","","","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
    expect(result[0].data).toContain(
      '"passPhrase","MixedVault","Secret Phrase","","","","","my-secret-phrase","","","","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })

  it('should handle passPhrase with empty or missing data', () => {
    const data = [
      {
        name: 'EmptyPassPhraseVault',
        records: [
          {
            type: 'passPhrase',
            data: {
              title: 'Empty PassPhrase'
              // passPhrase field is missing
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          },
          {
            type: 'passPhrase',
            data: {
              title: 'Empty String PassPhrase',
              passPhrase: ''
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].data).toContain(
      '"passPhrase","EmptyPassPhraseVault","Empty PassPhrase","","","","","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
    expect(result[0].data).toContain(
      '"passPhrase","EmptyPassPhraseVault","Empty String PassPhrase","","","","","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })

  it('should handle wifiPassword type records', () => {
    const data = [
      {
        name: 'WiFiVault',
        records: [
          {
            type: 'wifiPassword',
            data: {
              title: 'Home WiFi Network',
              password: 'my-wifi-password-123'
            },
            folder: 'WiFi',
            isFavorite: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]
      }
    ]

    const result = parseDataToCsvText(data)
    expect(result).toHaveLength(1)
    expect(result[0].filename).toMatch(/^PearPass_WiFiVault_/)
    expect(result[0].data).toContain(
      'type,vaultName,title,password,note,customFields,folder,isFavorite,createdAt,updatedAt'
    )
    expect(result[0].data).toContain(
      '"wifiPassword","WiFiVault","Home WiFi Network","my-wifi-password-123","","","WiFi","false","2024-01-01T00:00:00Z","2024-01-02T00:00:00Z"'
    )
  })
})
