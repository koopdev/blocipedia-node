require('dotenv').config();
const path = require('path');
const viewsFolder = path.join(__dirname, '..', 'views');
const bodyParser = require('body-parser');
const logger = require('morgan');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const passportConfig = require('./passport-config');



module.exports = {
	init(app, express) {
		app.set('views', viewsFolder);
		app.set('view engine', 'ejs');
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(express.static(path.join(__dirname, '..', 'assets')));
		app.use(expressValidator());
		app.use(cookieParser());
		app.use(
			session({
				secret: process.env.kryptoSecret,
				resave: false,
				saveUninitialized: false,
				cookie: { maxAge: 1.21e9 }, //set cookie to expire in 14 days
			}));
		app.use(flash());
		passportConfig.init(app);
		app.use((req, res, next) => {
			res.locals.currentUser = req.user;
			next();
		});
		app.use(logger('dev'));
	},
};

// We import passport-config.js and initialize it. We also update the session cookie expiration to be 14 days instead. Finally, we provide a middleware function to add a variable called currentUser that we can access it from our templates to get the user in session.
