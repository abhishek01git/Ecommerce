const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController'); // Adjust the path as needed
const { userAuth } = require('../middlewares/auth');  // Ensure userAuth middleware is properly implemented
const passport = require('passport');
const productController=require('../controllers/user/productController')


// Home page route
router.get('/', userController.loadHomepage);

// Signup routes
router.get('/signup', userController.loadingSignup);  
router.post('/signup', userController.signup);        

// OTP verification routes
router.post('/verify-otp', userController.verifyOtp);   
router.post('/resend-otp', userController.resendOtp);   

// Login routes
router.get('/login', userController.loadLogin);         
router.post('/login', userController.login);            

// Logout route
router.get('/logout', userAuth, userController.logout); 

// Page Not Found
router.get('/pageNotFound', userController.pageNotFound); 


// Route to initiate Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route for Google OAuth
router.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/signup' }),(req, res) => {res.redirect('/');  });

router.get('/productDetails',productController.productDetails);








module.exports = router;
