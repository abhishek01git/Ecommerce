const Product = require('../../models/productSchema');
const Category = require('../../models/categotySchema');
const User = require('../../models/userSchema');
const fs=require('fs');
const path=require('path');
const sharp=require('sharp')


const getProductAddPage= async(req,res)=>{
    try {
    const category=await Category.find({isListed:true})
     res.render('product-add',{
        cat:category 
     }) 
     console.log(category);  
    } catch (error) {
        res.redirect('/pageError')
    }
}



const addProducts=async(req,res)=>{
try {
    const products=req.body;
    console.log(products);
    const productExist=await Product.findOne({
        productName:products.productName,
    });
    if(!productExist){
        const images=[];
        if(req.files && req.files.length>0){
            for(let i=0;i<req.files.length;i++){
                const orininalImagePath=req.files[i].path;

                const resizedImagePath=path.join('public','uploads','product-image',req.files[i].filename)
                await sharp(orininalImagePath).resize({width:440,height:440}).toFile(resizedImagePath);
                images.push('/uploads/product-image/' + req.files[i].filename);
            }
        }
        console.log(products.Category);     
        const categoryId = await Category.findOne({ name: products.category });

        console.log(categoryId);
        

        if(!categoryId){
            return res.status(400).json({ error: 'Invalid category name' });

        }
        const newProduct=new Product({
            productName:products.productName,
            description:products.description,
            category:categoryId._id,
            regularPrice:products.regularPrice,
            salePrice:products.salePrice,
            createdAt:new Date(),
            quantity:products.quantity,
            size:products.size,
            productImage:images,
            status:"Avaliable"
            
        })

               await newProduct.save();
               return res.redirect('/admin/addProducts')
    }else{
        return  res.status(400).json("product already exist ,try with another name")
    }
} catch (error) {
    console.error('Error saving product',error);
    return res.redirect('/admin/pageError')
    
}
}


const getAllProducts=async(req,res)=>{
    try {
        const Search=req.query.search ||"";
        const page=req.query.page ||1;
        const limit=3;

        const productData=await Product.find({
            $or:[
                {productName:{$regex:new RegExp(".*"+Search+".*","i")}},

            ],

        }).limit(limit*1).skip((page-1)*limit).populate('category').exec();


        const count=await Product.countDocuments({
            $or:[
                {productName:{$regex:new RegExp(".*"+Search+".*","i")}},
            ]
        }).countDocuments();
        const category= await Category.find({isListed:true});
        if (category) {
            res.render('products', {
                data: productData,
                currentpage: page,
                totalpage:page,
                totalcount: Math.ceil(count / limit),
                cat: category
                
            })
        }else{
         res.redirect('page-404');  
        }

       
    } catch (error) {
        res.redirect('/pageError')
    }
}


const blockProduct=async(req,res)=>{
    try {
        const id=req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/pageError')
    }
}


const unblockProduct=async(req,res)=>{
    try {
        const id=req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/pageError')
    }
}

const geteditProduct=async(req,res)=>{
    try {
        const id=req.query.id;
        const product=await Product.findOne({_id:id});
        const category=await Category.find({});
        res.render('edit-product',{
            product:product,
            cat:category
        })
    } catch (error) {
        res.redirect('/pageError')
    }
}


const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const images = req.files; // Get the uploaded images from multer
        console.log('images',images)
        // Fetch the existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        console.log(product)
        const alreadyImg=product.productImage;
        console.log(alreadyImg,'sdfsfsf')
        // Check for duplicate product name
        const data = req.body;
        console.log('data',data)
        const existingProduct = await Product.findOne({
            productName: data.productName,
            _id: { $ne: id },
        });
        
        if (existingProduct) {
            return res.status(400).json({ error: "Product already exists. Try with another name." });
        }

        // Update product images
        if (images && images.length > 0) {
            // Delete old images
            product.productImage.forEach((img) => {
                const filePath = path.join('public', 'uploads', img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete the old image
                }
            });

            // Save new image filenames
            product.productImage = images.map((file) => '/uploads/' + file.filename);
        }
        product.productImage=[...product.productImage,...alreadyImg];
        // Update other product fields
        product.productName = data.productName || product.productName;
        product.description = data.description || product.description;
        product.category = data.category || product.category;
        product.regularPrice = data.regularPrice || product.regularPrice;
        product.salePrice = data.salePrice || product.salePrice;
        product.quantity = data.quantity || product.quantity;
        product.size = data.size || product.size;

        // Save the updated product
        await product.save();

        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error while editing product:', error.message || error);
        res.redirect('/pageError');
    }
};




const deleteSingleImage = async (req, res) => {
    try {
        const { imageNameToServer, productToServer } = req.body;
        const product = await Product.findByIdAndUpdate(
            productToServer,
            { $pull: { productImage: imageNameToServer } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const imagePath = path.resolve('public', 'uploads', 're-image', imageNameToServer);
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully.`);
        } else {
            console.log(`Image ${imageNameToServer} not found.`);
        }

        res.send({ status: true });
    } catch (error) {
        console.error('Error deleting image:', error.message || error);
        res.redirect('/pageError');
    }
};



module.exports={getProductAddPage,addProducts,getAllProducts,blockProduct,unblockProduct,geteditProduct,editProduct,deleteSingleImage}