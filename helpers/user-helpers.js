var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb');

module.exports = {
    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
            var response = {}
            var user = await db.get().collection(collection.USER_COLLECTION).findOne({ email : userData.email, password : userData.password, isEnabled : true, isAdmin : {$exists : false} })
            if (user) {
                console.log("Login Success");
                response.user = user
                response.status = true
                resolve(response)
            } else {
                console.log("Login Failed : User doesnot exist");
                var emailUser = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ email : userData.email } )

                if (! emailUser){
                    return resolve({ status : false, errorMessage : "User not found"})
                }

                var passwordUser = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ email : userData.email, password : { $ne : userData.password } })

                if (passwordUser){
                    return resolve({ status : false, errorMessage : "Password incorrect"})
                }

                var disabledUser = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ email : userData.email, password : userData.password, isEnabled : false, isAdmin : {$exists : false} })

                if (disabledUser){
                    resolve({status : false, errorMessage : "Your account has been blocked"})
                }

                resolve({ status : false, errorMessage : "User not found"})
            }
        })
    },
    doSignUp: (userData) => {
        userData.createdAt = new Date();
        return new Promise(async(resolve, reject) => {
            if (userData.password != userData.confirmpassword){
                console.log("Password mismatch");
                return resolve({status : false, errorMsg: "Password Mismatch"});
            }
            var userByEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email : userData.email })
            if (userByEmail){
                console.log("Email already assigned");
                return resolve({status: false, errorMsg : 'Email already assigned to another user'})
            }
            var userByMobile = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile : userData.mobile })
            if (userByMobile){
                console.log("Mobile already assigned");
                return resolve({status: false, errorMsg : 'Mobile already assigned to another user'})
            }
            userData.isEnabled = true;
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve( { status : true, userId : data.insertedId })
            })
        })
    },
    doAdminLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
            var response = {}
            var adminuser = await db.get().collection(collection.USER_COLLECTION).findOne({ email : userData.email, password : userData.password, isAdmin : true })
            if (adminuser) {
                console.log("Login Success");
                response.adminuser = adminuser
                response.status = true
                resolve(response)
            } else {
                console.log("Login Failed : Admin User doesnot exist");
                resolve({status : false})
            }
        })
    },
    getUserList: () => {
        return new Promise((resolve, reject) => {
            var users = db.get().collection(collection.USER_COLLECTION).find({ $or : [ {isAdmin : false, isAdmin : {$exists : false} } ] }).toArray()
            resolve(users)
        })
    },
    getUserDetails: (userId) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({_id : ObjectId(userId)}).then((user) => {
                resolve(user)
            })
        })
    },
    updateUser:(userId, userData) => {
        userData.updatedAt = new Date();
        return new Promise(async (resolve, reject) => {
            var emailUser = await db.get().collection(collection.USER_COLLECTION)
            .findOne({
                _id : {$ne : ObjectId(userId)},
                email : userData.email
            });

            if (emailUser){
                return resolve({status : false, errorMsg : 'Email already assigned to another user'});
            }

            var mobileUser = await db.get().collection(collection.USER_COLLECTION)
            .findOne({
                _id : {$ne : ObjectId(userId)},
                mobile : userData.mobile
            });

            if (mobileUser){
                return resolve({status : false, errorMsg : 'Mobile number already assigned to another user'});
            }

             
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id : ObjectId(userId)}, {
                $set : {
                    firstName : userData.firstName,
                    lastName: userData.lastName,
                    mobile: userData.mobile,
                    email: userData.email
                }
            }).then(() => {
                resolve({ status : true })
            })
        })
    },
    enableUser:(userId) => {
        return new Promise(async(resolve, reject) => {
            var user = await db.get().collection(collection.USER_COLLECTION)
            .findOne( {_id : ObjectId(userId) });

            if (!user){
                return resolve({status : false, errorMsg : 'User not found'});
            }

            db.get().collection(collection.USER_COLLECTION)
            .updateOne({ _id : ObjectId(userId) }, {
                $set : {
                    isEnabled : true
                }
            }).then(() => {
                resolve({status : true})
            })
        })
    },
    disableUser:(userId) => {
        return new Promise (async(resolve, reject) => {
            var user = await db.get().collection(collection.USER_COLLECTION)
            .findOne({ _id : ObjectId(userId) });

            if (!user){
                return resolve({ status : false, errorMsg : 'User not found'});
            }

            db.get().collection(collection.USER_COLLECTION)
            .updateOne({ _id : ObjectId(userId) }, {
                $set : {
                    isEnabled : false
                }
            }).then(() => {
                resolve({status : true})
            })
        })
    },
    deleteUser:(userId) => {
        return new Promise(async(resolve, reject) => {
            var user = await db.get().collection(collection.USER_COLLECTION)
            .findOne( { _id : ObjectId(userId) });

            if (!user){
                return resolve({status : false, errorMsg : 'User not found'});
            }

            db.get().collection(collection.USER_COLLECTION)
            .deleteOne({ _id : ObjectId(userId) }).then(() => {
                resolve({status : true})
            })
        })
    }
}