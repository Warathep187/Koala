const mongoose = require("mongoose");
var usersSchema = mongoose.Schema({
    username: String,
    password: String
});
var usersinformationSchema = mongoose.Schema({
    user_id: String,
    email: String,
    username: String,
    tel: String,
    full_name: {type: String, default: ""},
    bank: {type: String, default: ""},
    bank_number: {type: String, default:""}
})
var usersaddressSchema = mongoose.Schema({
    user_id: String,
    address: String
})
var usersproductsSchema = mongoose.Schema({
    shop_id: String,
    product_image: Array,
    product_name: {type: String, trim: true},
    product_information: String,
    product_type: Array,
    product_sold: {type: Number, default: 0},
    product_category: String
})
var productscommentsSchema = mongoose.Schema({
    date: Date,
    product_id: String,
    review_image: String,
    username: String,
    comment: String,
    point: Number
})
var cartSchema = mongoose.Schema({
    product_image: String,
    product_name: String,
    shop_id: String,
    buyer_id: String,
    product_id: String,
    product_type: Array,
    buy_time: {type: Date, default: new Date()},
    in_payment: {type: Boolean, default: false},
    address: {type: String, default: ""},
    status: {type: String, default: "preparing"},
    review: {type: Boolean, default: false},
    confirm: {type: Boolean, default: false},
    cancel: {type: Boolean, default: false},
    shipped_time: Date,
})

var transferSchema = mongoose.Schema({
    slip_image: String,
    cart_id: Array, //["cartId", "cartId", ...]
    cancel: {type: Boolean, default: false},
    buy_time: Date,
    result: Number,
    buyer_id: String,
    confirm: {type: Boolean, default: false}
})

module.exports.users = mongoose.model('usersid', usersSchema);
module.exports.usersinformation = mongoose.model('usersinformation', usersinformationSchema);
module.exports.usersaddress = mongoose.model('usersaddress', usersaddressSchema)
module.exports.usersproduct = mongoose.model('usersproduct', usersproductsSchema);
module.exports.productscomment = mongoose.model('productscomment', productscommentsSchema);
module.exports.cart = mongoose.model('cart', cartSchema);
module.exports.transfer = mongoose.model('transfer', transferSchema);