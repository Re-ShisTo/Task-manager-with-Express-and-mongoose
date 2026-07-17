### JWT Authentication Encode Decode with Task Manager Back End Project

- **Initial Folder Structure:**

   ![](./assets/folder.png)
- **Set up `index.js`**:

```js
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
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
})
app.use(limiter);

// Web cache
app.set("etag", false);

// MongoDB connection

// API Routes
app.use("/api", router)

app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
})
```

- **In `token.js` For Encoding:** 

```js
import jwt from "jsonwebtoken";

export const EncodeToken = (user_id, email)=>{
    const KEY = "ABCDEFG123456";
    const EXPIRE = {expiresIn: "24h"}
    const payload = {"email": email , "user_id": user_id};
    return jwt.sign(payload, KEY, EXPIRE);
}

//plain text -> (plain text + Publi Key + algorithm) --> Cipher Text
```
 
- **For Decoding:**

```js
//Cipher Text -> (Cipher Text - Private Key - algorithm) --> Plain Text
export const DecodeToken = (token)=>{
    try {
        const KEY = "ABCDEFG123456";
        let result =  jwt.verify(token, KEY);
        return result.email;
    }catch (e) {
        console.log(e.message);
    }
}
```

- **Setup mongoose connection in `index.js`:**

```js
mongoose.connect("mongodb://db_username:db-password@localhost:27017/", {autoIndex: true})
        .then(()=>{
          console.log("MongoDB Connected Successfully");
        })
        .catch((e)=>{
          console.error("MongoDB Connection Failed", e);
        })
```

- **In `userModel.js` define the schema and create the model:**

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {type: String, required: true, trim: true},
        lastName: {type: String, required: true, trim: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        password: {type: String, required: true},
        mobile: {type: String, required: true, unique: true, trim: true},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const user = mongoose.model("user", userSchema);

export default user;
```

- **In `authService.js` create a service for authenticating registration and login:**

```js
import user from "../models/userModel.js"
import { EncodeToken, DecodeToken } from "../config/token.js"
import bcrypt from "bcryptjs"

export async function registerUser({firstName, lastName, email, password, mobile}){
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMobile = mobile.trim();

    const existingUser = await user.findOne({
        $or: [
            {email: normalizedEmail},
            {mobile: normalizedMobile}
        ]
    })

    if(existingUser){
        throw new Error("A User with that email and mobile number already exists")
    }

    try{
        const passwordHash = await bcrypt.hash(password, 10)
        await user.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: passwordHash,
            mobile: normalizedMobile
        })
        return {message: "User Created Successfully"}
    }catch(e){
        throw new Error("Error Creating User:" + e.message)
    }
}

export async function userLogin({email, password}){
    const normalizedEmail = email.toLowerCase().trim();

    const users = await user.findOne(
        {email: normalizedEmail}
    )
    if(!users) {
        throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, users.password);
    if(!isPasswordValid){
        throw new Error("Invalid Password or Email");
    }

    const token = await EncodeToken(users._id, users.email);
    return {token}
}
```

- **In `authController.js` create a controller for authenticating registration and login:**

```js
import { registerUser, userLogin } from "../services/authService.js"

// Register
export const register = async(req, res)=>{
    const {firstName, lastName, email, password, mobile} = req.body;
    try{
        const result =await registerUser({firstName, lastName, email, password, mobile});
        res.status(200).json(result)
    }catch(e){
        res.status(500).json({error: e.message})
    }
}

// Login
export const login = async(req, res)=>{
    const {email, password} = req.body;
    try{
        const result =await userLogin({email, password});
        res.status(200).json(result)
    }catch(e){
        res.status(500).json({error: e.message})
    }
}
```

- **In `api.js` setup Routes:**

```js
import express from "express";
const router = express.Router()
import * as authController from "../app/controllers/authController.js"

// Auth Public Routes
router.post("/register", authController.register)
router.post("/login", authController.login)

export default router
```

- **Create a middleware for accessing user data using decoded token :*

```js
import {DecodeToken} from "../config/token.js";

export default (req, res, next)=>{
    let token = req.headers["authorization"];
    if(!token){
        return res.status(401).json({error: "Unauthorized"})
    }

    let decodedToken = DecodeToken(token);
    if(!decodedToken){
        return res.status(401).json({error: "Unauthorized"})
    }
    else{
        req.email = decodedToken.email;
        req.user_Id = decodedToken.user_id;
        next();
    }
}
```

- **In `authController.js` create a controller for getting user profile:**

```js
export const getProfile  = async (req, res)=>{
  const user_Id = req.user_Id;
  console.log(user_Id)
  try{
    const result = await getUserById(user_Id);
    res.status(200).json(result)
  }catch(e){
    res.status(500).json({error: e.message})
  }
}
```

- **In `authService` create service for getting user by the ID:**

```js
export async function getUserById(user_Id){
  const users = await user.findById(user_Id).select("-password");
  if(!users){
    throw new Error("User not found")
  }
  return users;
}
```

- **In `api.js` add route for getting user profile with the necessary middleware:**

```js
//Auth Protected Routes
import authMiddleware from "../app/middlewares/authMiddleware.js"
router.get("/profile", authMiddleware, authController.getProfile)
```

- **In `taskModel.js` define a schema and create a model:**

```js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        status: {
            type: String,
            trim: true,
            required: true,
            enum: ["New", "In Progress", "Completed", "Cancelled"]
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
)

const tasks = mongoose.model("task", taskSchema)

export default tasks
```

- **In `taskService.js` create a service for creating, updating, deleting, and getting tasks:**

```js
import tasks from "../models/taskModel.js";

export async function createTaskService({user_Id, title, description, status}){
 try{
     const cTask = await tasks.create({
         user_Id,
         title: title,
         description: description,
         status: status
     })
     return cTask;
 }   catch (e) {
     throw new Error("Error Creating Task:" + e.message)
 }
}

//update task
export async function updateTaskService({task_id, title, description, status}){
    try{
        const uTask = await tasks.findByIdAndUpdate(
            task_id,
            {
                title: title.trim(),
                description: description.trim(),
                status: status.trim()
            },
            {new: true}
        );
        if(!uTask){
            throw new Error("Task not found");
        }
        return uTask;
    }   catch (e) {
        throw new Error("Error Updating Task:" + e.message)
    }
}

//delete task
export async function deleteTaskService(task_id){
    try{
        const dTask = await tasks.findByIdAndDelete(task_id);
        if(!dTask){
            throw new Error("Task not found");
        }
        return {message: "Task Deleted Successfully"};
    }   catch (e) {
        throw new Error("Error Deleting Task:" + e.message)
    }
}

//get task
export async function getTaskByUserIdService(user_Id){
    try{
        const gTask = await tasks.find({user_Id});
        if(!gTask){
            throw new Error("Task not found");
        }
        return gTask;
    }catch (e) {
        throw new Error("Error Fetching Task" + e.message);
    }
}
```

- **In `taskController.js` create controllers for creating, updating, deleting, and getting tasks:**

```js
//create task
import {
    createTaskService,
    deleteTaskService,
    getTaskByUserIdService,
    updateTaskService
} from "../services/taskService.js";

export const createTask = async(req, res)=>{
    const {title, description, status} = req.body;
    const user_Id = req.user_Id;
    try{
        const task = await createTaskService({user_Id, title, description, status})
        res.status(201).json(task);
    }catch (e) {
        res.status(400).json({error: e.message});
    }
}

//update task
export const updateTask = async(req, res)=>{
const {title, description, status} = req.body;
const task_id = req.params["task_id"];
try{
    const task = await updateTaskService({task_id, title, description, status})
    res.status(201).json(task);
}catch (e) {
    res.status(400).json({error: e.message});
}
}

// delete task
export const deleteTask = async(req, res)=>{
const task_id = req.params["task_id"];
try{
    const task = await deleteTaskService(task_id)
    res.status(200).json(task);
}catch (e) {
    res.status(400).json({error: e.message});
}
}

//get task
export const getTask = async(req, res)=>{
    const user_Id = req.user_Id;
    try{
        const task = await getTaskByUserIdService(user_Id)
        res.status(200).json(task);
    }catch (e) {
        res.status(400).json({error: e.message});
    }
}
```

- **In `api.js` add routes for creating, updating, deleting, and getting tasks:**

```js
import * as taskController from "../app/controllers/taskController.js"
router.get("/tasks/:user_Id", authMiddleware, taskController.getTask)
router.post("/tasks", authMiddleware, taskController.createTask)
router.put("/tasks/:task_id", authMiddleware, taskController.updateTask)
router.delete("/tasks/:task_id", authMiddleware, taskController.deleteTask)
```

- **In `sendEmail.js` create a transporter using nodemailer to send an email**

```js
import nodemailer from "nodemailer";

export const sendEmail = async(email, subject, message)=>{
    //transporter
    const transporter = nodemailer.createTransport({
        host: 'hostEmail',
        port: port,
        auth: {
            user: 'userName',
            pass: 'passwrod'
        }
    });

    // Mail options
    const mailOption = {
        from: "email",
        to: email,
        subject: subject,
        text: message
    }

    // Send mail
    try{
        await transporter.sendMail(mailOption)
        console.log("Email sent successfully")
    }catch(e){
        console.error("Error sending mail:", e)
    }
}
```

- **In `authController.js` add controllers for user verify email, verify OTP, and reset password:**

```js
// verify email address
export const verifyEmail = async(req, res)=>{
  const {email} = req.body;
  try{
    const result = await verifyUserEmail({email});
    res.status(200).json(result)
  }catch (e) {
    res.status(500).json({error: e.message})
  }
}

// verify OTP
export const verifyOtp = async(req, res)=>{
  const {email, otp} = req.body;
  try{
    const result = await verifyUserOtp({email, otp})
    res.status(200).json(result)
  }catch (e) {
    res.status(500).json({error: e.message})
  }
}

// reset password
export const resetPassword = async(req, res)=>{
  const {email, otp, password} = req.body;
  try{
    const result = await resetUserPassword({email, otp, password})
    res.status(200).json(result)
  }catch(e){
    res.status(500).json({error: e.message})
  }
}
```

- **In `authService.js` add services for user verify email, verify OTP, and reset password:**

```js
// Verify User Email
export async function verifyUserEmail({email}){
  const normalizedEmail= email.toLowerCase().trim();
  const result = await user.findOne({email: normalizedEmail});
  if(!result){
    throw new Error("User not found")
  }
  // Generate OTP code
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  await user.updateOne({email: normalizedEmail}, {otp: OTP});
  // Send the OTP to the user's email
  await sendEmail(normalizedEmail, "OTP", `Your OTP code is: ${OTP}`)
  return {message: `OTP sent to your email: ${OTP}`}
}

// Verify User OTP
export async function verifyUserOtp({email, otp}){
  const normalizedEmail = email.toLowerCase().trim();
  const result = await user.findOne({email: normalizedEmail});
  if(!result){
    throw new Error("User not found")
  }
  if(result.otp !== otp){
    throw new Error("Invalid OTP")
  }
  return {message: "OTP verified successfully"}
}

//Reset User Password
export async function resetUserPassword({email, otp, password}){
  const normalizedEmail = email.toLowerCase().trim();
  const result = await user.findOne({email: normalizedEmail});
  if(!result){
    throw new Error("User not found")
  }
  console.log(result.otp)
  if(result.otp !== otp){
    throw new Error("Invalid OTP")
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await user.updateOne({email: normalizedEmail}, {password: passwordHash, otp: "0"})
  return {message: "Password reset successfully"}
}
```

- **In `api.js` add routes for user verify email, verify OTP, and reset password:**

```js
// Auth Public Routes
router.post("/verify-email", authController.verifyEmail)
router.post("/verify-otp", authController.verifyOtp)
router.post("/reset-password", authController.resetPassword)
```



### [Postman Documentation](https://documenter.getpostman.com/view/55081419/2sBY4PMzEY)