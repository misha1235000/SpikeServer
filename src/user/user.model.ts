import { model, Document, Schema } from 'mongoose';
import { IUser } from './user.interface';

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
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

export const UserModel = model<IUser & Document>('User', UserSchema);
