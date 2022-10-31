require('dotenv').config();
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var dashboardRouter = require('./routes/dashboard');
var leavesRouter = require('./routes/leaves');
var reimbursementRouter = require('./routes/reimbursement');
var loginRouter = require('./routes/login');
var presencesRouter = require('./routes/presences');
var profilesRouter = require('./routes/profiles');

var app = express();

app.use(cors({ credentials:true, origin:'http://localhost:3000'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/dashboard', dashboardRouter);
app.use('/leaves', leavesRouter);
app.use('/reimbursement', reimbursementRouter);
app.use('/auth', loginRouter);
app.use('/presences', presencesRouter);
app.use('/profiles', profilesRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
      });
});

module.exports = app;
