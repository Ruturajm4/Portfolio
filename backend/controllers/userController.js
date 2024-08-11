import { v2 as cloudinary } from "cloudinary";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middleware/error.js";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"


//REGISTER USER
export const register = catchAsyncErrors(async (req, res, next) => {
  //IF USER NOT UPLOADS AVATAR & RESUME
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar Required!", 400));
  }

  //GET FILES AVATAR/RESUME
  const { avatar, resume } = req.files;

  //STORE AVATAR
  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "PORTFOLIO AVATAR" } //FOLDER NAME AS PORTFOLIO AVATAR
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForAvatar.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }

  //STORE RESUME
  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "PORTFOLIO RESUME" }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForResume.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
  }

  //GET DETAILS FROM BODY
  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
  } = req.body;

  //CREATE DATA WITH DETAILS INTO THE DATABASE
  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponseForAvatar.secure_url, // Set your cloudinary secure_url here
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponseForResume.secure_url, // Set your cloudinary secure_url here
    },
  });

  //GENERATE TOKEN (USER, MESSAGE, STATUSCODE, RESPONSE)
  generateToken(user, "User Registered!!", 201, res)

});

//LOGIN 
export const login = catchAsyncErrors(async(req, res, next)=>{

  //GET EMAIL & PASSWORD
  const {email, password}=req.body

  //IF USER DON'T ENTER EMAIL/PASSWORD, THROW ERROR
  if(!email || !password){
    return next(new ErrorHandler("Email & Password are required!!"))
  }
  //FIND USER BY EMAIL AND GET USER'S PASSWORD AS WELL
  const user = await User.findOne({email}).select("+password")

  //IF USER NOT FOUND
  if(!user){
    return next(new ErrorHandler("Invalid Email Or Password!!"))
  }
  //GET PASSWORD AND COMPARE
  const isPassword = await user.comparePassword(password)

  //IF PASSWORD NOT FOUND
  if(!isPassword){
    return next(new ErrorHandler("Invalid Email Or Password!!"))
  }

  generateToken(user, "Logged In", 200, res)

})

//LOGOUT
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out!",
    });
});

//GET USER
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE PROFILE
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    portfolioURL: req.body.portfolioURL,
    facebookURL: req.body.facebookURL,
    twitterURL: req.body.twitterURL,
    linkedInURL: req.body.linkedInURL,
  };
  //IF THERE IS FILES & INSIDE FILES THERE IS AVATAR
  if (req.files && req.files.avatar) 
  {
      const avatar = req.files.avatar;  //GET AVATAR FROM FILE
      const user = await User.findById(req.user.id); //GET USER BY ID
      const profileImageId = user.avatar.public_id; //GET PUBLIC_ID OF AVATAR
      await cloudinary.uploader.destroy(profileImageId); //DELETE OLD IMAGE
      const newProfileImage = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "PORTFOLIO AVATAR",
        }
      );
      newUserData.avatar = {
        public_id: newProfileImage.public_id,
        url: newProfileImage.secure_url,
      };
  }
  //IF THERE IS FILES & INSIDE FILES THERE IS RESUME
  if (req.files && req.files.resume) 
  {
    const resume = req.files.resume; //GET RESUME
    const user = await User.findById(req.user.id); //GET USER BY ID
    const resumeFileId = user.resume.public_id; //GET PUBLIC OF RESUME
    if (resumeFileId) {
      await cloudinary.uploader.destroy(resumeFileId); //DELETE OLD RESUME 
    }
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "PORTFOLIO RESUME",
    });
    newUserData.resume = {
      public_id: newResume.public_id,
      url: newResume.secure_url,
    };
  }
  //FIND_BY_ID AND UPDATE ALL DATA
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user,
  });
});

//UPDATE PASSWORD 
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  //GET 3 THINGS FROM USER
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  //IF NOT FOUND ANY VALUE THROW ERROR
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please Fill All Fields.", 400));
  }

  //COMPARE PASSWORD WITH CURRENT
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Current Password!"));
  }

  //IF NEW_PASSWORD & CURRENT_PASSWORD DOSEN'T MATCH
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password And Confirm New Password Do Not Match!")
    );
  }
  //UPDATE
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated!",
  });
});

//GET PORTFOLIO TO USER WITHOUT LOGIN
export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "66adc632940eb93e1b9d0dda";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

//FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  //YOU'LL GET THIS MESSAGE WITH LINK
  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params; //PARAMS USED FOR DYANMIC VALUE
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & Confirm Password do not match"));
  }
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Reset Password Successfully!", 200, res);
});
