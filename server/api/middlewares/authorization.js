import jsonwebtoken from 'jsonwebtoken';
import token from '../../token.js';

export default {

    hasAuthorization: (req, res, next) => {
        /**
     * Usually in production instnace I use standard exception handlers instead hardcoing error messages
     * as below , as of now just following below method
     */
         var authError = {
          "error": {
            "name": "Error",
            "status": 401,
            "message": "Session Expired !!",
            "statusCode": 401,
            "code": "AUTHORIZATION_REQUIRED"
          }
        };
        if (req.headers.authorization) {
            jsonwebtoken.verify(req.headers.authorization, token, (err, decoded) => {
              
              if (err) {
                    return res.status(402).send(authError);
                } else {
                    next();
                }
            });
        } else {
            return res.status(authError);
        }
    },

    isAdministrator: (req, res, next) => {
     /**
     * Usually in production instnace I use standard exception handlers instead hardcoing error messages
     * as below , as of now just following below method
     */
        var authError = {
          "error": {
            "name": "Error",
            "status": 402,
            "message": "Authorization Required",
            "statusCode": 402,
            "code": "ADMIN_PRIVILEGE_REQUIRED"
          }
        };
        if (req.headers.authorization) {
            jsonwebtoken.verify(req.headers.authorization, token, (err, decoded) => {
                if (decoded._doc && decoded._doc.isAdmin) {
                    next();
                } else {
                    return res.status(402).send(authError);
                }
            });
        } else {
            return res.status(402).send(authError);
        }
    }
};
