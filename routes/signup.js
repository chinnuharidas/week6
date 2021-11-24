var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');


router.use((req, res, next) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

router.get('/', async (req, res, next) => {
    let userSignUpErr = req.session.userSignUpErr;
    req.session.userSignUpErr = null;
    res.render('signup', { userSignUpErr , title: 'Sign Up'})
});

router.post('/', async (req, res, next) => {
    userHelpers.doSignUp(req.body).then((response) => {
        if (response.status) {
            req.session.userSignupSuccess = 'User account created. Please login.'
            res.redirect('/login')
        } else {
            req.session.userSignUpErr = response.errorMsg
            res.redirect('/signup')
        }
    })
});

module.exports = router;