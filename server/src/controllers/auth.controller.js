import { jwtTokenGenerator } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

//Signup logic Here ->
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
// Login logic here ->
export const login = (req , res) => {
    res.send("login route !")
};
// Logout logic here ->
export const logout = (req , res) => {
    res.send("logout route !")
};