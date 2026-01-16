const lakeRouter = require("express").Router();

const {
    uploadData,
    getPendingRiskReports,
    verifyData,
    rejectData,
    getAllLakeData,
    getLakeDetails,

} = require("../controllers");

const middlewares = require("../middlewares");
const authenticate = middlewares.authenticate;
const isOfficial = middlewares.isOfficial;

lakeRouter.get("/",getAllLakeData);

lakeRouter.get("/details/:lakeId", getLakeDetails);
lakeRouter.post("/uploaddata",authenticate,isOfficial,uploadData);
lakeRouter.get(
  "/pending/high-risk",
  authenticate,
  isOfficial,
  getPendingRiskReports,
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
