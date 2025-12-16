/* eslint-disable @typescript-eslint/no-unused-vars */

import { LogLevel, type Configuration } from "@azure/msal-node";
import { cachePlugin } from "./MsalAuthCachePlugin";
import path from "path";
import { fileURLToPath } from "url";
import log from 'electron-log/main.js';


const CLIENT_ID = process.env.CLIENT_ID;
const TENANT_ID = process.env.TENANT_ID;

export const GRAPH_ME_ENDPOINT = "https://graph.microsoft.com/v1.0/me";
export const GRAPH_PHOTO_ENDPOINT = "https://graph.microsoft.com/v1.0/me/photo/$value";

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const publicFolder = path.resolve(currentDir, process.env.QUASAR_PUBLIC_FOLDER)
const CACHE_LOCATION = path.join(publicFolder, 'cache', 'msal.json');

log.info(`CLIENT_ID: ${CLIENT_ID}`);
log.info(`TENANT_ID: ${TENANT_ID}`);
log.info(`CACHE_LOCATION: ${CACHE_LOCATION}`);

const authConfig: Configuration = {
    auth : {
        clientId: `${CLIENT_ID}`,
        authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    },
    system : {
        loggerOptions: {
          piiLoggingEnabled: false,
          logLevel: LogLevel.Verbose,
          loggerCallback : (level, message, containsPii) => {
            log.log(message);
          }
        }

    },
    cache : {
        cachePlugin : cachePlugin(CACHE_LOCATION)
    }

};

const requestConfig = {
  authCodeUrlParameters: {
    scopes: ["user.read"],
    redirectUri: `msal${CLIENT_ID}://auth`
  },
  authCodeRequest: {
    redirectUri: `msal${CLIENT_ID}://auth`,
    scopes: ["User.Read"]
  }
};

const customProtocol = {
  name: `msal${CLIENT_ID}`
};

export {
  authConfig,
  customProtocol,
  requestConfig,
}
