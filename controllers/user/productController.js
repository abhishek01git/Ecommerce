const Product = require('../../models/productSchema');
const Category = require('../../models/categotySchema'); // Fixed typo
const User = require('../../models/userSchema');

const productDetails = async (req, res) => {
   try {
       const userId = req.session.user;

    //    if (userId) {
    //        console.error("User not logged in.");
    //        return res.redirect('/login'); 
    //    }

       const userData = await User.findById(userId);
       const productId = req.query.id;

       if (!productId) {
           console.error("Product ID is missing from request.");
           return res.redirect('/pageNotFound'); 
       }

       const product = await Product.findById(productId).populate('category');



       if (!product) {
           console.error(`Product with ID ${productId} not found.`);
           return res.redirect('/pageNotFound'); 
       }
        
       const findCategory =  product.category;


       console.log("Product Category:", product.category);

       res.render('product-details', {
           user: userData,
           product: product,
           quantity: product.quantity,
           category:findCategory
          

       });
   } catch (error) {
       console.error("Error in productDetails:", error);
       res.redirect('/pageNotFound');
   }
};
const shopLoad = async (req, res) => {
   try {


       const products = await Product.find({isBlocked:false});

       res.render('shope', {
           products: products
       });
   } catch (error) {
       console.error("Error in productDetails:", error);
   }
};



module.exports = { productDetails,shopLoad };
