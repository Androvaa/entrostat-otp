import mongoose from "mongoose";
import OTP from "./schemas/otp.schema";

const DatabaseChecks = {
    doesUserHaveActiveOTP(user: string): { error: string } | { doc: any } {
        OTP.find({ user: user, active: true }, (error, docs) => {
            if (error) {
                console.error(error);
                return ({ error: error });
            }

            if (!docs || docs.length < 1)
                return ({ doc: null })

            return ({ doc: docs })
        })
        return ({ doc: null })
    },

    doesOTPExist(otp: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            OTP.find({ otp: otp, valid: true }, (error, docs) => {
                if (error) {
                    console.error(error);
                    resolve(true)
                } else if (!docs || docs.length < 1) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }
}

export default DatabaseChecks;