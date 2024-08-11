import mongoose from "mongoose";

const dbConnection = () =>{
    //promise
    mongoose.connect(process.env.MONGO_URI,{ 
        dbName: "PORTFOLIO", //database-name
    }).then(()=>{
        console.log("Connected to databse..")
    }).catch((e)=>{
        console.log(`Error occured while connecting to database ${e}`)
    })
     
}

export default dbConnection