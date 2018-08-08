import * as mongoose from 'mongoose'; 
const UserSchema = new mongoose.Schema({  
  name: String,
  hostname: String,
  callback: String,
  password: String
});
mongoose.model('User', UserSchema);

export const UserModel = mongoose.model('User');