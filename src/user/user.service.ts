import { IUser } from "./user.interface";
import { UserRepository } from "./user.repository";

export class UserService {
    public static create(video: IUser): Promise<IUser> {
        return UserRepository.create(video);
    }

    public static update(id: string, video: Partial<IUser>): Promise<IUser | null> {
        return UserRepository.update(id, video);
    }

    public static findById(id: string): Promise<IUser | null> {
        return UserRepository.findById(id);
    }
 
    public static delete(id: string): Promise<IUser | null> {
        return UserRepository.delete(id);
    }
}
