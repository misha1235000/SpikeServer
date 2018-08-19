// user.controller

import { Request, Response } from 'express';
import { UserRepository } from './user.repository';
import { IUser } from './user.interface';

export class UserController {
    /**
     * Creates a new user.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {
        const user = req.body as IUser;

        try {
            const createdUser = await UserRepository.create(user);

            return res.json({ user: createdUser });
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    /**
     * Finds a specific user by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async findById(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const user = await UserRepository.findById(id);

                if (!user) {
                    return res.status(404).send('User not found.');
                }

                return res.json({ user });
            } catch (err) {
                return res.status(500).send('Error finding user by id.');
            }
        }

        return res.status(400).send('id parameter is missing');
    }

    /**
     * Updates an old user with a new given one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {
        const user = req.body as Partial<IUser>;

        if (Object.keys(user).length > 0 && user._id) {
            try {
                const updatedUser = await UserRepository.update(user._id, user);

                if (!updatedUser) {
                    return res.status(400).send('User not found');
                }

                return res.json({ user: updatedUser });
            } catch (err) {
                return res.status(400).send(err);
            }
        }

        return res.status(400).send('_id parameter missing');
    }

    /**
     * Deletes a specific user by ID.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const deletedUser = await UserRepository.delete(id);

                return res.json(deletedUser);
            } catch (err) {
                return res.status(400).send(err);
            }
        }

        return res.status(400).send('User id not provided');
    }
}
