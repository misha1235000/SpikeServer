// team.controller

import { Request, Response, NextFunction } from 'express';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { NotFound, InvalidParameter } from '../utils/error';
import { TeamRepository } from './team.repository';
import { ITeam } from './team.interface';

export class TeamController {
    static readonly TEAM_MESSAGES = {
        TEAM_PARAMETER_MISSING: 'Team parameter is missing',
        TEAM_NOT_FOUND: 'Team not found.',
        ID_PARAMETER_MISSING: 'id Parameter is missing.',
        NO_STACK: 'No stack was found.',
        SUCCESSFULLY_CREATED: 'Team Successfully Created',
    };

    /**
     * Creates a new team.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response, next: NextFunction) {
        const team = req.body as ITeam;

        if (team) {
            team.teamname = team.teamname.toLowerCase();
            const createdTeam = await TeamRepository.create(team);

            log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.SUCCESSFULLY_CREATED,
                                             'TeamController',
                                             '200',
                                             TeamController.TEAM_MESSAGES.NO_STACK));

            return res.json({ team: createdTeam });
        }

        log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.TEAM_PARAMETER_MISSING,
                                         'TeamController',
                                         '400',
                                         TeamController.TEAM_MESSAGES.NO_STACK));

        throw new InvalidParameter(TeamController.TEAM_MESSAGES.TEAM_PARAMETER_MISSING);
    }

    /**
     * Finds a specific team by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async findById(req: Request, res: Response) {
        const id = req.teamId;

        if (id) {
            const team = await TeamRepository.findById(id);

            if (!team) {
                throw new NotFound(TeamController.TEAM_MESSAGES.TEAM_NOT_FOUND);
            }

            return res.json({ team });
        }

        log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.TEAM_PARAMETER_MISSING,
                                         'TeamController',
                                         '400',
                                         TeamController.TEAM_MESSAGES.NO_STACK));

        throw new InvalidParameter(TeamController.TEAM_MESSAGES.ID_PARAMETER_MISSING);
    }

    /**
     * Updates an old team with a new given one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response, next: NextFunction) {
        const team = req.body as Partial<ITeam>;

        if (Object.keys(team).length > 0 && team._id) {
            if (team.teamname) {
                team.teamname = team.teamname.toLowerCase();
            }

            const updatedTeam = await TeamRepository.update(team._id, team);

            if (!updatedTeam) {
                log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.TEAM_NOT_FOUND,
                                                 'TeamController',
                                                 '404',
                                                 TeamController.TEAM_MESSAGES.NO_STACK));

                throw new NotFound(TeamController.TEAM_MESSAGES.TEAM_NOT_FOUND);
            }

            return res.json({ team: updatedTeam });
        }

        log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.ID_PARAMETER_MISSING,
                                         'TeamController',
                                         '400',
                                         TeamController.TEAM_MESSAGES.NO_STACK));

        throw new InvalidParameter(TeamController.TEAM_MESSAGES.ID_PARAMETER_MISSING);
    }

    /**
     * Deletes a specific team by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;

        if (id) {
            const deletedTeam = await TeamRepository.delete(id);

            if (!deletedTeam) {
                log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.TEAM_NOT_FOUND,
                                                 'TeamController',
                                                 '404',
                                                 TeamController.TEAM_MESSAGES.NO_STACK));

                throw new NotFound(this.TEAM_MESSAGES.TEAM_NOT_FOUND);
            }

            return res.json(deletedTeam);
        }

        log(LOG_LEVEL.INFO, parseLogData(TeamController.TEAM_MESSAGES.ID_PARAMETER_MISSING,
                                         'TeamController',
                                         '400',
                                         TeamController.TEAM_MESSAGES.NO_STACK));

        throw new InvalidParameter(TeamController.TEAM_MESSAGES.ID_PARAMETER_MISSING);
    }
}
