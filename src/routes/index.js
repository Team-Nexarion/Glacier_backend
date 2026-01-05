const adminRouter=require("./admin.route");
const lakeRouter=require("./lakeData.route");
const officialRouter=require("./official.route");
const express=require("express");
const app=express();
app.get("/",(req,res)=>{
    res.send("Welcome to the Glacier Project API");
});
app.use("/admin",adminRouter);
app.use("/official",officialRouter);
app.use("/lakereport",lakeRouter);
module.exports=app;