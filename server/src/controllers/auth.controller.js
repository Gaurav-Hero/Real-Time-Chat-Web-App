import cloudinary from "../lib/cloudinary.js";
import { jwtTokenGenerator } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signup = async (req , res) => {
    //get info from req.body
    const {fullName ,email ,password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message : "All fields are required !"})
        }
        
        if(password.length < 6){
            return res.status(400).json({message : "Password must be atleast 6 characters long !"})
        }
        //check if user already exists
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message : "User already exists !"})
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);

        //create new user
        const newUser = new User(
            {
                fullName,
                email,
                password: hashedPassword
            }
        )

        //save user to db
        if(newUser){
            jwtTokenGenerator(newUser._id ,res);
            await newUser.save();

            res.status(201).json({id: newUser._id , fullName: newUser.fullName , email: newUser.email})

        }else{
            return res.status(400).json({message : "Failed to create user or invailid data !"})
        }
    } catch (error) {
        console.log("error in signup Controller -> ",error);
        res.status(500).json({message : "Internal server error !"});
    }
};


export const login = async (req , res) => {
    const {email , password} = req.body;

    if(!email || !password){
        return res.status(400).json({message : "All fields are required !"})
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message : "User does not exist !"})
    }
    if(user){
        const isMatch = await bcrypt.compare(password , user.password);
        if(isMatch){
            jwtTokenGenerator(user._id ,res);
            return res.status(200).json({id: user._id , fullName: user.fullName , email: user.email})
        }else{
            return res.status(400).json({message : "Invalid credentials !"})
        }
    }

};


export const logout = (req , res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message : "Successfully Logged out !"});
        
    } catch (error) {
        console.log("error in logout Controller -> ",error);
    }
    
};

export const updateProfile = async (req , res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message : "Profile picture is required !"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        
        const updatedUser = await User.findByIdAndUpdate(userId , {profilePic : uploadResponse.secure_url} , {new : true});
        res.status(200).json(updatedUser);        

    } catch (error) {
        console.log("error in updateProfile Controller -> ",error.message);
        res.status(500).json({message : "Internal server error !"});
    }
}

export const checkAuth = async (req , res) => {
    
    try {
        res.status(200).json(req.user);
    }catch (error) {    
        console.log("error in checkAuth Controller -> ",error.message);
        res.status(500).json({message : "Internal server error !"});
    }

}