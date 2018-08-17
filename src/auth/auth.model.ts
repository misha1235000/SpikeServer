import { model, Schema } from 'mongoose';
import { IAuth } from './auth.interface';

const AuthSchema = new Schema({
    value: {
        type: String,
        unique: true,
        required: true,
    },
    userId: {
        type: String,
        ref: 'User',
        unique: true,
        required: true,
    },
    expire: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
});

export const AuthModel = model<IAuth>('Auth', AuthSchema);
