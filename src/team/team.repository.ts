// team.repository

import { TeamModel } from './team.model';
import { DuplicateUnique } from './team.error';
import { ITeam } from './team.interface';

export class TeamRepository {

    /**
     * Finds a specific team by ID
     * @param id - The id of a specific team.
     */
    public static findById(id: string) {
        return TeamModel.findOne({ _id: id }, { password: 0 });
    }

    /**
     * Finds a specific team by teamname.
     * @param teamname - The teamname of a specific team.
     */
    public static findByTeamname(teamname: string): Promise<ITeam | null> {
        return TeamModel.findOne({ teamname }).exec();
    }

    /**
     * Creates a new team.
     * @param team - The team to create.
     */
    public static create(team: ITeam): Promise<ITeam> {
        try {
            return TeamModel.create(team);
        } catch (error) {
            if (error.code && error.code === '11000') {
                throw new DuplicateUnique('Team name already exists.');
            } else {
                throw error;
            }
        }
    }

    /**
     * Update an old team with a new one.
     * @param id - The id of the old team.
     * @param team - The new team.
     */
    public static update(id: string, team: Partial<ITeam>): Promise<ITeam | null> {
        return TeamModel.findByIdAndUpdate(id, team, { new: true, runValidators: true }).exec();
    }

    /**
     * Deletes a team by specific ID.
     * @param id - the id of the team to delete.
     */
    public static delete(id: string): Promise<ITeam | null> {
        return TeamModel.findByIdAndRemove(id).exec();
    }
}
