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

    static isUserIdsValid(userIds: string[]): boolean {
        for (const userId of userIds) {
            if (!ObjectId.isValid(userId)) {
                throw new InvalidTeamInformation('The user IDs are invalid');
            }
        }

        return true;
    }

    static isContactUserIdValid(contactUesrId: string): boolean {
        if (!ObjectId.isValid(contactUesrId)) {
            throw new InvalidTeamInformation('The contact user ID is invalid');
        }
        
        return true;
    }
}
