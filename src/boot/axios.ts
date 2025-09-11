import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import uuid4 from "uuid4";

import log from 'electron-log/renderer.js';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'https://api.example.com' });

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

function addBearer(token: string) {
  log.info('::api:: adding bearer token..');

  api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  api.defaults.headers.common['X-Trace-Id'] = getOrCreateTraceId();
}

function removeBearer() {
  api.defaults.headers.common['Authorization'] = '';
  log.info('::api:: bearer token removed');
}

function getOrCreateTraceId() {
  let traceId : string | null = localStorage.getItem('traceId');
  if (!traceId) {
      traceId = uuid4();  // Generate a new UUID for the traceId
      localStorage.setItem('traceId', traceId?? '');  // Store it for future requests
  }
  return traceId;
}

export { api, addBearer, removeBearer };

