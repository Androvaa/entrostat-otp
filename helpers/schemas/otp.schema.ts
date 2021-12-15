import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    user: String,
    otp: String,
    requests: Number,
    expirationDate: Date,
    valid: Boolean,
    resendRequests: Number,
    newOTPRequests: Number,
    id_: Number
},
    { timestamps: { createdAt: 'generatedDate', updatedAt: 'lastRequested' }
});
 
const OTP = mongoose.model('OTP', OTPSchema, 'OTP');

export default OTP;