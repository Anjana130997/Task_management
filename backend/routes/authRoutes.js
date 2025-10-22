import express from ("express");
import { registerUser,loginUser } from "../controllers/authController";

const router=express.Router(); //Instantiates the router
router.post("/register",registerUser);
router.post("/login",loginUser);
export default router;