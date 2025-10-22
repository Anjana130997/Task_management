// Handles user registration and login
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../utils/db.js";

const SECRET_KEY = "autonomize_secret";

export const registerUser=async (req,res)=>{
    const {name,email,password}=req.body;
    await db.read();
     const exisiting=db.data.users.find(u=>u.email===email);
     if(exisiting){
        return res.status(400).json({message:"User already exisits"})

     }
     const hashed=await bcrypt.hash(password, 10);
     const newUser={
        id:Date.now().toString(),
        name,
        email,
        password:hashed
    }
    db.data.users.push(newUser);
    await db.write()
    res.status(201).json({message:"User registered successfully"});
}
export const loginUser=async (req,res)=>{
    const {email,password}=req.body;
    await db.read();
    const user=db.data.users.find(u=>u.email===email);
    if (!user){
        return res.status(400).json({message:"User not found"});

    }
    const isMatch=await bcrypt.compare(password,user.password);
    if (!isMatch){
        return res.status(401).json({message:"Invalid user"});
    }
    const token=jwt.sign({id:user.id},SECRET_KEY,{expiresIn:"1h"});
    res.json({token,user:{id:user.id,name:user.name,email:user.email}})
;}

