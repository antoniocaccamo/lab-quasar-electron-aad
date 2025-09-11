/* eslint-disable @typescript-eslint/no-unused-vars */

import { BrowserWindow, shell } from "electron";
import log from 'electron-log/main.js';
import {
  type AccountInfo,
  type AuthenticationResult,
  type AuthorizationUrlRequest,
  CryptoProvider,
  type InteractiveRequest,
  PublicClientApplication,
  type SilentFlowRequest

} from "@azure/msal-node";
import { authConfig, customProtocol, requestConfig } from "./MsalAuthConfig";

import { CustomProtocolListener } from "./MsalCustomProtocolListener";

import { AuthProvider } from "../AuthProvider"
import { type AuthAccount } from "../AuthAccount";

/**
 * Handles authentication and token management using MSAL.
 * Auth code flow with PKCE is used for authentication.
 */
export default class MsalAuthProvider extends AuthProvider {

  private clientApplication: PublicClientApplication;
  private account: AccountInfo | undefined = undefined;
  private authCodeUrlParams: AuthorizationUrlRequest;
  authCodeRequest: { code: null; redirectUri: string; scopes: string[]; };
  silentProfileRequest: { scopes: string[]; account: null; forceRefresh: boolean; };
  silentMailRequest: { scopes: string[]; account: null; forceRefresh: boolean; };
  //// eslint-disable-next-line @typescript-eslint/no-explicit-any
  //private authConfig: Configuration = null;

  //// eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor() {
    super();
    this.clientApplication = new PublicClientApplication(authConfig);

    const baseSilentRequest = {
      account: null,
      forceRefresh: false,
    };

    this.authCodeUrlParams = requestConfig.authCodeUrlParameters;

    this.authCodeRequest = {
      ...requestConfig.authCodeRequest,
      code: null,
    };

    this.silentProfileRequest = {
      ...baseSilentRequest,
      scopes: ["User.Read"],
    };

    this.silentMailRequest = {
      ...baseSilentRequest,
      scopes: ["Mail.Read"],
    };
  }

  static async createAuthWindow(): Promise<BrowserWindow> {
    const popupWindow = new BrowserWindow({
      width: 400,
      height: 600,
    });

    // if the app is run by test automation, clear the cache
    if (process.env.automation === "1") {
      await popupWindow.webContents.session.clearStorageData();
    }
    return popupWindow;
  }

  public currentAccount(): AccountInfo | undefined {
    return this.account;
  }

  async login(): Promise<AuthAccount | undefined> {
    try {
      const tokenRequest = {
        scopes: requestConfig.authCodeRequest.scopes,
        account: null,
      };
      const authResult = await this.getToken(tokenRequest as unknown as SilentFlowRequest);
      return this.handleResponse(authResult)
        .then((account) => {
          if (account) {
            const authAccount: AuthAccount = {
              name: account.name || "",
              username: account.username || "",
              idToken: authResult.idToken || ""
            };
            return authAccount;
          }
          return undefined;
        })
        .catch((error) => {
          log.error(error);
          throw error;
        });
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (!this.account) {
        return;
      }
      await this.clientApplication
        .getTokenCache()
        .removeAccount(this.account);
      this.account = undefined;
    } catch (error) {
      log.error(error);
    }
  }

  public async getProfileToken(): Promise<string> {
    return (await this.getToken(this.silentProfileRequest as unknown as SilentFlowRequest)).accessToken;
  }

  async getToken(tokenRequest: SilentFlowRequest): Promise<AuthenticationResult> {
    // // eslint-disable-next-line no-useless-catch
    try {
      let authResponse: AuthenticationResult;
      const account = this.account || (await this.getAccount());
      if (account) {
        tokenRequest.account = account;
        authResponse = await this.getTokenSilent(tokenRequest);
      } else {
        authResponse = await this.getTokenInteractive(tokenRequest);
      }
      this.account = authResponse.account ?? undefined;
      return authResponse;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }
  async getTokenSilent(tokenRequest: SilentFlowRequest): Promise<AuthenticationResult> {

    try {
      return await this.clientApplication.acquireTokenSilent(tokenRequest);
    } catch (error) {
      console.log(
        "Silent token acquisition failed, acquiring token using pop up :",
        error
      );

      return await this.getTokenInteractive(tokenRequest);
    }
  }

  async getTokenInteractive(tokenRequest: SilentFlowRequest): Promise<AuthenticationResult> {
    // // eslint-disable-next-line no-useless-catch
    // try {
    //   /**
    //    * A loopback server of your own implementation, which can have custom logic
    //    * such as attempting to listen on a given port if it is available.
    //    */
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const customLoopbackClient = await AuthenticationCustomLoopbackClient.initialize(
    //     3874
    //   );
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   const openBrowser = async (url: any) => {
    //     await shell.openExternal(url);
    //   };
    //   const interactiveRequest: InteractiveRequest = {
    //     ...tokenRequest,
    //     openBrowser,
    //     successTemplate: fs
    //       .readFileSync("./public/successTemplate.html", "utf8")
    //       .toString(),
    //     errorTemplate: fs
    //       .readFileSync("./public/errorTemplate.html", "utf8")
    //       .toString()
    //     //, loopbackClient: customLoopbackClient, // overrides default loopback client
    //   };
    //   const authResponse =
    //     await this.clientApplication.acquireTokenInteractive(
    //       interactiveRequest
    //     );
    //   return authResponse;

    // } catch (error) {
    //   log.error(error);
    //   throw error;
    // }

    try {
      const cryptoProvider = new CryptoProvider();
      const { challenge, verifier } =
        await cryptoProvider.generatePkceCodes();
      const authWindow = await MsalAuthProvider.createAuthWindow();

      // Add PKCE params to Auth Code URL request
      const authCodeUrlParams = {
        ...this.authCodeUrlParams,
        scopes: tokenRequest.scopes,
        codeChallenge: challenge,
        codeChallengeMethod: "S256",
      };
      // Get Auth Code URL
      const authCodeUrl = await this.clientApplication.getAuthCodeUrl(
        authCodeUrlParams
      );

      const authCode = await this.listenForAuthCode(
        authCodeUrl,
        authWindow
      );

      // Use Authorization Code and PKCE Code verifier to make token request
      const authResult: AuthenticationResult =
        await this.clientApplication.acquireTokenByCode({
          ...this.authCodeRequest,
          code: authCode,
          codeVerifier: verifier,
        });

      authWindow.close();

      return authResult;

    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  private async handleResponse(response: AuthenticationResult) {
    this.account = response?.account || (await this.getAccount());
    return this.account;
  }



  private async getAccount(): Promise<AccountInfo | undefined> {
    const cache = this.clientApplication.getTokenCache();
    const currentAccounts = await cache.getAllAccounts();



    if (currentAccounts === null) {
      console.log("No accounts detected");
      return undefined;
    }

    if (currentAccounts.length > 1) {
      console.log(
        "Multiple accounts detected, need to add choose account code."
      );
      return currentAccounts[0];
    } else if (currentAccounts.length === 1) {
      return currentAccounts[0];
    } else {
      return undefined;
    }
  }

  private async listenForAuthCode(
    navigateUrl: string,
    authWindow: BrowserWindow
  ): Promise<string> {
    // Set up custom file protocol to listen for redirect response
    const authCodeListener = new CustomProtocolListener(
      customProtocol.name
    );
    const codePromise = authCodeListener.start();
    await authWindow.loadURL(navigateUrl);
    const code = await codePromise;
    authCodeListener.close();
    return code;
  }

}
