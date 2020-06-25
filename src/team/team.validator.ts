// team.validator

import { ITeam } from './team.interface';
import { InvalidTeamname, InvalidTeamInformation } from './team.error';
import { ObjectId } from 'mongodb';

export class TeamValidator {
    static isValid(team: ITeam): boolean {
        return team && TeamValidator.isTeamnameValid(team.teamname);
    }

    static isTeamnameValid(teamname: string): boolean {
        const teamnameRegex: RegExp = /^[A-Za-z0-9]{4,20}$/m;

        if (teamnameRegex.test(teamname)) {
            return true;
        }

        throw new InvalidTeamname('Teamname Invalid. 4 - 20 characters, contains letters or numbers');
    }

    static isTeamIdsValid(teamIds: string[]): boolean {
        for (const teamId of teamIds) {
            if (!ObjectId.isValid(teamId)) {
                throw new InvalidTeamInformation('Teamname Invalid. 4 - 20 characters, contains letters or numbers');
            }
        }

        return true;
    }
}
