// team.repository

import { TeamModel } from './team.model';
import { DuplicateUnique } from '../utils/error';
import { ITeam } from './team.interface';

export class 
TeamRepository {
    /**
     * Finds team by its id.
     * @param teamId - The team id.
     */
    public static findById(teamId: string) {
        return TeamModel.findOne({ _id: teamId });
    }

    /**
     * Finds a specific team by user ID
     * @param userId - The id of a specific user.
     */
    public static findByUserId(userId: string) {
        // return TeamModel.find({ userIds: id });
        return TeamModel.find({ $or:[{ userIds: userId }, { adminIds: userId }] });
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
    public static async create(team: ITeam): Promise<ITeam> {
        try {
            const createdTeam = await TeamModel.create(team);
            return createdTeam;
        } catch (error) {
            console.log(error);
            if (error.code && error.code === 11000) {
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
