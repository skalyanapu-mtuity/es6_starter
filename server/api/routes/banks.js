/**
 * Created by sai on 5/6/17.
 */

import express from 'express';
import Bank from '../models/bank.js';
import Auth from '../middlewares/authorization.js';

let routerInstance = express.Router();

module.exports = (app) => {

    let bank = new Bank();

    routerInstance.get('/accounts',Auth.isAdministrator, bank.findAllAccounts);

    routerInstance.get('/account/:id', bank.findAccountById);

    routerInstance.post('/newaccount', Auth.isAdministrator, bank.createAccount);

    routerInstance.put('/account/:id', Auth.isAdministrator,bank.updateAccount);

    routerInstance.delete('/account/:id',Auth.isAdministrator, bank.deleteAccount);

    routerInstance.post('/account/transfer-funds',Auth.hasAuthorization,bank.fundsTransfer);

    app.use('/bank',routerInstance);

};
