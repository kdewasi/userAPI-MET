const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: String,
  password: String,
  favourites: [String],
  history: [String]
});

let User;

module.exports.connect = function() {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        User = mongoose.model('users', userSchema);
        resolve();
      })
      .catch(err => reject(err));
  });
};

module.exports.registerUser = function(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password === "") {
      reject("Error: Password cannot be empty");
    } else {
      bcrypt.hash(userData.password, 10).then(hash => {
        userData.password = hash;
        let newUser = new User(userData);
        newUser.save().then(() => resolve("User registered successfully"))
          .catch(err => reject("Error: " + err));
      }).catch(err => reject("Error: " + err));
    }
  });
};

module.exports.checkUser = function(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then(user => {
        if (!user) {
          reject("Unable to find user: " + userData.userName);
        } else {
          bcrypt.compare(userData.password, user.password).then(isMatch => {
            if (isMatch) {
              resolve(user);
            } else {
              reject("Incorrect Password");
            }
          });
        }
      })
      .catch(err => reject("Error: " + err));
  });
};

module.exports.getFavourites = function(userId) {
  return User.findById(userId).then(user => user.favourites);
};

module.exports.addFavourite = function(userId, favouriteId) {
  return User.findByIdAndUpdate(userId, { $addToSet: { favourites: favouriteId } }, { new: true }).then(user => user.favourites);
};

module.exports.removeFavourite = function(userId, favouriteId) {
  return User.findByIdAndUpdate(userId, { $pull: { favourites: favouriteId } }, { new: true }).then(user => user.favourites);
};

module.exports.getHistory = function(userId) {
  return User.findById(userId).then(user => user.history);
};

module.exports.addHistory = function(userId, historyId) {
  return User.findByIdAndUpdate(userId, { $addToSet: { history: historyId } }, { new: true }).then(user => user.history);
};

module.exports.removeHistory = function(userId, historyId) {
  return User.findByIdAndUpdate(userId, { $pull: { history: historyId } }, { new: true }).then(user => user.history);
};
