const Product = require('../../models/productSchema');
const Category = require('../../models/categotySchema');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Show the page to add a product
const getProductAddPage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        res.render('product-add', {
            cat: category
        });
    } catch (error) {
        res.redirect('/pageError');
    }
};
// Add a new product
const addProducts = async (req, res) => {
    try {
        const products = req.body;
        const productExist = await Product.findOne({
            productName: products.productName,
        });
        if (!productExist) {
            const images = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;
                    const resizedImagePath = path.join('public', 'uploads', 'product-image', req.files[i].filename);

                    await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagePath);
                    images.push('/uploads/product-image/' + req.files[i].filename);
                }
            }

            const categoryId = await Category.findOne({ name: products.category });
            if (!categoryId) {
                return res.status(400).json({ error: 'Invalid category name' });
            }

            const newProduct = new Product({
                productName: products.productName,
                description: products.description,
                category: categoryId._id,
                regularPrice: products.regularPrice,
                salePrice: products.salePrice,
                createdAt: new Date(),
                quantity: products.quantity,
                size: products.size,
                productImage: images,
                status: "Available"
            });

            await newProduct.save();
            return res.redirect('/admin/addProducts');
        } else {
            return res.status(400).json("Product already exists, try with another name");
        }
    } catch (error) {
        console.error('Error saving product', error);
        return res.redirect('/admin/pageError');
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const Search = req.query.search || "";
        const page = req.query.page || 1;
        const limit = 3;

        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + Search + ".*", "i") } },
            ],
        }).limit(limit * 1).skip((page - 1) * limit).populate('category').exec();

        const count = await Product.countDocuments({
            $or: [
                { productName: { $regex: new RegExp(".*" + Search + ".*", "i") } },
            ]
        });

        const category = await Category.find({ isListed: true });
        if (category) {
            res.render('products', {
                data: productData,
                currentpage: page,
                totalpage: Math.ceil(count / limit),
                totalcount: count,
                cat: category
            });
        } else {
            res.redirect('page-404');
        }
    } catch (error) {
        res.redirect('/pageError');
    }
};

// Block a product
const blockProduct = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect('/admin/products');
    } catch (error) {
        res.redirect('/pageError');
    }
};

// Unblock a product
const unblockProduct = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect('/admin/products');
    } catch (error) {
        res.redirect('/pageError');
    }
};

// Get the page to edit a product
const geteditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({ _id: id });
        const categories = await Category.find({});
        res.render('edit-product', {
            product: product,
            cat: categories
        });
    } catch (error) {
        res.redirect('/pageError');
    }
};

// Edit product details
const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const images = req.files; // Array of images uploaded
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const existingProduct = await Product.findOne({
            productName: req.body.productName,
            _id: { $ne: id },
        });

        if (existingProduct) {
            return res.status(400).json({ error: "Product already exists. Try with another name." });
        }

        // Update images if new ones are uploaded
        if (images && images.length > 0) {
            // Delete existing images from file system
            product.productImage.forEach((img) => {
                const filePath = path.join('public', 'uploads', img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete image file
                }
            });

            product.productImage = images.map((file) => '/uploads/' + file.filename);
        }

        // Updating the product details
        product.productName = req.body.productName || product.productName;
        product.description = req.body.description || product.description;
        product.category = req.body.category || product.category;
        product.regularPrice = req.body.regularPrice || product.regularPrice;
        product.salePrice = req.body.salePrice || product.salePrice;
        product.quantity = req.body.quantity || product.quantity;
        product.size = req.body.size || product.size;

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error while editing product:', error.message || error);
        res.redirect('/pageError');
    }
};


// Delete a single product image
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

        const imagePath = path.resolve('public', 'uploads', 'product-image', imageNameToServer);
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