const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_name:{
        type: String,
        required: true
    },
    product_type:{
        type: String,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    fileId:{
        type: String,
        required: true
    }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;