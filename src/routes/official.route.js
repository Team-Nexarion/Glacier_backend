const officialRouter=require('express').Router();
const {
    registerOfficial,
    officialSignIn,
    officialSignOut,
    updatePasswordOfficial,
    getOfficialProfile
    
}=require("../controllers");
const middlewares = require("../middlewares");
const authenticate = middlewares.authenticate;
const isOfficial = middlewares.isOfficial;
const upload = middlewares.upload;

officialRouter.post("/register",upload.single("photo"),registerOfficial);
officialRouter.post("/signin",officialSignIn);
officialRouter.post("/signout",authenticate,isOfficial,officialSignOut);
officialRouter.patch("/updatepassword",authenticate,isOfficial,updatePasswordOfficial);
officialRouter.get("/profile", authenticate, isOfficial, getOfficialProfile);

module.exports=officialRouter;