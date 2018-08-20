// team.validator

import { ITeam } from './team.interface';
import { InvalidTeamname, InvalidPassword } from './team.error';

export class TeamValidator {
    static isValid(team: ITeam): boolean {
        return team && TeamValidator.isTeamnameValid(team.teamname) &&
               TeamValidator.isPasswordValid(team.password);
    }

    static isTeamnameValid(teamname: string): boolean {
        const teamnameRegex: RegExp = /[A-Za-z0-9]{4,15}/m;

        if (teamnameRegex.test(teamname)) {
            return true;
        }

        throw new InvalidTeamname('Teamname Invalid. 4 - 15 characters, contains letters or numbers');
    }

    static isPasswordValid(password: string): boolean {
        // Minimum eight characters, at least one letter, one number and one special character
        const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,50}$/;

        if (passwordRegex.test(password)) {
            return true;
        }

        throw new InvalidPassword('Password Invalid. 8 - 50 characters, at least one letter, one number and one special character');
    }
}
