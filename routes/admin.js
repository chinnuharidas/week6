var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */

router.get('/', async (req, res, next) => {
    var adminuser = req.session.adminuser;
    if (adminuser) {
        res.render('admin/index', { title: 'Admin - Home', adminuser, admin: true })
    } else {
        res.redirect('admin/login');
    }
});

router.get('/login', async (req, res, next) => {
    var adminuser = req.session.adminuser;
    if (adminuser) {
        res.redirect('admin');
    } else {
        let adminLoginErr = req.session.adminLoginErr;
        req.session.adminLoginErr = null;
        res.render('admin/login', { title: 'Admin - Login', admin: true, adminLoginErr })
    }
});

router.post('/login', (req, res) => {
    userHelpers.doAdminLogin(req.body).then((response) => {
        if (response.status) {
            req.session.adminuser = response.adminuser
            req.session.adminLoggedIn = true
            res.redirect('/admin')
        } else {
            req.session.adminLoginErr = "Invalid Username or Password"
            res.redirect('/admin/login')
        }
    })
})


router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})

router.use((req, res, next) => {
    if (!req.session.adminuser) {
        res.redirect('/admin')
    } else {
        next();
    }
})

router.get('/users', (req, res, next) => {
    let successMsg = req.session.successMsg;
    req.session.successMsg = null;
    let errorMsg = req.session.errorMsg;
    req.session.errorMsg = null;
    userHelpers.getUserList().then((users) => {
        res.render('admin/user-list', { title: 'Users', admin: true, adminuser: req.session.adminuser, users , successMsg, errorMsg})
    });
})

router.get('/edit-user/:id', async (req, res) => {
    var editUser = await userHelpers.getUserDetails(req.params.id)
    res.render('admin/edit-user', { title: 'Edit User', admin: true, adminuser: req.session.adminuser, editUser })
})

router.post('/edit-user/:id', (req, res) => {
    userHelpers.updateUser(req.params.id, req.body).then((response) => {
        if (response.status){
            req.session.successMsg =  'User details updated';
        }else{
            req.session.errorMsg = response.errorMsg
        }
        res.redirect('/admin/users')
    })
})

router.get('/enable-user/:id', (req, res) => {
    userHelpers.enableUser(req.params.id).then((response) => {
        if (response.status){
            req.session.successMsg = 'User account enabled'
        }else{
            req.session.errorMsg = response.errorMsg
        }
        res.redirect('/admin/users');
    })
})

router.get('/disable-user/:id', (req, res) => {
    userHelpers.disableUser(req.params.id).then((response) => {
        if (response.status){
            req.session.successMsg = 'User account disabled'
        }else{
            req.session.errorMsg = response.errorMsg
        }
        res.redirect('/admin/users');
    })
})

router.get('/delete-user/:id', (req, res) => {
    userHelpers.deleteUser(req.params.id).then((response) => {
        if (response.status){
            req.session.successMsg = 'User account deleted'
        }else{
            req.session.errorMsg = response.errorMsg
        }
        res.redirect('/admin/users');
    })
})


module.exports = router;