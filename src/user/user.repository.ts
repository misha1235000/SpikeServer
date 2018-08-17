import { UserModel } from './user.model';
import { IUser } from './user.interface';

export class UserRepository {

    public static findById(id: string): Promise<IUser | null> {
        return UserModel.findOne({ _id: id }, { password: 0 }).exec();
    }

    public static findByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username }).exec();
    }

    public static create(user: IUser): Promise<IUser> {
        try {
            return UserModel.create(user);
        } catch (err) {
            throw err;
        }
    }

    public static update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, user, { new: true, runValidators: true }).exec();
    }

    public static delete(id: string): Promise<IUser | null> {
        return UserModel.findByIdAndRemove(id).exec();
    }
}
