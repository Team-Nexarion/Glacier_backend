const { execFile } = require("child_process");
const { LakeReportRepository } = require("../repository");
const axios = require("axios");
const path = require("path");
const prisma = require("../../prisma/client");
const { ApiError, ApiSuccess } = require("../utils");
const ML_API_URL = "http://127.0.0.1:5000/predict";

const lakeRepo = new LakeReportRepository(prisma);

function runML(area, slope, temp, elev) {
  return new Promise((resolve, reject) => {
  const scriptPath = path.resolve(
  "C:/Users/roysu/Downloads/app/predict.py"
);

    execFile(
      "python",
      [scriptPath, area, slope, temp, elev],
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (err) {
          reject(new Error("Invalid ML output"));
        }
      }
    );
  });
}

/**
 * Assess all PENDING lakes using ML model
 */
async function assessPendingLakes(req, res, next) {
  try {
    // 1️⃣ Fetch pending lakes
    const pendingLakes = await prisma.lakereport.findMany({
      where: {
        verificationStatus: "PENDING",
      },
    });

    if (pendingLakes.length === 0) {
      return res.status(200).json(
        new ApiSuccess({
          message: "No pending lakes to assess",
          data: [],
        })
      );
    }

    const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "IMMEDIATE"];
    const results = [];

    // 2️⃣ Loop & assess
    for (const lake of pendingLakes) {
      const mlResult = await runML(
        lake.Lake_Area_km2,
        lake.Dam_Slope_deg,
        lake.Lake_Temp_C,
        lake.Elevation_m
      );

      if (!VALID_RISK_LEVELS.includes(mlResult.risk_level)) {
        throw new ApiError(
          500,
          `Invalid risk level from ML: ${mlResult.risk_level}`
        );
      }

      // 3️⃣ Update lake with ML result
      const updatedLake = await prisma.lakereport.update({
        where: {
          id: lake.id,
        },
        data: {
          riskLevel: mlResult.risk_level,
          confidence: mlResult.risk_index,
          assessedAt: new Date(),
        },
      });

      results.push(updatedLake);
    }

    // 4️⃣ Respond
    res.status(200).json(
      new ApiSuccess({
        message: "Pending lakes assessed successfully",
        data: results,
      })
    );
  } catch (error) {
    next(error);
  }
}
async function getAllLakeData(req, res, next) {
  try {
    const records = await lakeRepo.findMany({
      where: {
        verificationStatus: "VERIFIED",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true,
            photo: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(
      new ApiSuccess({
        message: "Verified lake data fetched successfully",
        data: records,
      })
    );
  } catch (error) {
    next(error);
  }
}
async function getLakeDetails(req, res, next) {
  try {
    const lakeId = Number(req.params.lakeId);

    if (!lakeId || isNaN(lakeId)) {
      throw new ApiError(400, "Invalid lake id");
    }

    const record = await lakeRepo.findMany({
      where: {
        id: lakeId,
        verificationStatus: "VERIFIED",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true,
            photo: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true,
          },
        },
      },
    });

    // findMany returns array — handle it properly
    if (!record || record.length === 0) {
      throw new ApiError(404, "Lake not found or not verified");
    }

    res.status(200).json(
      new ApiSuccess({
        message: "Lake details fetched successfully",
        data: record[0],
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllLakeData,
  getLakeDetails,
  assessPendingLakes
};
