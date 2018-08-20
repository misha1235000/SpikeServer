// team.controller

import { Request, Response } from 'express';
import { TeamRepository } from './team.repository';
import { ITeam } from './team.interface';

export class TeamController {
    /**
     * Creates a new team.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {
        const team = req.body as ITeam;

        try {
            const createdTeam = await TeamRepository.create(team);

            return res.json({ team: createdTeam });
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    /**
     * Finds a specific team by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async findById(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const team = await TeamRepository.findById(id);

                if (!team) {
                    return res.status(404).send('Team not found.');
                }

                return res.json({ team });
            } catch (err) {
                return res.status(500).send('Error finding team by id.');
            }
        }

        return res.status(400).send('id parameter is missing');
    }

    /**
     * Updates an old team with a new given one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {
        const team = req.body as Partial<ITeam>;

        if (Object.keys(team).length > 0 && team._id) {
            try {
                const updatedTeam = await TeamRepository.update(team._id, team);

                if (!updatedTeam) {
                    return res.status(400).send('Team not found');
                }

                return res.json({ team: updatedTeam });
            } catch (err) {
                return res.status(400).send(err);
            }
        }

        return res.status(400).send('_id parameter missing');
    }

    /**
     * Deletes a specific team by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const deletedTeam = await TeamRepository.delete(id);

                return res.json(deletedTeam);
            } catch (err) {
                return res.status(400).send(err);
            }
        }

        return res.status(400).send('Team id not provided');
    }
}
