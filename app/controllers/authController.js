import {
    getUserById,
    registerUser,
    resetUserPassword,
    userLogin,
    verifyUserEmail,
    verifyUserOtp
} from "../services/authService.js"

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

// Profile
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