import jwt from 'jsonwebtoken';

export const jwtTokenGenerator = (userId , res) => {
    //generate jwt token
    const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn: "7d"});

    //set cookie
    res.cookie('jwt' , token , {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development"
    });

    
    return token;
}