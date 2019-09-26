const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');

const app = express();
//const Users = require("./services/models/Users");
//const Blocks = require("./services/models/Blocks");
const keys = require('./services/config/keys');
const BlocksRouter = require("./services/routes/BlocksRouter");
const ProjectsRouter = require("./services/routes/ProjectsRouter");
const GenerateProjectRouter = require("./services/routes/GenerateProjectRouter");

const authRoutes = require('./services/routes/auth-routes');
const passportSetup = require('./services/config/passport-setup');


app.set('view engine', 'ejs');

const authCheck = (req, res, next) => {
	if(!req.user){
		res.redirect('/');
	} else {
		next();
	}
};

//set up session cookies
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [keys.session.cookieKey]
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

app.use('/blocks', authCheck, BlocksRouter);
app.use('/projects', authCheck, ProjectsRouter);
app.use('/generateProject', authCheck, GenerateProjectRouter);
//app.use('/projects', ProjectsRouter);


//create index route
app.get('/', (req, res) => {
	res.render('index', { user: req.user });
});//create home route

app.get('/home', authCheck, (req, res) => {
	res.render('home', { user: req.user });
});

app.use(express.static(__dirname));

app.listen(4000, function() {
	console.log("Listening to port 4000")
});
