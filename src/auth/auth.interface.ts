import { Document } from 'mongoose';

export interface IAuth extends Document {
    value: string;
    userId: string;
    expire: Date;
}
