/**
 * Created by sai on 5/6/17.
 */

import mongoose from 'mongoose';

export default (callback) => {
	/**
	*  You can change  default DB by setting ENV variable 
	*/
	/*
	* Sharing  Mlab creds as it was sandbox instance ...
	*/
    mongoose.connect(process.env.MONGODB_INSTANCE_URL || 'mongodb://sai:cogpassword@ds111262.mlab.com:11262/cs_default_db');
    console.log('Connected to DB !!');
    callback();
}

