const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const slug = require('slugs');

const scrobbleSchema = new mongoose.Schema({
    artist: {
        type: String,
        trim: true,
        required: true,
    },
    track: {
        type: String,
        trim: true,
        required: true,
    },
    album: {
        type: String,
        trim: true,
        required: false, // Not necessary but i thought we should be explicit
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

scrobbleSchema.pre('save', function(next) {
    this.slug = slug(this.track);
    next();
});

module.exports = mongoose.model('Scrobble', scrobbleSchema);

