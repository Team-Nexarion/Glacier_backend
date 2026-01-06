const {registerAdmin,
    adminSignIn,
    adminSignOut,
    verifyOfficial,
    getOfficials,
    declineOfficial,
    updatePassword
}=require("./admin.controller");
const {
   registerOfficial,
    officialSignIn,
    officialSignOut,
    updatePasswordOfficial,
    uploadData,
    verifyData,
    getPendingHighRiskReports,
    rejectData,
    getOfficialProfile,
    
}=require("./official.controller")
const {getAllLakeData,getLakeDetails,assessPendingLakes}=require("./lakeData.controller");
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
    updatePasswordOfficial,
    uploadData,
    verifyData,
    getPendingHighRiskReports,
    rejectData,
    getOfficialProfile,
    getAllLakeData,
    getLakeDetails,
    assessPendingLakes
};