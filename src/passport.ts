const passport = require('passport');
const {
    Strategy,
} = require('passport-shraga');

const users: any[] = [];

passport.serializeUser((user: any, cb: any) => {
    cb(null, user.id);
});

passport.deserializeUser((id: any, cb: any) => {
    const user = users.filter(user => user.id === id).length > 0 ? users.filter(user => user.id === id)[0] : {};
    cb(null, user);
});

export const configurePassport = () => {
    passport.use(new Strategy({}, (profile: any, done: any) => {
  //      let length = users.filter(user => user.id === id).length;
  //      if (length === 0)
        users.push(profile);
        done(null, profile);
    }));
};
