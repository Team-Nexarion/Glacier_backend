const { execFile } = require("child_process");
const { LakeReportRepository } = require("../repository");
const axios = require("axios");
const path = require("path");
const prisma = require("../../prisma/client");
const { ApiError, ApiSuccess } = require("../utils");


const lakeRepo = new LakeReportRepository(prisma);


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
            photo: true,
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

};
