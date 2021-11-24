var db = require('../config/connection')
var collection = require('../config/collections');

module.exports = {
    getAllCurrentMovies: () => {
        return new Promise(async(resolve, reject) => {
            var movies = await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(movies)
        })
    },
}