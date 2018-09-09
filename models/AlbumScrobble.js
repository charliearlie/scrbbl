const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const slug = require('slugs');

const albumScrobbleSchema = new mongoose.Schema({
    artist: {
        type: String,
        trim: true,
        required: true,
    },
    album: {
        type: String,
        trim: true,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    slug: String,
});

albumScrobbleSchema.pre('save', function(next) {
    this.slug = slug(`${this.album}_${this.user}`);
    next();
});

module.exports = mongoose.model('AlbumScrobble', albumScrobbleSchema);

