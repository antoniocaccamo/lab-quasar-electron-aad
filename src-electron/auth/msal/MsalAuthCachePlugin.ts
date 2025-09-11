/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ICachePlugin, TokenCacheContext } from "@azure/msal-node";
import * as fs from "fs";
import log  from "electron-log/main.js";

export const cachePlugin = (CACHE_LOCATION: string): ICachePlugin => {
    const beforeCacheAccess = async (cacheContext: TokenCacheContext) => {
        return new Promise<void>( (resolve, reject) => {

            log.info("Attempting to read cache from " + CACHE_LOCATION);
            if ( ! fs.existsSync(CACHE_LOCATION) ) {
                log.info("Cache file does not exist... creating a new one");
                fs.writeFileSync(CACHE_LOCATION, "{}");
            }
            if (fs.existsSync(CACHE_LOCATION)) {
                fs.readFile(CACHE_LOCATION, "utf-8", (error, data) => {
                    if (error) {
                        log.error("Error reading cache file: " + JSON.stringify(error));
                        reject(error);
                    } else {
                        cacheContext.tokenCache.deserialize(data);
                        resolve();
                    }
                });
            } else {
                fs.writeFile(
                    CACHE_LOCATION,
                    cacheContext.tokenCache.serialize(),
                    (error) => {
                        if (error) {
                            log.error("Error writing cache file: " + JSON.stringify(error));
                            reject(error);
                        }
                    }
                );
            }
        });
    };

    const afterCacheAccess = async (cacheContext: TokenCacheContext) => {
        return new Promise<void>( (resolve, reject) => {

          if (cacheContext.cacheHasChanged) {

             fs.writeFile(
                CACHE_LOCATION,
                cacheContext.tokenCache.serialize(),
                (error) => {
                    if (error) {
                        reject(error);
                    }
                }
            );

          }
          resolve();
        });

    };

    return {
        beforeCacheAccess,
        afterCacheAccess,
    };
};


