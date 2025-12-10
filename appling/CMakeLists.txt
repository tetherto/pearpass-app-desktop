cmake_minimum_required(VERSION 3.31)

find_package(cmake-pear REQUIRED PATHS node_modules/cmake-pear)

project(pear_appling C CXX ASM)

add_pear_appling(
  pear_appling
  ID "tywsat7gz8m65ejx4zjn3773pbdc4j8m66tukis8dgzekraymtzo"
  LINK "pear://tywsat7gz8m65ejx4zjn3773pbdc4j8m66tukis8dgzekraymtzo"
  NAME "PearPass"
  VERSION 1.0.0
  AUTHOR "Tether Data S.A. de C.V."
  DESCRIPTION "A secure, decentralized and fully local password manager"

  MACOS_IDENTIFIER com.pears.pass
  MACOS_CATEGORY public.app-category.productivity
  MACOS_SIGNING_IDENTITY "959D2C8BB8323AEF9C2367ACA2F854AE4D7DE458"

  WINDOWS_SIGNING_SUBJECT "<string>"
  WINDOWS_SIGNING_THUMBPRINT <sha1>

  LINUX_CATEGORY Utility
)