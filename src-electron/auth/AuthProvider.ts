

import {type AuthAccount} from "./AuthAccount"

export abstract class AuthProvider {


    public abstract login() : Promise<AuthAccount | undefined>;

    public abstract logout() : Promise<void>;

    public abstract getProfileToken() : Promise<string | undefined>;

}
