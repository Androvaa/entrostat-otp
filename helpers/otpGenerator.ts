import Database from "./datatabseConnector";
import mongoose from "mongoose";

export default class OTPGenerator {
    otp: string;
    length: number = 6;
    duration: number = 30000;
    requests: number = 0;
    maxRequestsPerHour: number = 3;
    lastRequested: number = 0;
    user: string;
    expirationTime: number = new Date().getTime() + this.duration;
    newRequestLimit: number = 300000;
    resendRequestLimit: number = 3;
    database: Database = new Database;
    _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();

    constructor(user: string) {
        const numbers: string = "0123456789";
        let result: string = ""
        let numbersLength: number = numbers.length;

        for (let i = 0; i < this.length; i++) {
            result += numbers.charAt(Math.floor(Math.random() * numbersLength));
        }
        this.user = user;
        this.otp = result;
    }
}