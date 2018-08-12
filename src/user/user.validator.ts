import { Types } from "mongoose";
import { IUser } from "./user.interface";

export class UserValidator {

    private static readonly maxTitleLength = 256;

    static isValid(user: IUser): boolean {
        return user && UserValidator.isUsernameValid(user.username) &&
  //             UserValidator.isHostnameValid(user.hostname) &&
  //             UserValidator.isCallbackValid(user.callback) &&
               UserValidator.isPasswordValid(user.password);
    }

    static isUsernameValid(username: string): boolean {
        const usernameRegex: RegExp = /[A-Za-z0-9]{4,15}/m;
        return usernameRegex.test(username);
    }

 /*   static isHostnameValid(hostname: string): boolean {
        const hostnameRegex: RegExp = /(?:http|https):\/\/[A-z0-9]+/m;
        return hostnameRegex.test(hostname);
    }

    static isCallbackValid(callback: string): boolean {
        const callbackRegex: RegExp = /(?:http|https):\/\/[A-z0-9]+\/[A-z0-9]+/m;
        return callbackRegex.test(callback);
    }*/

    static isPasswordValid(password: string): boolean {
        return true;
    }
}
