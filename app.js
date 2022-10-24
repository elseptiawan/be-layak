require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var dashboardRouter = require('./routes/dashboard');
var leavesRouter = require('./routes/leaves');
var reimbursementRouter = require('./routes/reimbursement');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/dashboard', dashboardRouter);
app.use('/leaves', leavesRouter);
app.use('/reimbursement', reimbursementRouter);

module.exports = app;
