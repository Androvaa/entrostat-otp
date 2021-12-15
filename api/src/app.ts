import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import router from '../routes/router_otp'
import Database from "../helpers/datatabseConnector";

dotenv.config();

if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PWD || !process.env.DB) {
    process.exit(1);
}

const PORT: string = process.env.HOST_PORT || "8081";
const server: string = `${process.env.DB_HOST}:${process.env.DB_PORT}`;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/otp', router);

//A default route
app.get('/', (req, res) => {
  res.json({success: true});
})
//Reroute non-existing routes to our default
app.use((_, res) => res.redirect('/'));

app.listen(PORT, () => {
    const connectionTest = new Database;

    console.log(`App listening on port ${PORT}`);
    connectionTest.connect(server, process.env.DB_USER, process.env.DB_PWD, process.env.DB);
})

