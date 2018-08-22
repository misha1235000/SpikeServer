// team.controller

import { Request, Response, NextFunction } from 'express';
import { NotFound, InvalidParameter } from './team.error';
import { TeamRepository } from './team.repository';
import { ITeam } from './team.interface';

export class TeamController {
    /**
     * Creates a new team.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response, next: NextFunction) {
        const team = req.body as ITeam;

        if (team) {
            const createdTeam = await TeamRepository.create(team);

            return res.json({ team: createdTeam });
        }

        throw new InvalidParameter('team parameter is missing');
    }

    /**
     * Finds a specific team by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async findById(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            const team = await TeamRepository.findById(id);

            if (!team) {
                throw new NotFound('Team not found.');
            }

            return res.json({ team });
        }

        throw new InvalidParameter('_id parameter is missing.');
    }

    /**
     * Updates an old team with a new given one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response, next: NextFunction) {
        const team = req.body as Partial<ITeam>;

        if (Object.keys(team).length > 0 && team._id) {
            const updatedTeam = await TeamRepository.update(team._id, team);

            if (!updatedTeam) {
                throw new NotFound('Team not found.');
            }

            return res.json({ team: updatedTeam });
        }

        throw new InvalidParameter('_id parameter is missing.');
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
                throw new NotFound('Team not found.');
            }

            return res.json(deletedTeam);
        }

        throw new InvalidParameter('_id parameter is missing.');
    }
}
