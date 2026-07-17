import user from "../models/userModel.js"
import { EncodeToken, DecodeToken } from "../config/token.js"
import { sendEmail } from "../config/sendEmail.js"
import bcrypt from "bcryptjs"

// Register
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

// Login
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

// Get User by ID
export async function getUserById(user_Id){
    const users = await user.findById(user_Id).select("-password");
    if(!users){
        throw new Error("User not found")
    }
    return users;
}

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