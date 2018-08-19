// user.validator

import { IUser } from './user.interface';

export class UserValidator {

    private static readonly maxTitleLength = 256;

    static isValid(user: IUser): boolean {
        return user && UserValidator.isUsernameValid(user.username)
               UserValidator.isPasswordValid(user.password);
    }

    static isUsernameValid(username: string): boolean {
        const usernameRegex: RegExp = /[A-Za-z0-9]{4,15}/m;
        return usernameRegex.test(username);
    }

    static isPasswordValid(password: string): boolean {
        // Minimum eight characters, at least one letter, one number and one special character
        const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }
}
