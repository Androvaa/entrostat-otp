import mongoose from "mongoose";
import OTP from "./schemas/otp.schema";
import generateId from "./generateID";
import OTPGenerator from "./otpGenerator";

class Database {
    connect(server: string | undefined, username: string | undefined, password: string | undefined, database: string | undefined) {
        mongoose.connect(`mongodb://${username}:${password}@${server}/${database}?authSource=admin`)
            .then(() => {
                console.log('Connected to DB');
            })
            .catch((error) => {
                console.error(`Error connecting to DB: ${error}`);
            })
    }

    addNewOTP(otp: OTPGenerator): Promise<any> {
        return new Promise((resolve, reject) => {
            const newOTP = new OTP({
                id: generateId(12),
                user: otp.user,
                otp: otp.otp,
                requests: otp.requests,
                expirationDate: otp.expirationTime,
                valid: true,
                resendRequests: 0,
                newOTPRequests: 0
            });

            newOTP.save()
                .then((doc: any) => {
                    resolve(doc);
                })
                .catch((error: Error) => {
                    console.error('Error saving OTP to database');
                    reject({ error: error })
                });
        });
    }

    // getOTPInfo(user: string) {

    // }
}

export default Database;