export class IUser {
    _id: string;
    username: string;
    password: string;

    constructor(username: string, password: string, _id: string) {
        this._id = _id;
        this.username = username;
        this.password = password;
    }
};