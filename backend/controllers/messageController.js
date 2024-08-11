import { Message } from "../models/messageSchema.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";

//CREATE MESSAGE
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message } = req.body;

  //ID ANY VALUE NOT FOUND THROW ERROR
  if (!senderName || !subject || !message) { 
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  //IF VALUES PRESENT CREATE MESSAGE
  const data = await Message.create({ senderName, subject, message });
  res.status(201).json({
    success: true,
    message: "Message Sent",
    data,
  });
});

//GET ALL MESSAGES
export const getAllMessages = catchAsyncErrors(async (req, res, next)=>{
  const messages = await Message.find();
  res.status(201).json({
    success: true,
    messages,
  })
})

//DELETE MESSAGE
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);

  if (!message) {
    return next(new ErrorHandler("Message Already Deleted!", 400));
  }
  await message.deleteOne();
  res.status(201).json({
    success: true,
    message: "Message Deleted",
  });
});