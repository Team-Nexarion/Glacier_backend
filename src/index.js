const express=require("express");
const cookieparser=require("cookie-parser");
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());

app.listen(3000,()=>{
    console.log("Server is running on http://localhost:3000 ");
});