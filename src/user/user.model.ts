import { model, Document } from 'mongoose'; 
import * as mongoose from 'mongoose';
import { IUser } from './user.interface';
const UserSchema = new mongoose.Schema({  
  name: String,
  hostname: String,
  callback: String,
  password: String
});
mongoose.model('User', UserSchema);

export const UserModel = model<IUser & Document>('User', UserSchema);