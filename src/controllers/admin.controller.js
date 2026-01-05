const { AdminRepository, OfficialRepository } = require("../repository");
const prisma = require("../../prisma/client");

const {ApiError,ApiSuccess}= require('../utils');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var generator = require('generate-password');
const {sendMail}= require("../utils");
const {uploadOnCloudinary}= require("../utils");

async function mail(to,subject,text) {
  await sendMail({
    to: to,
    subject: subject,
    text: text,
  });
}

const adminRepo = new AdminRepository(prisma);
const officialRepo=new OfficialRepository(prisma);

async function registerAdmin(req, res, next) {
  try {
    const creatorAdmin = req.user;
    //fetch data from body
    const { email, name, position, department} = req.body;
    if (!email || !name || !position || !department) {
      throw new ApiError(400, "Invalid input data");
    }
    /// cloudinary work
    let cloudinaryResult;
    try {
      if (!req.file) {
        throw new ApiError(400, "Image file is required");
      }
      // multer saved the file locally
      const localPath = req.file.path;
      // upload to cloudinary
      cloudinaryResult = await uploadOnCloudinary(localPath);
    }catch(err){
      throw new ApiError(400,err.message);
    }
    ////password work
    var password = generator.generate({
      length: 20,
      numbers: true,
      lowercase:true,
      uppercase:true
    });

    const normalizedEmail = email.toLowerCase();
    const existingAdmin = await adminRepo.findUnique({
      email: normalizedEmail
    });
    if (existingAdmin) {
      throw new ApiError(409, "Admin with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await adminRepo.create({
      email: normalizedEmail,
      password: hashedPassword,
      name,
      position,
      department,
      photo:cloudinaryResult,
      createdById: creatorAdmin.id
    });
    delete newAdmin.password; //jate admin password response a na jay ..onek kichu bhabte hoy bhai
    try{
      mail(
        email,
        "You have been succesfully registered as ADMIN",
        `Please login with you email and your password is ${password} , Don't forget to change it after login `
      )
    }catch(error){
      console.log("Error in sending mail: "+error.message);
    }
    res.status(201).json(
      new ApiSuccess({
        message: "Admin registered successfully",
        data: newAdmin
      })
    );
  } catch (error) {
    next(error);
  }
}

async function adminSignIn(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const admin = await adminRepo.findUnique({ email: email.toLowerCase() });
    if (!admin) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }
    const payload = { id: admin.id, email: admin.email, role: "admin" };
  
    const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'7d'});

    /// cookie ta k secure korte use korchi
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    //jate admin password response a na jay ..onek kichu bhabte hoy bhai
    delete admin.password;
    res.status(200).json(
      new ApiSuccess({
        message: "Admin signed in successfully",
        data: admin
      })
    );
  } catch (error) {
    next(error);
  }
}

async function adminSignOut(req, res, next) {
  try {
    res.clearCookie('authToken');
    res.status(200).json(
      new ApiSuccess({
        message: "Admin signed out successfully"
      })
    );
  } catch (error) {
    next(error);
  } 
}

async function verifyOfficial(req, res, next) {
  try{
    const officialId = Number(req.params.officialId);
    console.log("params: ",officialId);
    const user = req.user;
    const official = await officialRepo.findUnique({id:officialId});
    if(!official){
      throw new ApiError(404,"Official not found");
    }
    if(official.isVerified){
      throw new ApiError(409,"Official is already verified");
    }
    const verifiedOfficial = await officialRepo.update({id:officialId},{isVerified:true, verifiedById:user.id});
    try{
      mail(
        official.email,
        "You have been succesfully verified as OFFICIAL",
        `Now you can login and perform your task `
      )
    }catch(error){
      console.log("Error in sending mail: "+error.message);
    }
    res.status(200).json(
      new ApiSuccess({
        message:"Official verified successfully",
        data:verifiedOfficial
      })
    );
  }catch(error){
    next(error);
  }
}
async function getOfficials(req,res,next){
  try{
    const officials = await officialRepo.findMany({
      where: {
        isVerified: false
      }
    });

    res.status(200).json(
      new ApiSuccess({
        message:"Officials retrieved successfully",
        data:officials
      })
    );
  }catch(error){
    next(error);
  }
}
async function declineOfficial(req,res,next){
  try{
    const officialId = Number(req.params.officialId);
    const official = await officialRepo.findUnique({id:officialId});
    if(!official){
      throw new ApiError(404,"Official not found");
    }
    if(official.isVerified){
      throw new ApiError(409,"Official is already verified");
    }
    const declinedOfficial = await officialRepo.delete({
      id:officialId
    });
    try{
      mail(
        official.email,
        "Sorry your application as OFFICIAL has been rejected",
        `PLease gm or send us request again or contact us at +91 696969696 if you think it is wrong`
      )
    }catch(error){
      console.log("Error in sending mail: "+error.message);
    }
    res.status(200).json(
      new ApiSuccess({
        message:"Official deleted successfully",
        data:declinedOfficial
      })
    );
  }catch(error){
    next(error);
  }
}
async function updatePassword(req, res, next) {
  try {
    const adminId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      throw new ApiError(400, "Current password and new password are required");
    }

    const admin = await adminRepo.findUnique({ id: adminId });
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const isMatch = await bcrypt.compare(current_password, admin.password);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await adminRepo.update(
      { id: adminId },
      { password: hashedPassword }
    );

    res.status(200).json(
      new ApiSuccess({
        message: "Password updated successfully",
        data: null
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { 
  registerAdmin,
  adminSignIn,
  adminSignOut,
  verifyOfficial,
  getOfficials,
  declineOfficial,
  updatePassword
};