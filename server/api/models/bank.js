/**
 * Created by sai on 5/6/17.
 */



/**
 * @NOTE :: Model Schema definition for Banking functionality
 * and its respective helper methods
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './user.js';


//import Joi  from 'joi';
let UserInstance = new User.User();
let UserModel = new User.Model();
const bankSchema = new mongoose.Schema({
    /**
     * 'email' attribute will be 'userName' of the username
     * the same would be refecleted while authentication process also !!
     */
    accountNumber:{
        type: Number,
        required:true
    },
    email:{
        type:String,
        required: true
    },
    preferredCurrency :{
        type: Object,
        required:true
    },
    currentBalance:{
        type:Number,
        default:100  /** Joining bonus 100 bucks for every user **/
    },
    transactionHistory:{
        type:Object
    }
});

let model = mongoose.model('Bank', bankSchema);

/**
*  For better "Encapsulation" detaching below fucntion
*  from shared scope of the "Bank" class.
*/

async function getCurrentBalance(userId,accountNumber,amountToTransfer,callback) {
    /**
    *  Below 'm' variable was initiated to User Model not used later !!!
    */
     var m = UserModel.userModel();
    await model.findOne({userId:userId}, function(err,user) {
        if (err || !user) return callback(false);
        var balanceCheck = user.currentBalance > amountToTransfer ? true : false;
        return callback(null,balanceCheck);
    });

}

export default class Bank {
    /**
     * @NOTE :: Helper methods
     * @param req
     * @param res
     */
    findAllAccounts(req, res) {
        model.find({}, (err, todos) => {
            if (err) {
                res.sendStatus(403);
            } else {
                res.json(todos);
            }
        });
    }

    fundsTransfer(req, res) {
        //console.log(req.headers);
       
    if (!req.body.accountNumber || !req.body.amount) {
        return res.json({
            "transferStatus": false,
            "message": "Both accountNumber and amount are required!"
        });
    }

    if(!req.header('authorization')) return res.status(402).send("Not Authorised!!");
    // Fethching user details 
    var userDetails = UserInstance.currentLoggedUser(req.header('authorization'));

    if(!userDetails) return res.status(402).send("Not allowed to perform this action!!");

    getCurrentBalance(userDetails._id,req.body.accountNumber,req.body.amount,function(err,balance){
       if(err) return res.status(402).send("Unable to check current account balance!!");
       if(!balance) return res.status(402).send("Insufficent Funds !!");

    /*
    * Using mongoDB $inc operator to increament the user balance 
    */
    model.update({
            accountNumber: req.body.accountNumber
        }, {
            $inc: {
                currentBalance: req.body.amount
            }
        })
        .then(function(transaction) {
            if (!transaction) {
                return res.status(400).send({
                    "transferStatus": false,
                    "message": "Internal DB error !!"
                });
            }
            return model.findOne({
                accountNumber: req.body.accountNumber
            });
        })
        .then(function(details) {
            if (!details) {
                return res.status(200).send({
                    "transferStatus": true,
                    "message": "Unable to fetch details back!!"
                });
            }
            return res.status(200).send({
                "transferStatusd": true,
                "currentBalance": details.currentBalance
            });
        })
        .catch(function(err) {
            res.status(400).send({
                "transferStatus": false,
                "message": "Internal server error!!"
            });
        });

    });

    

}
    findAccountById(req, res) {
        model.findById(req.params.id, (err, todo) => {
            if (err || !todo) {
                res.sendStatus(403);
            } else {
                res.json(todo);
            }
        });
    }

    createAccount(req, res) {
        /**
        * Not handling attribute validations as of now ,
        * it was mandatory in real time projects espeacially for production instance !
        */
        if(!req.body.email || !req.body.accountNumber || !req.body.preferredCurrency){
            return res.status(400).send({"message":"Required fields are missing"});
        }
        var createObj = { 
                email: req.body.email,
                accountNumber:req.body.accountNumber,
                password:req.body.password,
                preferredCurrency: req.body.preferredCurrency
            }

        model.create(createObj)
        .then(function(account){
            if(!account){
                res.status(400).send({"message":"Internal server error!!"});
            }
            return res.json(account);
        })
        .catch(function(){
           res.status(400).send({"message":"Unable to create account!!"});
        });
    }

    updateAccount(req, res) {
        model.update({
            _id: req.params.id
        }, {
            description: req.body.description
        }, (err, todo) => {
            if (err || !todo) {
                res.status(500).send(err.message);
            } else {
                res.json(todo);
            }
        });
    }

    deleteAccount(req, res) {
        model.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.sendStatus(200);
            }
        })
    }
}


