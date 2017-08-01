/**
 * Created by sai on 5/6/17.
 */

import http from 'http';
import express from 'express';
import api from './api';
import dbConfig from './dbConfiguration.js';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import methodOverride from 'method-override';

var app = express();

app.server = http.createServer(app);

app.use(express.static('./public'));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
/**
* HTTP-Method-Override to enable PUT and DELETE  HTTP verbs
* for PUT and DELETE REST Services
*/
app.use(methodOverride('X-HTTP-Method-Override'));
/**
 * Used ES6 arrow functions
 */
dbConfig(() => {
	/**
     * API Route Handler Middlerware mounting it as application level middleware.
	 */
	app.use('/api', api(app));
    /**
     * Cleaning process on receiving POSIX level signal event "SIGINT"
     */
    process.on('SIGINT', () => {
    console.log("Cleaning Process");
process.exit();
});
app.server.listen(process.env.PORT || 3000);
console.log(`Server started on port`,app.server.address().port,);
});

export default app;



