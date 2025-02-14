import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const listOfUsers = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-password"
    );

    res.status(200).json(listOfUsers);
  } catch (error) {
    console.log("error in getUserForSidebar controller -> ", error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChat } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChat },
        { senderId: userToChat, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages controller -> ", error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const myId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage controller -> ", error);
    res.status(500).json({ message: "Internal server error !" });
  }
};
