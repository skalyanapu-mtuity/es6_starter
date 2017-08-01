import jsonwebtoken from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import token from '../../token.js';


const hashCode = (s) => s.split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    a & a
}, 0);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Required email address !!'],
        validate: [function(email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        }, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.comparePassword = function(pwd, cb) {
    bcrypt.compare(pwd, this.password, function(err, isMatch) {
        if (err) return cb(err);
        return cb(null, isMatch);
    });
};

async function verify(userFound, password, callback) {
    await userFound.comparePassword(password, function(err, isMatch) {
        if (err) return callback(err);
        return callback(null, isMatch);
    });

}

let model = mongoose.model('User', userSchema);

class Model {

    userModel(){
        return model;
    }
}

class User {

    login(req, res) {
       if (!req.body.email || !req.body.password) {
            return res.status(400).send('Please enter valid credentials !!');
        }
        model.findOne({
                'email': req.body.email
            })
            .then(function(userFound) {
                verify(userFound, req.body.password, function(err, verify) {
                    if (err || !verify) {
                        res.status(400).send('Invalid Credentials !!');
                    }
                    let tk = jsonwebtoken.sign(userFound, token, {
                        expiresIn:600
                    });
                    res.json({
                        success: true,
                        user: userFound,
                        token: tk
                    });
                });
            })
            .catch(function(err) {
                res.status(400).send('Incorrect password');
            });
    }

    currentLoggedUser(authHeader){
       var decoded = jsonwebtoken.decode(authHeader);
       if(!decoded._doc){
        return false;
       }
       return decoded._doc;
    }

    findAll(req, res) {
     model.find({})
        .then(function(users){
            if(!users) res.sendStatus(400).send('No registered users !!');
            return res.json(users);
        })
        .catch(function(err){
           res.status(500).send('Internal DB Error!!');
        });
    }

    findById(req, res) {
        model.findById(req.params.id, {
            password: 0
        }, (err, user) => {
            if (err || !user) {
                res.sendStatus(403);
            } else {
                res.json(user);
            }
        });
    }

    create(req, res) {
        if (req.body.password) {
            var salt = bcrypt.genSaltSync(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);
        }
        model.create(req.body,
            (err, user) => {
                if (err || !user) {
                    if (err.code === 11000 || err.code === 11001) {
                        err.message = "Email " + req.body.email + " already exist";
                    }
                    res.status(500).send(err.message);
                } else {
                    let tk = jsonwebtoken.sign(user, token, {
                        expiresIn: "24h"
                    });
                    res.json({
                        success: true,
                        user: user,
                        token: tk
                    });
                }
            });
    }

    update(req, res) {
        model.update({
            _id: req.params.id
        }, req.body, (err, user) => {
            if (err || !user) {
                res.status(500).send(err.message);
            } else {
                let tk = jsonwebtoken.sign(user, token, {
                    expiresIn: "24h"
                });
                res.json({
                    success: true,
                    user: user,
                    token: tk
                });
            }
        });
    }

    delete(req, res) {
        model.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.sendStatus(200);
            }
        })
    }
}



/**
* Exporting muliple classes ...
*/
module.exports = {
  User:User,
  Model:Model
};