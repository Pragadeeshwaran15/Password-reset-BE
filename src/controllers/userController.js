import User from '../models/userModel.js'
import ErrorHandler from "../utils/errorHandler.js"
import sendEmail from "../utils/email.js"
import sendToken from "../utils/jwt.js"
import crypto from "crypto"
const registerUser = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
    let isemail=await User.findOne({email:email})
    if(isemail){
      res.status(400).send({
        message:"Email ID already Exists"
      })
    }else{
      const user = await User.create({
        name,
        email,
        password
      });
    
      sendToken(user, 201, res);
    }
  
    
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
  }
  
  //Login User - /api/v1/login
    const loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
    
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
      }
    
      //finding the user database
      const user = await User.findOne({ email }).select("+password");
    
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
    
      if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
    
      sendToken(user, 201, res);
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
    }
  
  //Logout - /api/v1/logout
  const logoutUser = (req, res, next) => {
    try {
      res
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        message: "Loggedout",
      });
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
  };
const getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
  }


  //Forgot Password - /api/v1/password/forgot
  const forgotPassword = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHandler("User not found with this email", 404));
    }
  
    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });
    let BASE_URL = process.env.FRONTEND_URL;
    if (process.env.NODE_ENV === "production") {
      BASE_URL = `${req.protocol}://${req.get("host")}`;
    }
  
    //Create reset url
    const resetUrl = `${BASE_URL}/resetPassword/${resetToken}`;
  
    // const message = `Your password reset url is as follows \n\n
    // ${resetUrl} \n\n If you have not requested this email, then ignore it.`;
    const message = `<h1>Your password reset url is as follows</h1><br><br>
      <a href=${resetUrl}>Click here to reset your password</a>
  <br><br> <span>If you have not requested this email, then ignore it.</span>`;
  
    try {
      sendEmail({
        email: user.email,
        subject: "task password recovery",
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(error.message), 500);
    }
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
  }
  
  //Reset Password - /api/v1/password/reset/:token
  const resetPassword = async (req, res, next) => {
    try {
      const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordTokenExpire: {
        $gt: Date.now(),
      },
    });
  
    if (!user) {
      return next(new ErrorHandler("Password reset token is invalid or expired"));
    }
  
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match"));
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    sendToken(user, 201, res);
    } catch (error) {
      res.status(500).send({
        message:error.message
      })
    }
  }

  export default{
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    forgotPassword,
    getAllUsers
  }