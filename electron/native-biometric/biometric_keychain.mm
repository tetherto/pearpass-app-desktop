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
#include <string>
#include <vector>

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

// Plain C++/ObjC result of the biometric flow, populated on whatever thread
// LocalAuthentication's reply block runs on. Deliberately holds no Napi::
// values — those are only safe to touch on the JS thread inside an active
// V8 HandleScope, which this struct's producer (the reply block) is not.
struct RetrieveResult {
  bool success = false;
  std::vector<char> data;
  std::string errorMessage;
  std::string errorCode;
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
//
// LAContext's evaluatePolicy:reply: fires its block on an arbitrary internal
// dispatch queue, never the JS thread. Touching any Napi:: value (creating a
// Buffer, resolving/rejecting the Deferred) from there segfaults V8 with
// "Cannot create a handle without a HandleScope" — being on the right OS
// thread isn't the same as being inside a valid V8 HandleScope, and plain
// dispatch_async(dispatch_get_main_queue(), ...) does neither of that setup.
// Napi::ThreadSafeFunction is the mechanism N-API provides specifically to
// marshal a call from any thread back onto the JS thread with a proper
// Napi::Env/HandleScope already active — that's what makes this safe.
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

  // Bound to a no-op JS function: we never invoke it, we only use this TSFN
  // as a thread-marshaling vehicle for the native Callback below.
  // __block: ThreadSafeFunction has no copy constructor (move-only), so the
  // Objective-C block below must capture it by reference, not by value.
  __block Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
      env,
      Napi::Function::New(env, [](const Napi::CallbackInfo &) {}),
      "BiometricRetrieve",
      0,
      1);

  LAContext *context = [[LAContext alloc] init];
  context.localizedReason = [NSString stringWithUTF8String:reason.c_str()];
  context.interactionNotAllowed = NO;

  // Retain NSStrings — they outlive the function scope until the callback fires
  NSString *nsService = [[NSString stringWithUTF8String:service.c_str()] retain];
  NSString *nsAccount = [[NSString stringWithUTF8String:account.c_str()] retain];

  [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
          localizedReason:context.localizedReason
                    reply:^(BOOL success, NSError * _Nullable error) {
    // LocalAuthentication invokes this reply block on an arbitrary internal
    // thread. LAContext (and the CSSM/Security keychain-session objects it
    // holds) is not safe to query or release off the main thread — doing so
    // crashes inside Security.framework's/AppKit's own teardown code
    // (confirmed via macOS crash reports: SIGSEGV inside
    // SSDLSession::~SSDLSession()/dbClose, and separately inside
    // -[NSCGSWindow dealloc] via SkyLight, both invoked from a background
    // dispatch queue). Hop to the main thread first for ALL Objective-C/
    // Security work — this mirrors why the pre-fix code happened to dodge
    // *this* crash (it also dispatched to the main queue), even though it
    // still crashed later from touching Napi:: values with no HandleScope.
    dispatch_async(dispatch_get_main_queue(), ^{
      auto *result = new RetrieveResult();

      if (!success) {
        result->errorMessage = "Biometric authentication failed";
        result->errorCode = (error != nil && error.code == LAErrorUserCancel)
            ? "ERR_USER_CANCELED"
            : "ERR_AUTH_FAILED";
      } else {
        CFTypeRef keychainResult = NULL;
        OSStatus status = KeychainFindWithContext(nsService, nsAccount, context,
                                                   &keychainResult);

        if (status == errSecItemNotFound) {
          result->errorMessage = "Biometric credentials not found";
          result->errorCode = "ERR_ITEM_NOT_FOUND";
        } else if (status != errSecSuccess) {
          result->errorMessage =
              [NSString stringWithFormat:@"Keychain retrieve failed: %d", (int)status]
                  .UTF8String;
        } else {
          NSData *nsData = (NSData *)CFBridgingRelease(keychainResult);
          const char *bytes = static_cast<const char *>([nsData bytes]);
          result->data.assign(bytes, bytes + [nsData length]);
          result->success = true;
        }
      }

      [context release];
      [nsService release];
      [nsAccount release];

      // We're on the main OS thread now, but that alone still doesn't give
      // us a V8 HandleScope — only Napi::ThreadSafeFunction sets that up.
      // Marshals `result` to the JS thread and invokes this callback there.
      napi_status callStatus = tsfn.BlockingCall(
          result,
          [deferred](Napi::Env jsEnv, Napi::Function, RetrieveResult *r) {
            if (r->success) {
              Napi::Buffer<char> buffer =
                  Napi::Buffer<char>::Copy(jsEnv, r->data.data(), r->data.size());
              deferred.Resolve(buffer);
            } else {
              Napi::Error err = Napi::Error::New(jsEnv, r->errorMessage);
              if (!r->errorCode.empty()) err.Set("code", r->errorCode);
              deferred.Reject(err.Value());
            }
            delete r;
          });

      if (callStatus != napi_ok) {
        // Callback was never scheduled (e.g. queue closing) — avoid a leak.
        delete result;
      }

      tsfn.Release();
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
