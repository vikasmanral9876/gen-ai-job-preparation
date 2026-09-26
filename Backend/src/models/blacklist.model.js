const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to be added in blacklist"]
    }
}, {
    timestamps: true
})

// Index for rapid token blacklist verification during auth middleware checks
blacklistTokenSchema.index({ token: 1 });
// TTL index: automatically remove blacklisted tokens after 24 hours (matching JWT lifespan)
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel