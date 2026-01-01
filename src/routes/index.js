const adminRouter=require("./admin.route");
const officialRouter=require("./official.route");
const express=require("express");
const app=express();
app.use("/admin",adminRouter);
app.use("/official",officialRouter);
module.exports=app;