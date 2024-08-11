import { User } from "../models/userSchema.js"
import { catchAsyncErrors } from "./catchAsyncError.js"
import ErrorHandler from "./error.js"
import jwt from "jsonwebtoken"

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//GET TOKEN FROM COOKIE
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User not Authenticated!", 400));
  }
//USER AUTHENTICATED VERIFY TOKEN
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
//GET USER BY ID
  req.user = await User.findById(decoded.id);
  next();
});
