const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  login: {type: String, required: true},
  artist: {type: String, required: true, unique: true},
  artist_id: {type: String, required: true, unique: true},
  albums: Array
});

module.exports = mongoose.model('artist', artistSchema);