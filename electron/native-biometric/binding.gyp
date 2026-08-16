{
  'targets': [{
    'target_name': 'biometric_keychain',
    'sources': ['biometric_keychain.mm'],
    'include_dirs': [
      '<!@(node -p "require(\'node-addon-api\').include")'
    ],
    'dependencies': [
      '<!(node -p "require(\'node-addon-api\').gyp")'
    ],
    'cflags!': ['-fno-exceptions'],
    'cflags_cc!': ['-fno-exceptions'],
    'xcode_settings': {
      'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
      'CLANG_CXX_LANGUAGE_STANDARD': 'c++17',
      'OTHER_LDFLAGS': [
        '-framework Security',
        '-framework Foundation',
        '-framework LocalAuthentication'
      ]
    },
    'conditions': [
      ['OS=="mac"', {
        'defines': ['__MACOS__']
      }]
    ]
  }]
}
