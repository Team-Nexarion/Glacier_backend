const lakeRouter = require("express").Router();

const {
    uploadData,
    getPendingHighRiskReports,
    verifyData,
    rejectData
} = require("../controllers");

const middlewares = require("../middlewares");
const authenticate = middlewares.authenticate;
const isOfficial = middlewares.isOfficial;

lakeRouter.post("/uploaddata",authenticate,isOfficial,uploadData);
lakeRouter.get(
  "/pending/high-risk",
  authenticate,
  isOfficial,
  getPendingHighRiskReports
);
lakeRouter.get(
  "/pending/high-risk",
  authenticate,
  isOfficial,
  getPendingHighRiskReports
);

lakeRouter.patch(
  "/verify/:reportId",
  authenticate,
  isOfficial,
  verifyData
);

lakeRouter.patch(
  "/reject/:reportId",
  authenticate,
  isOfficial,
  rejectData
);

module.exports = lakeRouter;
