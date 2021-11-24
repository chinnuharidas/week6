var express = require('express');
var router = express.Router();
const movieHelpers = require('../helpers/movie-helpers');

/* GET home page. */

router.get('/', async (req, res, next) => {
	var user = req.session.user;
	console.log(user)
	movieHelpers.getAllCurrentMovies().then((movies) => {
		res.render('index', { title: 'Home', movies, user })
	})
});

router.get('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/')
  })

module.exports = router;
