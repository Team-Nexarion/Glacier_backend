require("dotenv").config();
const express=require("express");

const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middlewares");
const router=require("./routes");
const PORT=process.env.PORT || 3000;
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/",router);
app.use(errorHandler);
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});