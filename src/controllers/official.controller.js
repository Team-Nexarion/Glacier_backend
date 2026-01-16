const { LakeReportRepository, OfficialRepository } = require("../repository");
const prisma = require("../../prisma/client");

const axios = require("axios");

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

const lakeRepo = new LakeReportRepository(prisma);
const officialRepo=new OfficialRepository(prisma);

async function registerOfficial(req, res, next) {
  try {

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
    const existingOfficial = await officialRepo.findUnique({
      email: normalizedEmail
    });
    if (existingOfficial) {
      throw new ApiError(409, "Official with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOffcial = await officialRepo.create({
      email: normalizedEmail,
      password: hashedPassword,
      name,
      position,
      department,
      photo:cloudinaryResult,
    
    });
    delete newOffcial.password; 
    try{
      mail(
        email,
        "You have been succesfully registered as OFFICIAL",
        `Your email is ${email} and your default password is ${password} ,Please wait until Admin approves your request.Don't forget to change it after login `
      )
    }catch(error){
      console.log("Error in sending mail: "+error.message);
    }
    res.status(201).json(
      new ApiSuccess({
        message: "Official registered successfully",
        data: newOffcial
      })
    );
  } catch (error) {
    next(error);
  }
}

async function officialSignIn(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const official = await officialRepo.findUnique({ email: email.toLowerCase() });
    if (!official) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, official.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }
    if(!official.isVerified){
        throw new ApiError(401, "You have not been verified till now");
    }
    const payload = { id: official.id, email: official.email, role: "official" };
  
    const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'7d'});

    /// cookie ta k secure korte use korchi
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    
    delete official.password;
    res.status(200).json(
      new ApiSuccess({
        message: "Official signed in successfully",
        data: official
      })
    );
  } catch (error) {
    next(error);
  }
}

async function officialSignOut(req, res, next) {
  try {
    res.clearCookie('authToken');
    res.status(200).json(
      new ApiSuccess({
        message: "Official signed out successfully"
      })
    );
  } catch (error) {
    next(error);
  } 
}
async function updatePasswordOfficial(req, res, next) {
  try {
    const officialId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      throw new ApiError(400, "Current password and new password are required");
    }

    const official = await officialRepo.findUnique({ id: officialId });
    if (!official) {
      throw new ApiError(404, "Official not found");
    }

    const isMatch = await bcrypt.compare(current_password, official.password);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await officialRepo.update(
      { id: officialId },
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
async function uploadData(req, res, next) {
  try {
    const {
      lakeName,
      latitude,
      longitude,
      region,
      Lake_Area_km2,
      Dam_Slope_deg,
      Lake_Temp_C,
      Elevation_m
    } = req.body;

    // 1️⃣ Validate required fields (stop trusting users)
    if (
      !lakeName ||
      latitude === undefined ||
      longitude === undefined ||
      !region ||
      Lake_Area_km2 === undefined ||
      Dam_Slope_deg === undefined ||
      Lake_Temp_C === undefined ||
      Elevation_m === undefined
    ) {
      throw new ApiError(400, "Missing required lake details");
    }

    const officialId = req.user.id;

    // 2️⃣ Call ML backend
    const mlResponse = await axios.post(
      "https://ml-backend-1-suy7.onrender.com/predict",
      {
        Lake_Area_km2: Number(Lake_Area_km2),
        Dam_Slope_deg: Number(Dam_Slope_deg),
        Lake_Temp_C: Number(Lake_Temp_C),
        Elevation_m: Number(Elevation_m)
      },
      { timeout: 50000 }
    );

    if (mlResponse.data.status !== "success") {
      throw new ApiError(502, "Error in ML prediction service");
    }

    const { risk_level, risk_index } = mlResponse.data;

   
    const record = await lakeRepo.create({
      lakeName,
      latitude: Number(latitude),
      longitude: Number(longitude),
      region,
      Lake_Area_km2: Number(Lake_Area_km2),
      Dam_Slope_deg: Number(Dam_Slope_deg),
      Lake_Temp_C: Number(Lake_Temp_C),
      Elevation_m: Number(Elevation_m),

      //  ML fields
      riskLevel: risk_level,       

      uploadedById: officialId,
      verificationStatus: "PENDING"
    });

    res.status(201).json(
      new ApiSuccess({
        message: "Data uploaded and risk evaluated successfully",
        data: record
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getPendingHighRiskReports(req, res, next) {
  try {
    const reports = await lakeRepo.findMany({
      where: {
        verificationStatus: "PENDING",
        riskLevel: {
          not: "LOW"
        }
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: [
        { riskLevel: "desc" },   // HIGH / IMMEDIATE first
        { assessedAt: "desc" }   // most recent AI first
      ]
    });

    res.status(200).json(
      new ApiSuccess({
        message: "Pending non-low risk lake reports fetched successfully",
        data: reports
      })
    );
  } catch (error) {
    next(error);
  }
}
async function verifyData(req, res, next) {
  try {
    const reportId = Number(req.params.reportId);
    const officialId = req.user.id;

    if (!reportId) {
      throw new ApiError(400, "Invalid report ID");
    }

    // 1. Fetch report
    const report = await lakeRepo.findUnique({
      id: reportId
    });

    if (!report) {
      throw new ApiError(404, "Lake report not found");
    }

    // 2. State validation (IMPORTANT)
    if (report.verificationStatus === "VERIFIED") {
      throw new ApiError(400, "Report is already verified");
    }

    if (report.verificationStatus === "REJECTED") {
      throw new ApiError(400, "Rejected report cannot be verified");
    }

    // 3. Update verification fields
    const updatedReport = await lakeRepo.update(
      { id: reportId },
      {
        verificationStatus: "VERIFIED",
        verifiedById: officialId,
        verifiedAt: new Date(),
        declinedAt: null,
        declineById: null
      }
    );

    res.status(200).json(
      new ApiSuccess({
        message: "Data assessment verified successfully",
        data: updatedReport
      })
    );
  } catch (error) {
    next(error);
  }
}
async function rejectData(req, res, next) {
  try {
    const reportId = Number(req.params.reportId);
    const officialId = req.user.id;

    if (!reportId) {
      throw new ApiError(400, "Invalid report ID");
    }

    // 1. Fetch report
    const report = await lakeRepo.findUnique({
      id: reportId
    });

    if (!report) {
      throw new ApiError(404, "Lake report not found");
    }

    // 2. State validation
    if (report.verificationStatus === "VERIFIED") {
      throw new ApiError(400, "Verified report cannot be rejected");
    }

    if (report.verificationStatus === "REJECTED") {
      throw new ApiError(400, "Report is already rejected");
    }

    // 3. Update rejection fields
    const updatedReport = await lakeRepo.update(
      { id: reportId },
      {
        verificationStatus: "REJECTED",
        declineById: officialId,
        declinedAt: new Date(),
        verifiedById: null,
        verifiedAt: null
      }
    );

    res.status(200).json(
      new ApiSuccess({
        message: "Data assessment rejected successfully",
        data: updatedReport
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getOfficialProfile(req, res, next) {
  try {
    const officialId = req.user.id;

    const official = await officialRepo.findUnique({ id: officialId });

    if (!official) {
      throw new ApiError(404, "Official not found");
    }

    // remove sensitive fields
    delete official.password;

    res.status(200).json(
      new ApiSuccess({
        message: "Official profile fetched successfully",
        data: {
          id: official.id,
          name: official.name,
          email: official.email,
          photo: official.photo,
          position: official.position,
          department: official.department,
          isVerified: official.isVerified,
          createdAt: official.createdAt
        }
      })
    );
  } catch (error) {
    next(error);
  }
}



module.exports = {
  registerOfficial,
  officialSignIn,
  officialSignOut,
  updatePasswordOfficial,
  uploadData,
  verifyData,
  getPendingHighRiskReports,
  rejectData,
  getOfficialProfile
};