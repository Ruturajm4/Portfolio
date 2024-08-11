import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { login, logout, register, getUser, 
    updateProfile, updatePassword, getUserForPortfolio, 
    forgotPassword, resetPassword } from "../controllers/userController.js"


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout)
router.get("/me", isAuthenticated, getUser)
router.put("/update/me", isAuthenticated, updateProfile)
router.put("/password/update", isAuthenticated, updatePassword)
router.get("/me/portfolio", getUserForPortfolio)
router.post("/password/forgot", forgotPassword)
router.put("/password/reset/:token", resetPassword)


export  default router