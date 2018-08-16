import { Request, Response } from 'express';
import { UserValidator } from './user.validator';
import { UserRepository } from './user.repository';
import { IUser } from './user.interface';

export class UserController {
    // TODO: Need to add proper error handling when sending errors to the client
    public static async create(req: Request, res: Response) {
        const user = req.body as IUser;

        try {
            const createdUser = await UserRepository.create(user);
            return res.json({ user: createdUser });
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public static async findById(req: Request, res: Response) {
        const id = req.params.id;
        if (id) {
            const user = await UserRepository.findById(id);

            if (!user) {
                throw new Error('No User Found');
            }

            return res.json({ user });
        }

        throw new Error('Find by ID error.');
    }

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
