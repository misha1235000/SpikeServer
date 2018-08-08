import * as mongoose from 'mongoose';

mongoose.connect('mongodb://testuser:Test123@ds227171.mlab.com:27171/testjwt');

export const db = mongoose;