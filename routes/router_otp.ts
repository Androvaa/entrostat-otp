import * as express from "express";
import { ParsedQs } from "qs";
import OTPGenerator from "../helpers/otpGenerator";

let router = express.Router();

router.get('/', (req, res) => {
    console.log('CONNECTED')
    const user: string | ParsedQs | string[] | ParsedQs[] | undefined = req.query.email;
    if (!user)
        res.status(400)
            .json({
                error: 'User email address not found',
                success: true
            })

    const newOTP = new OTPGenerator(req.query.email as string)
    if (newOTP.error)
        res.json({
            success: false,
            error: 'Error generating new OTP. Please try again.'
        })
    res.json({
        OTP: newOTP.otp,
        expirationTime: newOTP.expirationTime,
        user: req.query.email,
    })
})

export default router;