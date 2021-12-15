import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    id: String,
    user: String,
    otp: String,
    requests: Number,
    expirationDate: Date,
    valid: Boolean,
    resendRequests: Number,
    newOTPRequests: Number
},
    { timestamps: { createdAt: 'generatedDate', updatedAt: 'updatedDate' }
});
 
const OTP = mongoose.model('OTP', OTPSchema, 'OTP');

export default OTP;