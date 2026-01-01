const adminRouter=require('express').Router();
const {registerAdmin,
    adminSignIn,
    adminSignOut,
    verifyOfficial,
    getOfficials,
    declineOfficial,
    updatePassword}=require("../controllers");
const middlewares = require("../middlewares");
const authenticate = middlewares.authenticate;
const isAdmin = middlewares.isAdmin;
const upload = middlewares.upload;

adminRouter.post("/register",upload.single("photo"),authenticate,isAdmin,registerAdmin);
adminRouter.post("/officials/verify/:officialId",authenticate,isAdmin,verifyOfficial);
adminRouter.get("/officials",authenticate,isAdmin,getOfficials);
adminRouter.post("/officials/decline/:officialId",authenticate,isAdmin,declineOfficial);
adminRouter.post("/signin",adminSignIn);
adminRouter.post("/signout",authenticate,isAdmin,adminSignOut);
adminRouter.patch("/updatepassword",authenticate,isAdmin,updatePassword);
module.exports=adminRouter;