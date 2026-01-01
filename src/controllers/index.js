const {registerAdmin,
    adminSignIn,
    adminSignOut,
    verifyOfficial,
    getOfficials,
    declineOfficial,
    updatePassword}=require("./admin.controller");
const {
   registerOfficial,
    officialSignIn,
    officialSignOut,
    updatePasswordOfficial
}=require("./official.controller")
module.exports={registerAdmin,
    adminSignIn,
    adminSignOut,
    verifyOfficial,
    getOfficials,
    declineOfficial,
    updatePassword,
    registerOfficial,
    officialSignIn,
    officialSignOut,
    updatePasswordOfficial
};