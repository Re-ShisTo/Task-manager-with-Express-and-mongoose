import express from 'express';
import router from './routes/api.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import hpp from 'hpp';
import expressValidator from 'express-validator';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

const app = express();

// middleware
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cors());
app.use(helmet());
app.use(hpp({}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
})
app.use(limiter);

// Web cache
app.set("etag", false);

// MongoDB connection
const mongodb_uri = process.env.MONGODB_URI;
mongoose.connect(mongodb_uri, {autoIndex: true})
    .then(()=>{
        console.log("MongoDB Connected Successfully");
    })
    .catch((e)=>{
        console.error("MongoDB Connection Failed", e);
    })


// API Routes
app.use("/api", router)

const port = process.env.PORT || 4000
app.listen(port, '0.0.0.0', () => {
    console.log("Server is running on port 4000");
})