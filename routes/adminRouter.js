const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const {userAuth,adminAuth}=require('../middlewares/auth')
const customerCountroller=require('../controllers/admin/customerCountroller')
const categoryController=require('../controllers/admin/categoryController')
const productController=require('../controllers/admin/productController')
const  upload=require('../utils/multer')




router.get('/login', adminController.Loadlogin);
router.post('/login', adminController.login);
router.get('/pageError',adminController.pageError)

router.get('/dashboard',adminAuth,adminController.loadDashboard);
router.get('/logout',adminController.logout)
router.get('/users',adminAuth,customerCountroller.customerInfo);
router.get('/block')
router.get('/blockCustomer',adminAuth,customerCountroller.customerBlocked);
router.get('/unblockCustomer',adminAuth,customerCountroller.customerunBlocked)

//category
router.get('/category', adminAuth, categoryController.categoryInfo);
router.post('/addCategory', adminAuth, upload.single('image'), categoryController.addcategory); 
router.get('/listCategory', adminAuth, categoryController.getListCateroty); 
router.get('/unlistCategory', adminAuth, categoryController.getUnlistCateroty);
router.get('/editCategory',adminAuth,categoryController.getEditCategory)
router.post('/editCategory/:id', adminAuth, upload.single('image'), categoryController.editCategory);


//product
router.get("/addProducts", adminAuth, productController.getProductAddPage);
 router.post("/addProducts", adminAuth, upload.array('images',3),productController.addProducts);
router.get('/products',adminAuth,productController.getAllProducts);
router.get('/unblockProduct',adminAuth,productController.unblockProduct);
router.get('/blockProduct',adminAuth,productController.blockProduct)
router.get('/editProduct',adminAuth,productController.geteditProduct)
router.get("/editProduct/:id", adminAuth, productController.geteditProduct);
router.post('/editProduct/:id', adminAuth, upload.array('images', 3), productController.editProduct);
 router.post('/deleteImage', adminAuth, productController.deleteSingleImage);



module.exports = router;

