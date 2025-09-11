
import { type AuthAccount } from "app/src-electron/auth/AuthAccount";

export default interface AuthIPC {
  ipcAuth : {
    login: () => Promise<AuthAccount | undefined>;
    getAccount: () => Promise<AuthAccount | undefined>;
    getToken: (scopes: string[]) => Promise<string | undefined>;
    logout: () => Promise<void>;
  }
};
