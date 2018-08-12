import { Request, Response } from 'express';
import { UserValidator } from './user.validator';
import { UserRepository } from './user.repository';
import { IUser } from './user.interface';

export class UserController {
    public static async create(req: Request, res: Response) {
        const user = req.body as IUser;
        if (UserValidator.isValid(user)) {
            const createdUser = await UserRepository.create(user);
            return res.json({ user: createdUser });
        }

        throw new Error("Creation Error.");
    }

    public static async find(req: Request, res: Response) {
    }

    public static async findById(req: Request, res: Response) {
        const id = req.params.id;
        if (id) {
            const user = await UserRepository.findById(id);

            if (!user) {
                throw new Error("No User Found");
            }

            return res.json({ user });
        }

        throw new Error("Find by ID error.");
    }

    public static async update(req: Request, res: Response) {
        const id = req.params.id;
        const user = req.body as Partial<IUser>;

        if (Object.keys(user).length > 0 && id) {
            const updatedUser = await UserRepository.update(id, user);

            if (!updatedUser) {
                throw new Error("User to update not found.");
            }

            return res.json({ user: updatedUser });
        }

        throw new Error("Update user error.");
    }

    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            const deletedUser = await UserRepository.delete(id);

            if (!deletedUser) {
                throw new Error("User to delete not found.");
            }

            return res.json(deletedUser);
        }

        throw new Error("Delete user error.");
    }
}
