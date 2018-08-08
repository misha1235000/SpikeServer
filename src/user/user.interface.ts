export class User {
    _id: string;
    name: string;
    hostname: string;
    callback: string;
    password: string;

    constructor(_id: string, name: string, hostname: string, callback: string, password: string) {
        this._id = _id;
        this.name = name;
        this.hostname = hostname;
        this.callback = callback;
        this.password = password;
    }
};