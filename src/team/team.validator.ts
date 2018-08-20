// team.validator

import { ITeam } from './team.interface';

export class TeamValidator {
    static isValid(team: ITeam): boolean {
        return team && TeamValidator.isTeamnameValid(team.teamname) &&
               TeamValidator.isPasswordValid(team.password);
    }

    static isTeamnameValid(teamname: string): boolean {
        const teamnameRegex: RegExp = /[A-Za-z0-9]{4,15}/m;

        return teamnameRegex.test(teamname);
    }

    static isPasswordValid(password: string): boolean {
        // Minimum eight characters, at least one letter, one number and one special character
        const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

        return passwordRegex.test(password);
    }
}
