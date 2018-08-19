// user.repository

import { UserModel } from './user.model';
import { IUser } from './user.interface';

export class UserRepository {

    /**
     * Finds a specific user by ID
     * @param id - The id of a specific user.
     */
    public static findById(id: string): Promise<IUser | null> {
        return UserModel.findOne({ _id: id }, { password: 0 }).exec();
    }

    /**
     * Finds a specific user by username.
     * @param username - The username of a specific user.
     */
    public static findByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username }).exec();
    }

    /**
     * Creates a new user.
     * @param user - The user to create.
     */
    public static create(user: IUser): Promise<IUser> {
        try {
            return UserModel.create(user);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Update an old user with a new one.
     * @param id - The id of the old user.
     * @param user - The new user.
     */
    public static update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, user, { new: true, runValidators: true }).exec();
    }

    /**
     * Deletes a user by specific ID.
     * @param id - the id of the user to delete.
     */
    public static delete(id: string): Promise<IUser | null> {
        return UserModel.findByIdAndRemove(id).exec();
    }
}
