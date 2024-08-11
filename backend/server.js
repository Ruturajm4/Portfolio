import app from "./app.js"
import cloudinary from 'cloudinary'

//CONFIGURE CLOUDINARY
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

//SERVER START
app.listen(process.env.PORT, ()=>{
    console.log(`server is running at ${process.env.PORT}`)
})