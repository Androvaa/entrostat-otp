import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: String,
    newRequests: Number,
    active: Boolean,
    latestOTPRequest: Date,
    resendRequests: Number,
    activeOTP: mongoose.Types.ObjectId
},
    { timestamps: { createdAt: 'createdDate', updatedAt: 'lastUpdated' }
});
 
const User = mongoose.model('User', UserSchema, 'Users');

export default User;