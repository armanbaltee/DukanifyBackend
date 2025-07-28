const adminMiddleware = (req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(500).json({message: "email or password required"});
    }
    next();
}

module.exports ={
    adminMiddleware
}