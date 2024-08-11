export const catchAsyncErrors = (fun)=>{
    return (req,res,next) =>{
        //takes promise, returns if successful, else catch error and execute next function
        Promise.resolve(fun(req,res,next)).catch(next)
    }
}