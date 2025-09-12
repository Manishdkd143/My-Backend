import { app } from "./app.js";

import { DB_NAME,PORT } from "./constants.js";
import ConnectDB from "./db/Connect.js";


ConnectDB()
.then(()=>{
   app.on('error',(err)=>{
    console.log("Connection is failed",err)
   })
   app.listen(PORT,()=>{
    console.log(`app is listening on ${PORT}`)
   })
})
.catch((err)=>{
    console.log("Error",err)
})

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