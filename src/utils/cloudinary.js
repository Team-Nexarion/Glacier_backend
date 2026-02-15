const ApiError = require('./ApiError');
const fs = require("fs");
const cloudinary = require('cloudinary').v2;
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new ApiError(500, "Cloudinary env variables missing");
}
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if (!localFilePath) {
            throw new ApiError(400, "Invalid path");
        }
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type: "image"

        })
        return response.url;
    }catch(err){
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new ApiError(500, err.message);
    }
}
module.exports = uploadOnCloudinary;