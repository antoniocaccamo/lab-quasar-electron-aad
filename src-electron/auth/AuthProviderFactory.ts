
import type { AuthProvider } from "./AuthProvider";
import MsalAuthProvider from "./msal/MsalAuthProvider"
import log from 'electron-log/main.js';

export default class AuthProviderFactory {

  public static createProvider(): AuthProvider {
    log.info("Creating AuthProvider instance : for now only MsalAuthProvider is supported");
    return new MsalAuthProvider();
  }

}

