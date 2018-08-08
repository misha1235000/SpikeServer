var express = require('express');
var router = express.Router();

import { UserModel } from './user.model';
import { User } from './user.interface';
import { Request, Response } from '../../node_modules/@types/express';
import { Error } from 'mongoose';

// CREATES A NEW USER
router.post('/', function (req: Request, res: Response) {
    UserModel.create({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        }, 
        function (err: Error, user: User) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req: Request, res: Response) {
    UserModel.find({}, (err: Error, users: User[]) => {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req: Request, res: Response) {
    UserModel.findById(req.params.id, (err: Error, user: User) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req: Request, res: Response) {
    UserModel.findByIdAndRemove(req.params.id, (err: Error, user: User) => {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User: "+ user.name +" was deleted.");
    });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', (req: Request, res: Response) => {
    UserModel.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err: Error, user: User) => {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
});

export const UserController = router;