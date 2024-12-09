const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController'); // Adjust the path as needed
const { userAuth } = require('../middlewares/auth');  // Ensure userAuth middleware is properly implemented
const passport = require('passport');
const productController=require('../controllers/user/productController')
const blocker=require('../middlewares/block');
const { block } = require('sharp');
const User=require('../models/userSchema')




router.use((req, res, next) => {if (['/login', '/signup', '/auth/google', '/auth/google/callback'].includes(req.path)) {return next();  } blocker(req, res, next);});
router.get('/', blocker,userController.loadHomepage);
router.get('/signup', userController.loadingSignup);  
router.post('/signup', userController.signup);        
router.post('/verify-otp', userController.verifyOtp);   
router.post('/resend-otp', userController.resendOtp);   
router.get('/login', userController.loadLogin);         
router.post('/login', userController.login);            
router.get('/logout', userAuth, userController.logout); 
router.get('/pageNotFound', userController.pageNotFound); 
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/signup' }), async( req, res) => {
    try {
      const user=req.session.passport.user;
      const userData=await User.findOne({_id:user,isBlocked:false})  
      if(userData){
        return  res.redirect('/'); 
      }
      req.session.destroy();
      return res.redirect('/login?message=user is blocked')
    } catch (error) {
        console.log('passport error',error);
        res.redirect('pageNoteFound')
    }
    
   
 });
router.get('/productDetails',blocker,productController.productDetails);
router.get('/shop',blocker,productController.shopLoad);







module.exports = router;
