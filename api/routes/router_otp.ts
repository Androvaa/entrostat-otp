import * as express from "express";
import { ParsedQs } from "qs";
import mongoose from "mongoose";

import OTP from "../helpers/schemas/otp.schema"
import User from "../helpers/schemas/user.schema";
import OTPGenerator from "../helpers/otpGenerator";
import DatabaseChecks from "../helpers/databaseChecks";
import Database from "../helpers/datatabseConnector";

let router = express.Router();

router.get('/new', (req, res) => {
    const user: string | ParsedQs | string[] | ParsedQs[] | undefined = req.query.email;
    let newOTP: OTPGenerator | string;

    if (!user) {
        res.status(400)
            .json({
                error: 'User email address not found',
                success: true
            })
    }

    const activeOTP: { error: string } | { doc: any } = DatabaseChecks.doesUserHaveActiveOTP(user as string);
    // Check if user has OTP
    if ("error" in activeOTP) {
        res.json({
            success: false,
            error: activeOTP.error
        })
    } else {
        if (!activeOTP.doc) {
            // Generate new OTP but ensure it is unique else regemerate a new one
            generateNewOTPIfExists(new OTPGenerator(user as string), user as string)
                .then((newOTP) => {
                    User.findOne({ email: req.query.email }, (error: any, doc: any) => {
                        if (error) {
                            res.json({
                                success: false,
                                error: error
                            })
                        } else if (!doc) {
                            const newUser = new User({
                                email: req.query.email as string,
                                newRequests: 1,
                                active: true,
                                latestOTPRequest: new Date(),
                                resendRequests: 0,
                                activeOTP: newOTP._id as mongoose.Types.ObjectId
                            })
                            newUser.save()
                                .then((doc: any) => {

                                    res.json({
                                        success: true,
                                        otp: newOTP.otp,
                                        expirationTime: newOTP.expirationTime
                                    })
                                })
                                .catch((error: any) => {
                                    console.error(error);
                                    res.json({
                                        success: false,
                                        error: error
                                    })
                                })
                        } else {
                            User.findOneAndUpdate({ email: req.query.email }, { newRequests: doc.newRequests + 1, latestOTPRequest: new Date() }, (error: any, doc: any) => {
                                if (error) {
                                    console.error(error);
                                    res.json({
                                        success: false,
                                        error: error
                                    })
                                } else {
                                    //Check if they're still within request time limit
                                    if (new Date().getTime() - new Date(doc.latestOTPRequest).getTime() <= 3600000) {
                                        //Check if they're still within request limit
                                        if (doc.newRequests >= newOTP.maxRequestsPerHour) {
                                            res.json({
                                                success: true,
                                                error: 'Too many OTP requests. Please wait before trying again.'
                                            })
                                        } else {
                                            User.findOneAndUpdate({ email: req.query.email as string }, { activeOTP: newOTP._id, newRequests: 0, latestOTPRequest: new Date() }, (error: any, userDoc: any) => {
                                                if (error) {
                                                    console.error(error);
                                                    res.json({
                                                        success: false,
                                                        error: error
                                                    })
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        otp: newOTP.otp,
                                                        expirationTime: newOTP.expirationTime
                                                    })
                                                }
                                            })

                                        }
                                    } else {
                                        User.findOneAndUpdate({ email: req.query.email as string }, { activeOTP: newOTP._id, newRequests: 1, latestOTPRequest: new Date() }, (error: any, userDoc: any) => {
                                            if (error) {
                                                console.error(error);
                                                res.json({
                                                    success: false,
                                                    error: error
                                                })
                                            } else {
                                                res.json({
                                                    success: true,
                                                    otp: newOTP.otp,
                                                    expirationTime: newOTP.expirationTime
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                })

        }
        else {
            res.json({
                success: true
            })
        }
    }
})

router.post('/resend', (req, res) => {
    let user = req.body.email;
    let newOTP = new OTPGenerator(user);

    if (!user)
        res.status(400)
            .json({
                success: true,
                error: 'User email address not found'
            });

    User.findOne({ user: user }, (userError: any, userDoc: any) => {
        if (userError) {
            console.error(userError);
            res.json({
                success: false,
                error: userError
            })
        }

        OTP.findOne({ _id: userDoc.activeOTP }, (error: any, doc: any) => {
            if (error) {
                console.error(error);
                res.json({
                    success: false,
                    error: error
                })
            }

            if ((new Date().getTime() - new Date(doc.generatedDate).getTime()) <= newOTP.resendRequestLimit) {
                if (userDoc.resendOTPRequests)
                    OTP.updateOne({ _id: userDoc.activeOTP }, { expirationDate: new Date().getTime() + 86400000, resendRequests: doc.resendRequests + 1 }, (updateError: any, updateDoc: any) => {
                        if (updateError) {
                            console.error(updateError);
                            res.json({
                                success: false,
                                error: updateError
                            })
                        }
                        User.updateOne({ user: user }, { resentOTPRequests: userDoc.resendRequests + 1 }, (userUpdateError: any, userUpdateDoc: any) => {
                            if (error) {
                                console.error(error);
                                res.json({
                                    success: error,
                                    error: error
                                })
                            }
                            res.json({
                                success: true,
                                otp: doc.otp,
                                expirationTime: doc.expirationTime
                            })
                        })
                    })
            } else {
                res.json({
                    success: true,
                    message: "Please request a new OTP."
                })
            }
        })
    })
})

router.post('/send', (req, res) => {
    let otp = req.body.otp;
    let user = req.body.user;

    if (!user)
        res.status(400)
            .json({
                success: true,
                error: "No user email found"
            })
    if (!otp)
        res.status(400)
            .json({
                success: true,
                error: "No OTP found"
            })

    OTP.findOne({otp: otp, user: user, valid: true}, (error: any, doc: any) => {
        if (error) {
            console.error(error);
            res.json({
                success: false,
                error: error
            })
        } else if (!doc) {
            res.json({
                success: true,
                message: "OTP not found"
            })
        } else {
            OTP.updateOne({otp: otp, user: user}, {valid: false}, (otpError: any, otpDoc: any) => {
                if (error) {
                    console.error(error);
                    res.json({
                        success: false,
                        error: error
                    })
                }
                res.json({
                    success: true,
                    message: "OTP successfully used"
                })
            })
        }
    })
})

function generateNewOTPIfExists(otp: OTPGenerator, user: string): Promise<OTPGenerator> {
    return new Promise((resolve, reject) => {
        DatabaseChecks.doesOTPExist(otp.otp)
            .then((existsCheck) => {
                if (existsCheck) {
                    let newOTP: OTPGenerator = new OTPGenerator(user);
                    resolve(generateNewOTPIfExists(newOTP, user));
                } else {
                    const database = new Database;
                    database.addNewOTP(otp)
                        .then((doc) => {
                            resolve(otp);
                        })
                        .catch((error) => {
                            reject(error)
                        })

                }
            })
    })


}

export default router;