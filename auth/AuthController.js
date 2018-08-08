// AuthController.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
const User = require('../user/User');
const jwt = require('jsonwebtoken');
const VerifyToken = require('./VerifyToken');
const bcrypt = require('bcryptjs');
const config = require('../config');

router.post('/register', (req, res) => {
    let hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    },
    (err, user) => {
        if (err) {
            return res.status(500).send("There was a problem registering the user.");
        }

        // Create a token
        let token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 60 // 24 Hours
        })

        res.status(200).send({ auth: true, token: token });
    });
});

router.get('/', VerifyToken, (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' }).redirect('/');
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }).redirect('/');
        }
        
        User.findById(decoded.id, 
        { password: 0, _id: 0, name: 0}, // projection
        (err, user) => {
            if (err) {
                return res.status(500).send("There was a problem finding the user.");
            }
            if (!user) {
                return res.status(404).send("No user found.");
            }

            next(user);
        });
    });
});

// Middleware function
router.use((user, req, res, next) => {
    res.status(200).send(user);
});

router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
          return res.status(500).send('Error on the server.');
      }
      if (!user) {
          return res.status(404).send('No user found.');
      }

      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
          return res.status(401).send({ auth: false, token: null });
      }

      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({ auth: true, token: token });
    });
});

router.get('/logout', (req, res) => {
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;