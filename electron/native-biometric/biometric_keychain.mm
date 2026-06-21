// macOS biometric-gated keychain addon for PearPass.
// Uses kSecAccessControlBiometryCurrentSet — the OS enforces biometric
// authentication before releasing stored data.
//
// Exported N-API functions:
//   store(service, account, data)       store with biometric ACL (sync)
//   retrieve(service, account, reason)  prompt Touch ID, return Promise<Buffer>
//   remove(service, account)            delete item (sync)
//   isAvailable()                       check biometric capability (sync)

#import <Foundation/Foundation.h>
#import <Security/Security.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include <napi.h>

// Create a biometric-gated access control ref
static SecAccessControlRef CreateBiometricAccessControl() {
  // kSecAccessControlBiometryCurrentSet (enrolled at time of access)
  // kSecAccessibleWhenUnlockedThisDeviceOnly (not migrated to backups)
  return SecAccessControlCreateWithFlags(
      kCFAllocatorDefault,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      kSecAccessControlBiometryCurrentSet,
      NULL);
}

// Keychain helpers with Data Protection keychain fallback.
// On macOS 15+, biometric ACL items need kSecUseDataProtectionKeychain.
// Try @YES first (production), retry with @NO on -34018 (dev mode).

static OSStatus KeychainDelete(NSString *nsService, NSString *nsAccount) {
  NSMutableDictionary *query = [NSMutableDictionary dictionary];
  query[(__bridge id)kSecClass] = (__bridge id)kSecClassGenericPassword;
  query[(__bridge id)kSecAttrService] = nsService;
  query[(__bridge id)kSecAttrAccount] = nsAccount;
  query[(__bridge id)kSecUseDataProtectionKeychain] = @YES;

  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

  if (status == (OSStatus)-34018) {
    query[(__bridge id)kSecUseDataProtectionKeychain] = @NO;
    status = SecItemDelete((__bridge CFDictionaryRef)query);
  }

  return status;
}

static OSStatus KeychainAdd(NSString *nsService, NSString *nsAccount,
                             NSData *data, SecAccessControlRef access) {
  NSMutableDictionary *query = [NSMutableDictionary dictionary];
  query[(__bridge id)kSecClass] = (__bridge id)kSecClassGenericPassword;
  query[(__bridge id)kSecAttrService] = nsService;
  query[(__bridge id)kSecAttrAccount] = nsAccount;
  query[(__bridge id)kSecValueData] = data;
  query[(__bridge id)kSecAttrAccessControl] = (__bridge id)access;
  query[(__bridge id)kSecUseDataProtectionKeychain] = @YES;

  OSStatus status = SecItemAdd((__bridge CFDictionaryRef)query, NULL);

  if (status == (OSStatus)-34018) {
    query[(__bridge id)kSecUseDataProtectionKeychain] = @NO;
    status = SecItemAdd((__bridge CFDictionaryRef)query, NULL);
  }

  return status;
}

// Keychain lookup with a pre-authenticated LAContext.
// The biometric prompt is handled externally (in Retrieve's async flow);
// this only performs the keychain read using the already-authenticated context.
static OSStatus KeychainFindWithContext(NSString *nsService, NSString *nsAccount,
                                         LAContext *context, CFTypeRef *result) {
  NSMutableDictionary *query = [NSMutableDictionary dictionary];
  query[(__bridge id)kSecClass] = (__bridge id)kSecClassGenericPassword;
  query[(__bridge id)kSecAttrService] = nsService;
  query[(__bridge id)kSecAttrAccount] = nsAccount;
  query[(__bridge id)kSecReturnData] = @YES;
  query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;
  query[(__bridge id)kSecUseAuthenticationContext] = context;
  query[(__bridge id)kSecUseDataProtectionKeychain] = @YES;

  *result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, result);

  if (status == (OSStatus)-34018 || status == errSecItemNotFound) {
    query[(__bridge id)kSecUseDataProtectionKeychain] = @NO;
    *result = NULL;
    status = SecItemCopyMatching((__bridge CFDictionaryRef)query, result);
  }

  return status;
}

// Heap-allocated state that lives until the biometric callback fires.
// Napi::Promise::Deferred is a C++ class — storing it in a struct avoids
// ObjC block capture issues.
struct AsyncRetrieveData {
  Napi::Promise::Deferred deferred;
  LAContext *context;
  NSString *nsService;
  NSString *nsAccount;
  bool resolved;
};

// store(service, account, data : Buffer)
Napi::Value Store(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Expected 3 arguments: service, account, data")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string service = info[0].As<Napi::String>().Utf8Value();
  std::string account = info[1].As<Napi::String>().Utf8Value();
  Napi::Buffer<char> dataBuffer = info[2].As<Napi::Buffer<char>>();

  SecAccessControlRef access = CreateBiometricAccessControl();
  if (!access) {
    Napi::Error::New(env, "Failed to create access control ref (no biometrics enrolled?)")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  NSData *data = [NSData dataWithBytes:dataBuffer.Data() length:dataBuffer.Length()];
  NSString *nsService = [NSString stringWithUTF8String:service.c_str()];
  NSString *nsAccount = [NSString stringWithUTF8String:account.c_str()];

  // Delete existing item first, then add with biometric ACL
  OSStatus deleteStatus = KeychainDelete(nsService, nsAccount);
  if (deleteStatus != errSecSuccess && deleteStatus != errSecItemNotFound) {
    fprintf(stderr, "[pearpass-native] KeychainDelete before store returned %d (non-fatal)\n",
            (int)deleteStatus);
  }
  OSStatus status = KeychainAdd(nsService, nsAccount, data, access);
  CFRelease(access);

  if (status != errSecSuccess) {
    Napi::Error::New(env,
        [NSString stringWithFormat:@"Keychain store failed: %d (status)", (int)status]
            .UTF8String)
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Boolean::New(env, true);
}

// retrieve(service, account, reason) -> Promise<Buffer>
// OS shows Touch ID dialog using `reason`. Returns a Promise — does NOT block
// the Node.js event loop during biometric prompt (which can take 1-30s).
Napi::Value Retrieve(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Expected 3 arguments: service, account, reason")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string service = info[0].As<Napi::String>().Utf8Value();
  std::string account = info[1].As<Napi::String>().Utf8Value();
  std::string reason = info[2].As<Napi::String>().Utf8Value();

  auto deferred = Napi::Promise::Deferred::New(env);

  LAContext *context = [[LAContext alloc] init];
  context.localizedReason = [NSString stringWithUTF8String:reason.c_str()];
  context.interactionNotAllowed = NO;

  // Retain NSStrings — they outlive the function scope until the callback fires
  NSString *nsService = [[NSString stringWithUTF8String:service.c_str()] retain];
  NSString *nsAccount = [[NSString stringWithUTF8String:account.c_str()] retain];

  auto *data = new AsyncRetrieveData{
    std::move(deferred),
    context,
    nsService,
    nsAccount,
    false
  };

  [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
          localizedReason:context.localizedReason
                    reply:^(BOOL success, NSError * _Nullable error) {
    // Retain error — the autorelease pool may drain before dispatch_async fires
    NSError *retainedError = [error retain];

    dispatch_async(dispatch_get_main_queue(), ^{
      if (data->resolved) {
        [retainedError release];
        [data->context release];
        [data->nsService release];
        [data->nsAccount release];
        delete data;
        return;
      }

      if (!success) {
        data->resolved = true;
        Napi::Error err = Napi::Error::New(data->deferred.Env(),
          "Biometric authentication failed");

        if (retainedError != nil && retainedError.code == LAErrorUserCancel) {
          err.Set("code", "ERR_USER_CANCELED");
        } else {
          err.Set("code", "ERR_AUTH_FAILED");
        }

        data->deferred.Reject(err.Value());

        [retainedError release];
        [data->context release];
        [data->nsService release];
        [data->nsAccount release];
        delete data;
        return;
      }

      [retainedError release];

      // Biometric auth succeeded — query keychain with authenticated context
      CFTypeRef result = NULL;
      OSStatus status = KeychainFindWithContext(data->nsService, data->nsAccount,
                                                  data->context, &result);

      data->resolved = true;

      if (status == errSecItemNotFound) {
        Napi::Error err = Napi::Error::New(data->deferred.Env(),
          "Biometric credentials not found");
        err.Set("code", "ERR_ITEM_NOT_FOUND");
        data->deferred.Reject(err.Value());
      } else if (status != errSecSuccess) {
        Napi::Error err = Napi::Error::New(data->deferred.Env(),
          [NSString stringWithFormat:@"Keychain retrieve failed: %d", (int)status].UTF8String);
        data->deferred.Reject(err.Value());
      } else {
        NSData *nsData = (NSData *)CFBridgingRelease(result);
        Napi::Buffer<char> buffer = Napi::Buffer<char>::Copy(data->deferred.Env(),
            static_cast<const char *>([nsData bytes]), [nsData length]);
        data->deferred.Resolve(buffer);
      }

      [data->context release];
      [data->nsService release];
      [data->nsAccount release];
      delete data;
    });
  }];

  return deferred.Promise();
}

// remove(service, account)
Napi::Value Remove(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Expected 2 arguments: service, account")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string service = info[0].As<Napi::String>().Utf8Value();
  std::string account = info[1].As<Napi::String>().Utf8Value();

  NSString *nsService = [NSString stringWithUTF8String:service.c_str()];
  NSString *nsAccount = [NSString stringWithUTF8String:account.c_str()];

  OSStatus status = KeychainDelete(nsService, nsAccount);

  if (status != errSecSuccess && status != errSecItemNotFound) {
    Napi::Error::New(env,
        [NSString stringWithFormat:@"Keychain remove failed: %d (status)", (int)status]
            .UTF8String)
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Boolean::New(env, true);
}

// isAvailable() — checks biometric capability, never throws
Napi::Value IsAvailable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  LAContext *context = [[LAContext alloc] init];
  NSError *error = nil;

  BOOL canEvaluate =
      [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
                            error:&error];

  [context release];

  return Napi::Boolean::New(env, canEvaluate ? true : false);
}

// Module Init
static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("store", Napi::Function::New(env, Store));
  exports.Set("retrieve", Napi::Function::New(env, Retrieve));
  exports.Set("remove", Napi::Function::New(env, Remove));
  exports.Set("isAvailable", Napi::Function::New(env, IsAvailable));
  return exports;
}

NODE_API_MODULE(biometric_keychain, Init)
