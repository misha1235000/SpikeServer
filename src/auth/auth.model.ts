import { model, Document } from 'mongoose'; 
import * as mongoose from 'mongoose';
import { IAuth } from './auth.interface';
const AuthSchema = new mongoose.Schema({
  value: { type: String, unique: true, required: true },
  userId: { type: String, ref: 'User', unique: true, required: true },
  expire: { type: Date, default: Date.now, expires: 300 }
});

export const AuthModel = model<IAuth & Document>('Auth', AuthSchema);