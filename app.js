import dotenv from "dotenv";
import express from 'express';
import cors from "cors";
import connectDB from "./config/connectdb.js";
import UserRoutes from "./routes/userRoutes.js"
dotenv.config();

const app = express();

// CORS Policy
app.use(cors());

// DATABASE CONNECTION
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);

// json
app.use(express.json());

// routes
app.use("/user" , UserRoutes);

const PORT = process.env.PORT;
app.listen( PORT , () => {
    console.log(` Server is running on localhost:${PORT}`);
})
