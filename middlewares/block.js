const User = require('../models/userSchema');

const checkUserBlocked=async(req,res,next)=>{
    try {
        
        const userId = req.session.user;
        const user = await User.findById(userId);
           
        if(user && user.isBlocked){
            return res.redirect('/login');

        }
        next()

    } catch (error) {
        console.log(error);
        // res.redirect('/pageNotFound');
        

        
    }
}

module.exports=checkUserBlocked;