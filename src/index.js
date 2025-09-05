import mongoose from "mongoose";
import express from "express"
import dotenv from "dotenv"
import { DB_NAME,PORT } from "./constants.js";
import ConnectDB from "./db/Connect.js";


dotenv.config({
    path:'./env'
})
ConnectDB()

//  (async()=>{
// try {
//     console.log(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//    app.on('error',(error)=>{
//       console.log("Errrr",error)
//       throw error
//    })
//    app.listen(PORT,()=>{
//     console.log(`app is listening on ${PORT}`)
//    })
// } catch (error) {
//     console.log("Connection is not establish",error)
//     throw error
// }
//  })()