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