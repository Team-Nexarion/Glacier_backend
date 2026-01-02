const adminRouter=require("./admin.route");
const officialRouter=require("./official.route");
const express=require("express");
const app=express();
app.get("/",(req,res)=>{
    res.send("Welcome to the Glacier Project API");
});
app.use("/admin",adminRouter);
app.use("/official",officialRouter);
module.exports=app;