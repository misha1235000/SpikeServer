// user.model

import { model, Schema } from 'mongoose';
import { IUser } from './user.interface';
import { UserValidator } from './user.validator';

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        validate: [UserValidator.isUsernameValid, 'Username isn\'t valid'],
    },
    password: {
        type: String,
        required: true,
        validate: [UserValidator.isPasswordValid, 'Password isn\'t valid'],
    },
});

// Virtual field for getting all the clients of specific team
// Used via population as described in https://mongoosejs.com/docs/populate.html#populate-virtuals
UserSchema.virtual('clients', {
    ref: 'Client',
    localField: '_id',
    foreignField: 'teamId',
    justOne: false,
    options: { sort: { name: -1 } },
});

export const UserModel = model<IUser>('User', UserSchema);
