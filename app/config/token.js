import jwt from "jsonwebtoken";

export const EncodeToken = (user_id, email)=>{
    const KEY = "ABCDEFG123456";
    const EXPIRE = {expiresIn: "24h"}
    const payload = {"email": email , "user_id": user_id};
    return jwt.sign(payload, KEY, EXPIRE);
}

//plain text -> (plain text + Publi Key + algorithm) --> Cipher Text


// console.log(EncodeToken(1234, "me@shista.com"));

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQHNoaXN0YS5jb20iLCJ1c2VyX2lkIjoxMjM0LCJpYXQiOjE3ODQwMjM4OTUsImV4cCI6MTc4NDExMDI5NX0.TWfVZnzlAYF1KhVk9_vw6RsgFPh3u6bh-LdXXEpLJuM

//Cipher Text -> (Cipher Text - Private Key - algorithm) --> Plain Text

export const DecodeToken = (token)=>{
    const KEY = "ABCDEFG123456";
    try {
        return jwt.verify(token, KEY);
    }catch (e) {
        return null
    }
}

// console.log(DecodeToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQHNoaXN0YS5jb20iLCJ1c2VyX2lkIjoxMjM0LCJpYXQiOjE3ODQwMjM4OTUsImV4cCI6MTc4NDExMDI5NX0.TWfVZnzlAYF1KhVk9_vw6RsgFPh3u6bh-LdXXEpLJuM"))