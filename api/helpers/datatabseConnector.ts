import mongoose from "mongoose";
import OTP from "./schemas/otp.schema";
import User from "./schemas/user.schema";
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
                user: otp.user,
                otp: otp.otp,
                requests: otp.requests,
                expirationDate: otp.expirationTime,
                valid: true,
                resendRequests: 0,
                newOTPRequests: 0,
            });

            newOTP.save()
                .then((doc: any) => {
                    User.updateOne({email: newOTP.user}, {activeOTP: doc._id}, (error: any, userDoc: any) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        } else {
                            resolve(doc);
                        }
                    })
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