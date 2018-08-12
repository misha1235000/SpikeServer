import { model, Document } from 'mongoose'; 
import * as mongoose from 'mongoose';
import { IUser } from './user.interface';
const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: String
});

export const UserModel = model<IUser & Document>('User', UserSchema);