import { ipcMain } from "electron";
import { AuthIPC } from "../Constants";

import log from 'electron-log/main.js';

import { type AuthProvider } from "../auth/AuthProvider";

export default class AuthenticationHandler {

  private provider: AuthProvider;

  constructor(theProvider: AuthProvider) {

    this.provider = theProvider;
  }

  public registerAuthHandlers(): void {

    ipcMain.handle(AuthIPC.Login, async () => {
      // Logic to handle login
      return await this.provider.login();
    });

    ipcMain.handle(AuthIPC.GetAccount, () => {
      // Logic to get the account information
      log.info('GetAccount handler invoked');
    });

    ipcMain.handle(AuthIPC.Logout, () => {
      // Logic to handle logout
      log.info('Logout handler invoked');
      return this.provider.logout();
    });

    ipcMain.handle(AuthIPC.GetToken, () => {
      // Logic to get the token with the specified scopes
      log.info('GetToken handler invoked');
      return this.provider.getProfileToken();
    });
  }

}
