// Protects private routes by checking JWT token
import jwt from "jsonwebtoken";
const SECRET_KEY="autonomize_secret";

export const authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message:"No token provided"});
    } //no token is given
    const token =authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token,SECRET_KEY);
        req.userId=decoded.id;
        next(); //goes to next middleware if everything is fine
    }catch(err){
        res.status(403).json({message:"Invalid or expired token"})
    }// error if the token is invalid
};