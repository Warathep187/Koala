const express = require('express');
const app = express();
const ejs = require('ejs');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const svgCaptcha = require('svg-captcha');
const formidable = require('formidable');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const math = require('./public/js/math.js');
require('dotenv').config();

//MongoDB Schema
const model = require('./model.js');
const users = model.users;
const usersinformation = model.usersinformation;
const usersaddress = model.usersaddress;
const usersproduct = model.usersproduct;
const productscomment = model.productscomment;
const cart = model.cart;
const transfer = model.transfer;


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'session',
    resave: false,
    saveUninitialized: false
}))

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(process.env.MONGOCONNECTING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(!err) {
        console.log('MongoDB is connected');
    }else {
        console.log(err.message);
    }
})


//Login and Register.

var timeoutSet;

app.get('/', (req, res) => {
    req.session.destroy(err => {});
    res.render('main');
})

app.post('/register-check/:type', (req, res) => {
    if(req.params.type == 'username') {
        if(req.body.username === 'KoalaAdmin') {
            res.send({r: 'already used'});
            return;
        }
        users.findOne({username: req.body.username})
        .select('username')
        .exec((err, data) => {
            if(!err) {
                if(data) {
                    res.send({r: 'already used'})
                }else {
                    res.send({r: 'can be used'});
                }
            }
        })
    }
    if(req.params.type == 'email') {
        usersinformation.findOne({email: req.body.email})
        .select('email')
        .exec((err, data) => {
            if(!err) {
                if(data) {
                    res.send({r: 'already used'})
                }else {
                    res.send({r: 'can be used'});
                }
            }
        })
    }
    if(req.params.type == 'captcha' && req.session.captcha) {
        if(req.body.captcha == req.session.captcha) {
            res.send({r: 'correct'});
        }else {
            res.send({r: 'incorrect'});
        }
    }
    if(req.params.type == 'registering') {
        if(req.body.otp != req.session.otp) {
            res.send({r: 'OTP is incorrect'});
            return;
        }
        let password = "Koa" + req.body.password + "la";
        bcrypt.hash(password, 12, (err, hash) => {
            if(!err) {
                users.insertMany([{username: req.body.username, password: hash}], (err, data) => {
                    let userId = data[0]._id;
                    if(err) {
                        res.send({r: 'Error'});
                        return;
                    }
                    usersinformation.insertMany([{user_id: userId, email: req.body.email, username: req.body.username, tel: req.body.tel}], err => {
                        if(err) {
                            res.send({r: 'Error'});
                            return;
                        }
                        usersaddress.insertMany([{user_id: userId, address: req.body.address}], err => {
                            if(err) {
                                res.send({r: "Error"});
                                return;
                            }
                        }) 
                    })
                })
            }
        })
        req.session.otp = 0;
        clearTimeout(timeoutSet);
        res.send({
            r: 'Registering successfully'
        });
    }
    if(req.params.type == 'tel') {
        usersinformation.findOne({tel: req.body.tel})
        .select('tel')
        .exec((err, data) => {
            if(!err) {
                if(data) {
                    res.send({r: 'already used'});
                }else {
                    res.send({r: 'can be used'});
                }
            }
        })
    }
})

app.post('/login', (req, res) => {
    if(req.body.username == "KoalaAdmin") {
        if(req.body.password == "Koala1234") {
            req.session.username = 'KoalaAdmin';
            res.redirect('category');
        }else {
            res.send({r: 'Not found'});
        }
    }else {
        users.findOne({username: req.body.username})
        .select('_id username password')
        .exec((err, data) => {
            if(!err) {
                if(data) {
                    let password = "Koa" + req.body.password + "la";
                    bcrypt.compare(password, data.password, (err, result) => {
                        if(result) {
                            req.session.username = data.username;
                            req.session.user_id = data._id;
                            res.redirect('category');
                        }else {
                            res.send({r: 'Not found'})
                        }
                    })
                }else {
                    res.send({r: 'Not found'})
                }
            }
        })
    }
})

app.post('/otp/:email', (req, res) => {
    setTimeout(() => req.session.otp = 0, 180000);
    req.session.otp = math.Mathematic.random(100000, 999999);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'warathep187@gmail.com',
        pass: process.env.EMAILPASSWORD
        }
    });
  
    var mailOptions = {
        from: 'warathep187@gmail.com',
        to: `${req.params.email}`,
        subject: 'Koala send you an OTP',
        html:
        `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600;color:#FFC107;">Koala</a></div><p style="font-size:1.1em">Hi,</p><p>Use the following OTP to complete your Sign Up procedures. OTP is valid for 3 minutes</p><h2 style="background: #FFC107;width: max-content;padding: 0 10px;color: #000;border-radius: 4px;">${req.session.otp}</h2><p style="font-size:0.9em;">Koala, online shopping</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Koala</p><p>Thailand</p></div></div></div>`
    };
  
    transporter.sendMail(mailOptions, function(error, info){});
    res.send();
})


app.get('/create-captcha', (req, res) => {
    let captcha = svgCaptcha.create({
        size: 5, noise: 3, background: '#def'
    })
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200);
    res.send(captcha.data);
})

app.get('/forget-password', (req, res) => {
    req.session.forget = true;
    res.render('forget-password');
})

app.post('/check-email', (req, res) => {
    if(req.body.email) {
        usersinformation.findOne({email: req.body.email})
        .exec((err, data) => {
            if(!err) {
                if(data) {
                    timeoutSet = setTimeout(() => req.session.otp = 0, 180000);
                    req.session.otp = math.Mathematic.random(100000, 999999);
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'warathep187@gmail.com',
                            pass: process.env.EMAILPASSWORD
                        }
                    });
                    
                    var mailOptions = {
                        from: 'warathep187@gmail.com',
                        to: `${data.email}`,
                        subject: 'Koala send you an OTP',
                        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koala</a></div><p style="font-size:1.1em">Hi,</p><p>Use the following OTP to comfirm your email. OTP is valid for 3 minutes</p><h2 style="background: #FFC107;width: max-content;padding: 0 10px;color: #000;border-radius: 4px;">${req.session.otp}</h2><p style="font-size:0.9em;">Koala, online shopping</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Koala</p><p>Thailand</p></div></div><div>`
                    };
                    
                    transporter.sendMail(mailOptions, function(error, info){});

                    res.send({
                        r: 'found',
                        username: data.username
                    })

                }else {
                    res.send({r: 'not found'})
                }
            }
        })
    }
})

app.post('/confirm-otp', (req, res) => {
    if(req.body.otp) {
        if(req.session.otp == req.body.otp) {
            req.session.otp = 0;
            clearTimeout(timeoutSet);
            usersinformation.findOne({email: req.body.email})
            .select('user_id username')
            .exec((err, data) => {
                if(!err) {
                    res.send({r: 'match', id: data.user_id})
                }
            })
        }else {
            res.send({r: 'not match'});
        }
    }
})

app.all('/change-password/:id', (req, res) => {
    if(!req.session.forget) {
        res.redirect('/');
    }
    else if(req.body.id && req.body.password && req.params.id == 1) {
        let password = "Koa" + req.body.password + "la";
        bcrypt.hash(password, 12, (err, hash) => {
            users.findByIdAndUpdate(req.body.id, {password: hash}, {useFindAndModify: false})
            .exec(err => {
                if(!err) {
                    res.send({r: 'Successfully'});
                }else {
                    res.send({r: "Error"});
                }
            })
        })
    }else {
        res.render('change-password', {
            id: req.params.id
        })
    }
})


//Admin route
app.get('/admin-orders', (req, res) => {
    if(req.session.username != 'KoalaAdmin') {
        res.redirect('/');
    }else {
        transfer.find()
        .select('_id buy_time result cancel confirm')
        .sort({buy_time: -1})
        .exec((err, data) => {
            if(!err) {
                res.render('admin-orders', {
                    admin: true,
                    number: data.length,
                    data: data
                })
            }
        })
    }
})

app.get('/admin-manage-products', (req, res) => {
    if(req.session.username != 'KoalaAdmin' || !req.session.username) {
        res.redirect('/');
    }else {
        usersproduct.find()
        .select('_id product_name shop_id')
        .sort({_id: -1})
        .exec((err, data) => {
            if(!err) {
                res.render('admin-manage-products', {
                    admin: true,
                    data: data
                })
            }
        })
    }
})

app.post('/confirm-or-cancel/:id', (req, res) => {
    if(req.body.type === 'confirm') {
        transfer.findByIdAndUpdate(req.params.id, {confirm: true}, {useFindAndModify: false})
        .exec((err, dataFromTransfer) => {
            if(!err) {
                cart.updateMany({_id: {$in: dataFromTransfer.cart_id}, status: 'preparing', confirm: false, cancel: false}, {confirm: true}, {useFindAndModify: false})
                .exec(err => {
                    if(!err) {
                        res.send({})
                    }
                })
            }
        })
    }else if(req.body.type === 'cancel') {
        transfer.findByIdAndUpdate(req.params.id, {cancel: true}, {useFindAndModify: false})
        .exec((err, dataFromTransfer) => {
            if(!err) {
                cart.updateMany({_id: {$in: dataFromTransfer.cart_id}, status: 'preparing', confirm: false, cancel: false}, {cancel: true, status: 'cancel'}, {useFindAndModify: false})
                .exec(err => {
                    if(!err) {
                        let i = 0;
                        start(i);
                        function start(i) {
                            cart.find({_id: {$in: dataFromTransfer.cart_id}})
                            .select('product_id product_type')
                            .exec((err, data) => {
                                if(!err) {
                                    if(i === data.length) {
                                        return 1;
                                    }
                                    makeNewArr(data[i].product_id, data[i].product_type);
                                }
                            })
                        }
                        function makeNewArr(id, type) {
                            let typeArr = [];
                            return usersproduct.findById(id)
                            .select('product_type')
                            .exec((err, dataFromProduct) => {
                                if(!err) {
                                    if(type.length === 3) {
                                        for(let t of dataFromProduct.product_type) {
                                            if(t[0] === type[0]) {
                                                let newArr = [t[0], t[1], (t[2] + type[2])];
                                                typeArr.push(newArr);
                                            }else  {
                                                typeArr.push(t)
                                            }
                                        }
                                        return updating(typeArr, id);
                                    }else if(type.length === 2) {
                                        let newArr = [dataFromProduct.product_type[0][0], (dataFromProduct.product_type[0][1] + type[1])]
                                        typeArr.push(newArr);
                                        return updating(typeArr, id);
                                    }
                                }
                            })
                        }
                        function updating(arr, id) {
                            return usersproduct.findByIdAndUpdate(id, {product_type: arr}, {new: true})
                            .select('_id product_type')
                            .exec(err => {
                                return start(++i);
                            })
                        }
                    }
                })
            }
        })
    }
})

app.get('/admin-view-payment-products/:paymentID', (req, res) => {
    if(req.session.username === "KoalaAdmin") {
        transfer.findById(req.params.paymentID)
        .select('buyer_id slip_image cart_id cancel confirm result')
        .exec((err, dataFromTransfer) => {
            cart.find({_id: {$in: dataFromTransfer.cart_id}, in_payment: true})
            .exec((err, data) => {
                if(!err) {
                    res.render('admin-view-payment-products', {
                        dataFromTransfer: dataFromTransfer,
                        admin: true,
                        data: data
                    })
                }
            })
        })
    }else {
        res.redirect('/');
    }
})

app.get('/admin-shop-information', (req, res) => {
    if(req.session.username != "KoalaAdmin") {
        res.redirect('/');
    }else {
        usersinformation.findOne({user_id: req.query.s})
        .exec((err, data) => {
            if(!err) {
                res.render('admin-shop-information', {
                    admin: true,
                    data: data
                })
            }
        })
    }
})

app.get('/admin-buyer-information', (req, res) => {
    if(req.session.username === "KoalaAdmin") {
        usersinformation.findOne({user_id: req.query.b})
        .exec((err, data) => {
            if(!err) {
                usersaddress.find({user_id: req.query.b})
                .select('address')
                .exec((err, addresses) => {
                    res.render('admin-buyer-information', {
                        admin: true,
                        data: data,
                        addresses: addresses
                    })
                })
            }
        })
    }else {
        res.redirect('/');
    }
})

app.get('/delete-comment', (req, res) => {
    if(req.session.username === "KoalaAdmin") {
        productscomment.deleteOne({_id: req.query.i})
        .exec(err => {
            if(!err) {
                res.redirect('/view-product/' + req.query.p);
            }
        })
    }else {
        res.redirect('/');
    }
})


//About products route.
app.all('/category', (req, res) => {
    if(req.session.username == 'KoalaAdmin') {
        res.render('category', {
            admin: true
        })
    }else if(!req.session.username) {
        res.render('category', {
            guest: "Guest"
        });
    }else if(req.session.username != 'KoalaAdmin') {
        cart.find({buyer_id: req.session.user_id, in_payment: false})
        .exec((err, result) => {
            res.render('category', {
                username: req.session.username,
                user_id: req.session.user_id,
                number: result.length
            });
        })
    }
})
//Searching
app.get('/search-all', (req, res) => {
    if(req.query.term.trim() == '') {
        return [];
    }
    let reg = new RegExp('^'+req.query.term.trim());
    usersproduct.find({product_name: {$regex: reg, $options: 'i'}})
    .select('product_name')
    .limit(6)
    .exec((err, result) => {
        if(!err) {
            let arr = [];
            for(let r of result) {
                arr.push(r.product_name);
            }
            res.send(arr);
        }
    })
})

app.get('/view-search-products', (req, res) => {
    if(!req.session.username) {
        let reg = new RegExp('^'+req.query.search.trim());
        usersproduct.find({product_name: {$regex: reg, $options: 'i'}})
        .select('_id product_name product_image product_type product_sold')
        .sort({product_sold: -1})
        .exec((err, data) => {
            if(!err) {
                res.render('view-search-products', {
                    guest: 'guest',
                    data: data,
                    search: req.query.search,
                })
            }
        })
    }else if(req.session.username === 'KoalaAdmin') {
        let reg = new RegExp('^'+req.query.search.trim());
        usersproduct.find({product_name: {$regex: reg, $options: 'i'}})
        .select('_id product_name product_image product_type product_sold')
        .sort({product_sold: -1})
        .exec((err, data) => {
            if(!err) {
                res.render('view-search-products', {
                    admin: true,
                    data: data,
                    search: req.query.search
                })
            }
        })
    }else {
        let reg = new RegExp('^'+req.query.search.trim());
        usersproduct.find({product_name: {$regex: reg, $options: 'i'}})
        .select('_id product_name product_image product_type product_sold')
        .sort({product_sold: -1})
        .exec((err, data) => {
            if(!err) {
                cart.find({buyer_id: req.session.user_id, in_payment: false})
                .select('_id')
                .exec((err, result) => {
                    res.render('view-search-products', {
                        username: req.session.username,
                        user_id: req.session.user_id,
                        data: data,
                        search: req.query.search,
                        number: result.length
                    })
                })
            }
        })
    }
})

app.get('/category/products/:cate', (req, res) => {
    if(req.session.username === 'KoalaAdmin') {
        let cate = req.params.cate;
        cate = cate.replace(/-/g, ' ');
        cate = cate.charAt(0).toLocaleUpperCase() + cate.slice(1);
        usersproduct.find({product_category: cate})
        .select('_id product_name product_image product_type product_sold')
        .sort({product_sold: -1})
        .exec((err, data) => {
            if(!err) {
                res.render('products', {
                    admin: true,
                    data: data,
                    product_category: req.params.cate
                })
            }
        })
    }else {
        let cate = req.params.cate;
        cate = cate.replace(/-/g, ' ');
        cate = cate.charAt(0).toLocaleUpperCase() + cate.slice(1);
        usersproduct.find({product_category: cate})
        .select('_id product_name product_image product_type product_sold')
        .sort({product_sold: -1})
        .exec((err, data) => {
            if(!err) {
                if(!req.session.username) {
                    res.render('products', {
                        guest: 'Guest',
                        product_category: req.params.cate,
                        data: data
                    })
                }else {
                    cart.find({buyer_id: req.session.user_id, in_payment: false})
                    .exec((err, result) => {
                        res.render('products', {
                            product_category: req.params.cate,
                            username: req.session.username,
                            data: data,
                            number: result.length
                        });
                    })
                }
            }
        })
    }
})

app.get('/view-product/:id', (req, res) => {
    if(req.session.username === "KoalaAdmin") {
        usersproduct.findById(req.params.id)
        .exec((err, data) => {
            if(!err) {
                users.findById(data.shop_id)
                .exec((err, u) => {
                    if(!err) {
                        productscomment.find({product_id: req.params.id})
                        .sort({date: -1})
                        .exec((err, comments) => {
                            if(!err) {
                                let sum = 0;
                                for(let c of comments) {
                                    sum += c.point
                                }
                                let avg = parseFloat((sum / comments.length).toFixed(1));
                                if(Number.isNaN(avg)) {
                                    avg = "no reviews";
                                }
                                res.render('view-product', {
                                    user_id: req.session.user_id,
                                    product_id: req.params.id,
                                    admin: 1,
                                    data: data,
                                    shopName: u.username,
                                    comments: comments,
                                    avg: avg
                                })
                            }
                        })
                    }
                })
            }
        })
    }else {
        usersproduct.findById(req.params.id)
        .exec((err, data) => {
            if(!err) {
                users.findById(data.shop_id)
                .exec((err, u) => {
                    productscomment.find({product_id: req.params.id})
                    .sort({date: -1})
                    .exec((err, comments) => {
                        if(!err) {
                            let sum = 0;
                            for(let c of comments) {
                                sum += c.point
                            }
                            let avg = parseFloat((sum / comments.length).toFixed(1));
                            if(Number.isNaN(avg)) {
                                avg = "no reviews";
                            }
                            if(!req.session.username) {
                                res.render('view-product', {
                                    product_id: req.params.id,
                                    guest: 'guest',
                                    data: data,
                                    shopName: u.username,
                                    comments: comments,
                                    avg: avg,
                                })
                            }else {
                                cart.find({buyer_id: req.session.user_id, in_payment: false})
                                .exec((err, result) => {
                                    res.render('view-product', {
                                        username: req.session.username,
                                        user_id: req.session.user_id,
                                        product_id: req.params.id,
                                        data: data,
                                        shopName: u.username,
                                        comments: comments,
                                        avg: avg,
                                        number: result.length
                                    })
                                })
                            }
                        }
                    })
                })
            }
        })
    }
})

//User information route.
app.get('/user-information', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersinformation.findOne({user_id: req.session.user_id})
        .exec((err, dataFromInfo) => {
            if(!err) {
                usersaddress.find({user_id: req.session.user_id})
                .select('address')
                .exec((err, dataFromAddress) => {
                    if(!err) {
                        cart.find({buyer_id: req.session.user_id, in_payment: false})
                        .exec((err, result) => {
                            res.render('user-information', {
                                user_id: req.session.user_id,
                                username: dataFromInfo.username,
                                email: dataFromInfo.email,
                                address: dataFromAddress,
                                tel: dataFromInfo.tel,
                                number: result.length,
                                fullName: dataFromInfo.full_name,
                                bank: dataFromInfo.bank,
                                bank_number: dataFromInfo.bank_number
                            })
                        })
                    }
                })
            }
        })
    }
})

app.post('/add-new-address', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersaddress.insertMany([{user_id: req.session.user_id, address: req.body.newAddress}], err => {
            res.redirect('/user-information');
        })
    }
})

app.post('/update-user-information', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersinformation.updateOne({user_id: req.session.user_id}, {full_name: req.body.fullName, bank: req.body.bank, bank_number: req.body.bankNumber}, {useFindAndModify: false})
        .exec(err => {
            if(!err) {
                if(req.body.address3) {
                    usersaddress.find({user_id: req.session.user_id})
                    .select('address')
                    .exec((err, dataAddresses) => {
                        const thirdUpdate = (arr) => {
                            usersaddress.updateOne({user_id: req.session.user_id, address: {$nin: arr}}, {address: req.body.address3}, {useFindAndModify: false})
                            .exec(err => {
                                res.redirect('/user-information')
                            })
                        }
                        const secondUpdate = (arr) => {
                            usersaddress.updateOne({user_id: req.session.user_id, address: {$nin: arr}}, {address: req.body.address2}, {useFindAndModify: false})
                            .exec(err => {
                                arr.push(req.body.address2)
                                thirdUpdate(arr);
                            })
                        }
                        usersaddress.updateOne({user_id: req.session.user_id}, {address: req.body.address1}, {useFindAndModify: false})
                        .exec(err => {
                            secondUpdate([req.body.address1]);
                        })
                    })
                }else if(req.body.address2) {
                    const secondUpdate = (arr) => {
                        usersaddress.updateOne({user_id: req.session.user_id, address: {$nin: arr}}, {address: req.body.address2}, {useFindAndModify: false})
                        .exec(err => {
                            res.redirect('/user-information')
                        })
                    }
                    usersaddress.updateOne({user_id: req.session.user_id}, {address: req.body.address1}, {useFindAndModify: false})
                    .exec(err => {
                        secondUpdate([req.body.address1]);
                    })
                }else if(req.body.address1) {
                    usersaddress.updateOne({user_id: req.session.user_id}, {address: req.body.address1}, {useFindAndModify: false})
                    .exec(err => {
                        res.redirect('/user-information')
                    })
                }
            }
        })
    }
})


//Add product route.
app.all('/add-product', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        if(req.method == 'POST') {
            let form = formidable.IncomingForm({ multiples: true });
            form.parse(req, (err, fields, files) => {
                if(!err) {
                    let images = files.image;
                    if(!Array.isArray(images)) {
                        images = [files.image];
                    }
                    let fname = [];
                    images.forEach((image, index) => {
                        let path = 'public/product-images-uploaded/'
                        let newName;
                        newName = req.session.user_id + '_' + math.Mathematic.random(100000, 999999) + '_' + index + '.' + image.name.split('.')[1];
                        while(fs.existsSync(path + newName)) {
                            newName = req.session.user_id + '_' + math.Mathematic.random(100000, 999999) + '_' + index + '.' + image.name.split('.')[1];
                        }
                        fname.push(newName);
                        fs.renameSync(image.path, path+newName, err => {})
                    })
                    let arr = [];
                    if(fields.price) {
                        arr = [[parseFloat(fields.price), parseInt(fields.number)]];
                    }else {
                        tArray = fields.hiddenType.split(', ');
                        pArray = fields.hiddenPrice.split(', ');
                        nArray = fields.hiddenNumber.split(', ');
                        for(let i in tArray) {
                            arr.push([tArray[i], parseFloat(pArray[i]), parseInt(nArray[i])]);
                        }
                    }
                    let info = fields.information.replace(/\n/g, '<br>');
                    usersproduct.insertMany([{shop_id: req.session.user_id, product_image: fname, product_name: fields.name, product_information: info, product_type: arr, product_category: fields.cate}], err => {
                        res.redirect('/manage-product');
                    })
                }
            })
        }else {
            cart.find({buyer_id: req.session.user_id, in_payment: false})
            .exec((err, result) => {
                res.render('add-product', {
                    username: req.session.username,
                    number: result.length
                })
            })
        }
    }
})


//Manage products route.
app.get('/manage-product', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersproduct.find({shop_id: req.session.user_id})
        .select('product_name product_sold product_category')
        .sort({_id: -1})
        .exec((err, data) => {
            if(!err) {
                cart.find({buyer_id: req.session.user_id, in_payment: false})
                .exec((err, result) => {
                    res.render('manage-product', {
                        username: req.session.username,
                        data: data,
                        number: result.length
                    })
                })
            }
        })
    }
})

app.get('/edit-product/:id', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersproduct.findById(req.params.id)
        .exec((err, data) => {
            if(!err) {
                res.render('edit-product', {
                    username: req.session.username,
                    data: data
                })
            }
        })
    }
})

app.post('/update-product-info/:id', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        if(req.body.types) {
            let id = req.params.id;
            let name = req.body.name;
            let information = req.body.information.replace(/\n/g, '<br>');
            let cate = req.body.cate.replace('#', '');
            let types = req.body.types.split(', ');
            let prices = req.body.prices.split(', ');
            let numbers = req.body.numbers.split(', ');
            let arr = [];
            for(let i=0; i<types.length; i++) {
                arr.push([types[i], parseInt(prices[i]), parseInt(numbers[i])])
            }
            usersproduct.findByIdAndUpdate(id, {product_name: name, product_category: cate, product_information: information, product_type: arr}, {new: true})
            .select('_id product_type product_name')
            .exec((err, dataFromProduct) => {
                if(!err) {
                    if(dataFromProduct.product_name != name) {
                        cart.updateMany({product_id: id}, {product_name: name}, {useFindAndModify: false})
                        .exec(err => {})
                    }
                    cart.find({product_id: dataFromProduct._id, in_payment: false})
                    .select('_id product_type')
                    .exec((err, dataFromCart) => {
                        let i = 0;
                        const deleteFromCart = (i) => {
                            if(i === dataFromCart.length) {
                                return 1;
                            }
                            let cartType = dataFromCart[i].product_type[0];
                            let filteredProductType = dataFromProduct.product_type.filter(d => d[0] === cartType);
                            if(dataFromCart[i].product_type[2] > filteredProductType[0][2]) {
                                cart.deleteOne({_id: dataFromCart[i]._id})
                                .exec(err => {
                                    return deleteFromCart(++i);
                                })
                            }
                        }
                        deleteFromCart(i);
                    })
                    res.send({});
                }
            });
        }else if(!req.body.types) {
            let id = req.params.id;
            let name = req.body.name;
            let information = req.body.information.replace(/\n/g, '<br>');
            let cate = req.body.cate.replace('#', '');
            let price = parseInt(req.body.price);
            let number = parseInt(req.body.number);
            let arr = [[price, number]];
            usersproduct.findByIdAndUpdate(id, {product_name: name, product_category: cate, product_information: information, product_type: arr}, {new: true})
            .exec((err, dataFromProduct) => {
                if(!err) {
                    if(dataFromProduct.product_name != name) {
                        cart.updateMany({product_id: id}, {product_name: name}, {useFindAndModify: false})
                        .exec(err => {})
                    }
                    cart.find({product_id: dataFromProduct._id, in_payment: false})
                    .select('_id product_type')
                    .exec((err, dataFromCart) => {
                        let i = 0;
                        const deleteFromCart = (i) => {
                            if(i === dataFromCart.length) {
                                return 1;
                            }
                            if(dataFromCart[i].product_type[1] > dataFromProduct.product_type[0][1]) {
                                cart.deleteOne({_id: dataFromCart[i]._id})
                                .exec(err => {
                                    return deleteFromCart(++i);
                                })
                            }
                        }
                        deleteFromCart(i);
                    })
                    res.send({});
                }
            });
        }
    }
})

app.get('/delete-product/:id', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersproduct.findByIdAndDelete(req.params.id)
        .select('_id product_image')
        .exec((err, data) => {
            if(!err) {
                let images = data.product_image;
                let path = 'public/product-images-uploaded/'
                for(let i of images) {
                    fs.unlink(path+i, err => {})
                }
                cart.deleteMany({product_id: data._id})
                .exec(err => (req.session.username === "KoalaAdmin") ? res.redirect('/admin-manage-products'): res.redirect('/manage-product'));
            }
        })
    }
})


//Cart route.
app.get('/cart', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        cart.find({buyer_id: req.session.user_id, in_payment: false})
        .sort({_id: -1})
        .exec((err, dataFromCart) => {
            if(!err) {
                res.render('cart', {
                    username: req.session.username,
                    dataFromCart: dataFromCart,
                    number: dataFromCart.length
                })
            }
        })
    }
})

app.post('/add-to-cart', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        if(req.body.type) {
            cart.find({buyer_id: req.session.user_id, product_id: req.body.product_id, product_type: {$in: req.body.type}, in_payment: false})
            .exec((err, data) => {
                if(data.length > 0) {
                    if(!err) {
                        let addProductNumber = parseInt(data[0].product_type[2]) + parseInt(req.body.number);
                        let newPrice = parseInt(req.body.price) * parseInt(addProductNumber);
                        cart.findOneAndUpdate({buyer_id: req.session.user_id, product_id: req.body.product_id, product_type: {$in: req.body.type}, in_payment: false}, {product_type: [req.body.type, newPrice, addProductNumber]}, {useFindAndModify: false})
                        .exec(err => {
                        })
                    }
                }else {
                    usersproduct.findById(req.body.product_id)
                    .exec((err, dataFromProduct) => {
                        if(!err) {
                            let arr = [req.body.type, parseInt(req.body.number) * parseInt(req.body.price), parseInt(req.body.number)];
                            cart.insertMany([{
                                product_image: dataFromProduct.product_image[0],
                                product_name: dataFromProduct.product_name,
                                shop_id: dataFromProduct.shop_id,
                                buyer_id: req.session.user_id,
                                product_id: req.body.product_id,
                                product_type: arr
                            }])
                        }
                    })
                }
            })
        }else {
            cart.find({buyer_id: req.session.user_id, product_id: req.body.product_id, in_payment: false})
            .exec((err, data) => {
                if(data.length > 0) {
                    if(!err) {
                        let addProductNumber = parseInt(data[0].product_type[1]) + parseInt(req.body.number);
                        let newPrice = addProductNumber * parseInt(req.body.price);
                        cart.findOneAndUpdate({buyer_id: req.session.user_id, product_id: req.body.product_id}, {product_type: [newPrice, addProductNumber], in_payment: false}, {useFindAndModify: false})
                        .exec(err => {
                        })
                    }
                }else {
                    usersproduct.findById(req.body.product_id)
                    .exec((err, dataFromProduct) => {
                        if(!err) {
                            let arr = [parseInt(req.body.number) * parseInt(req.body.price), parseInt(req.body.number)];
                            cart.insertMany([{
                                product_image: dataFromProduct.product_image[0],
                                product_name: dataFromProduct.product_name,
                                shop_id: dataFromProduct.shop_id,
                                buyer_id: req.session.user_id,
                                product_id: req.body.product_id,
                                product_type: arr
                            }])
                        }
                    })
                }
            })
        }
        res.send({r: "success"});
    }
})

app.post('/cal-result', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        cart.find({_id: {$in: req.body.arrCartId}, in_payment: false})
        .exec((err, data) => {
            if(!err) {
                let result = 0;
                for(let d of data) {
                    if(d.product_type.length === 3) {
                        result += d.product_type[1]
                    }else {
                        result += d.product_type[0]
                    }
                }
                res.send({r: result});
            }
        })
    }
})

app.post('/delete-in-cart', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        cart.deleteMany({_id: {$in: req.body.arrForDelete}})
        .exec((err, data) => {
            if(!err) {
                res.send({r: 1});
            }
        })
    }
})

//**************************************
app.post('/buy-product', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        if(req.body.type) {
            usersproduct.findById(req.body.product_id)
            .exec((err, dataFromProduct) => {
                if(!err) {
                    let arr = [req.body.type, parseInt(req.body.number) * parseInt(req.body.price), parseInt(req.body.number)];
                    let dataForInsert = {
                        product_image: dataFromProduct.product_image[0],
                        product_name: dataFromProduct.product_name,
                        shop_id: dataFromProduct.shop_id,
                        buyer_id: req.session.user_id,
                        product_id: req.body.product_id,
                        product_type: arr
                    }
                    cart.create(dataForInsert, (err, newData) => {
                        if(!err) {
                            res.send({id: newData._id})
                        }
                    })
                }
            })
        }else {
            usersproduct.findById(req.body.product_id)
            .exec((err, dataFromProduct) => {
                if(!err) {
                    let arr = [parseInt(req.body.number) * parseInt(req.body.price), parseInt(req.body.number)];
                    let dataForInsert = {
                        product_image: dataFromProduct.product_image[0],
                        product_name: dataFromProduct.product_name,
                        shop_id: dataFromProduct.shop_id,
                        buyer_id: req.session.user_id,
                        product_id: req.body.product_id,
                        product_type: arr
                    }
                    cart.create(dataForInsert, (err, newData) => {
                        if(!err) {
                            res.send({id: newData._id})
                        }
                    })
                }
            })
        }
    }
})
//**************************************

app.get('/cart/payment/:id', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        let sum = 0;
        cart.findOne({_id: req.params.id, in_payment: false})
        .exec((err, data) => {
            if(!err) {
                sum = (data.product_type.length === 3) ? data.product_type[1] : data.product_type[0];
                usersaddress.find({user_id: req.session.user_id})
                .exec((err, dataFromAddress) => {
                    let arrAddresses = [];
                    if(!err) {
                        for(let a of dataFromAddress) {
                            arrAddresses.push(a.address);
                        }
                    }
                    cart.find({buyer_id: req.session.user_id, in_payment: false})
                    .exec((err, dataFromCart) => {
                        usersinformation.findOne({user_id: req.session.user_id})
                        .select('full_name')
                        .exec((err, dataFromUser) => {
                            res.render('payment', {
                                username: req.session.username,
                                user_id: req.session.user_id,
                                data: [data],
                                sum: sum,
                                address: arrAddresses,
                                number: dataFromCart.length,
                                fullName: dataFromUser.full_name
                            })
                        })
                    })
                })
            }
        })
    }
})

app.post('/cart/payment', (req, res) => {
    if(req.session.username) {
        let sum = 0;
        let arrChecked = req.body.checked.split(' ');
        cart.find({_id: {$in: arrChecked}, in_payment: false})
        .exec((err, data) => {
            if(!err) {
                for(let i of data) {
                    if(i.product_type.length === 3) {
                        sum += i.product_type[1];
                    }else if(i.product_type.length === 2) {
                        sum += i.product_type[0];
                    }
                }
                usersaddress.find({user_id: req.session.user_id})
                .exec((err, dataFromAddress) => {
                    let arrAddresses = [];
                    if(!err) {
                        for(let a of dataFromAddress) {
                            arrAddresses.push(a.address);
                        }
                    }
                    cart.find({buyer_id: req.session.user_id, in_payment: false})
                    .exec((err, dataFromCart) => {
                        usersinformation.findOne({user_id: req.session.user_id})
                        .select('full_name')
                        .exec((err, dataFromUser) => {
                            res.render('payment', {
                                username: req.session.username,
                                user_id: req.session.user_id,
                                data: data,
                                sum: sum,
                                address: arrAddresses,
                                number: dataFromCart.length,
                                fullName: dataFromUser.full_name
                            })
                        })
                    })
                })
            }
        })
    }else {
        res.redirect('/');
    }
})

app.post('/cart/payment/transfer', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }
    else {
        let form = formidable.IncomingForm({ multiples: true });
        form.parse(req, (err, fields, files) => {
            if(!err) {
                let sum = parseInt(fields.sum);
                let cartIdsArr = fields.cartId.split(' ').slice(1);
                let dateTime = new Date();
                let combineNamAndAddress = fields.name + "\n" + fields.address; 
                combineNamAndAddress = combineNamAndAddress.replace(/\n/g, '<br>')
                cart.find({_id: {$in: cartIdsArr}})
                .select('product_type product_id')
                .exec((err, dataForUpdateSold) => {
                    if(!err) {
                        for(let d of dataForUpdateSold) {
                            let sold = (d.product_type.length == 3) ? d.product_type[2]: d.product_type[1];
                            usersproduct.updateOne({_id: d.product_id}, {$inc: {product_sold: sold}})
                            .exec(err => {});
                        }
                    }
                })
                let i = 0;
                start(i);
                function start(i) {
                    cart.find({_id: {$in: cartIdsArr}})
                    .select('product_id product_type')
                    .exec((err, data) => {
                        if(!err) {
                            if(i === data.length) {
                                return 1;
                            }
                            makeNewArr(data[i].product_id, data[i].product_type);
                        }
                    })
                }
                function makeNewArr(id, type) {
                    let typeArr = [];
                    return usersproduct.findById(id)
                    .select('product_type')
                    .exec((err, dataFromProduct) => {
                        if(!err) {
                            if(type.length === 3) {
                                for(let t of dataFromProduct.product_type) {
                                    if(t[0] === type[0]) {
                                        let newArr = [t[0], t[1], (t[2] - type[2] < 0) ? 0: (t[2] - type[2])];
                                        typeArr.push(newArr);
                                    }else  {
                                        typeArr.push(t)
                                    }
                                }
                                return updating(typeArr, id);
                            }else if(type.length === 2) {
                                let newArr = [dataFromProduct.product_type[0][0], (dataFromProduct.product_type[0][1] - type[1] < 0) ? 0: (dataFromProduct.product_type[0][1] - type[1])]
                                typeArr.push(newArr);
                                return updating(typeArr, id);
                            }
                        }
                    })
                }
                function updating(arr, id) {
                    return usersproduct.findByIdAndUpdate(id, {product_type: arr}, {new: true})
                    .select('_id product_type')
                    .exec((err, dataFromProduct) => {
                        cart.find({product_id: id, in_payment: false})
                        .select('_id product_type')
                        .exec((err, dataFromCart) => {
                            let j = 0;
                            const deleteFromCart = (j) => {
                                if(j === dataFromCart.length) {
                                    return 1;
                                }
                                if(dataFromProduct.product_type[0].length === 3) {
                                    let typeCart = dataFromCart[j].product_type[0];
                                    let numberCart = dataFromCart[j].product_type[2];
                                    let filteredTypeProduct = dataFromProduct.product_type.filter(data => data[0] === typeCart);
                                    if(numberCart > filteredTypeProduct[0][2]) {
                                        cart.deleteOne({_id: dataFromCart[j]._id, in_payment: false})
                                        .exec(err => {
                                            return deleteFromCart(++j);
                                        });
                                    }
                                }else if(dataFromProduct.product_type[0].length === 2) {
                                    let numberCart = dataFromCart[j].product_type[1];
                                    if(numberCart > dataFromProduct.product_type[0][1]) {
                                        cart.deleteOne({_id: dataFromCart[j]._id, in_payment: false})
                                        .exec(err => {
                                            return deleteFromCart(++j);
                                        });
                                    }
                                }
                            }
                            deleteFromCart(j);
                            return start(++i);
                        })
                    })
                }
                cart.updateMany({_id: {$in: cartIdsArr}}, {in_payment: true, buy_time: dateTime, address: combineNamAndAddress}, {useFindAndModify: false})
                .exec(err => {
                    if(!err) {
                        let image = files.slip;
                        let path = 'public/slip-images/';
                        let fileType = image.name.split('.')[1];
                        let newName = req.session.user_id + "_" + math.Mathematic.random(100000, 999999) + "." + fileType;
                        while(fs.existsSync(path + newName)) {
                            newName = req.session.user_id + '_' + math.Mathematic.random(100000, 999999) + '.' + fileType;
                        }
                        console.log(fileType);
                        fs.renameSync(image.path, path + newName, err => {
                            if(err) throw err.message;
                        })
                        transfer.insertMany([{
                            slip_image: newName,
                            cart_id: cartIdsArr,
                            buy_time: dateTime,
                            buyer_id: req.session.user_id,
                            result: sum
                        }], err => {
                            res.redirect('/payment-list');
                        })
                    }
                })
            }
        })
    }
})


//Payment route.
app.get('/payment-list', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        transfer.find({buyer_id: req.session.user_id})
        .sort({buy_time: -1})
        .exec((err, data) => {
            if(!err) {
                cart.find({buyer_id: req.session.user_id, in_payment: false})
                .select('_id')
                .exec((err, dataFromCart) => {
                    res.render('payment-list', {
                        username: req.session.username,
                        data: data,
                        number: dataFromCart.length
                    })
                })
            }
        })
    }
})

app.post('/cancel-order', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        function redirect() {
            res.send({
                url: '/payment-list'
            })
        }
        let transfer_id = req.body.transfer_id;
        transfer.findById(transfer_id)
        .select('cart_id')
        .exec((err, data) => {
            if(!err) {
                cart.updateMany({_id: {$in: data.cart_id}}, {status: "cancel"}, {useFindAndModify: false})
                .exec(err => {
                    if(!err) {
                        transfer.updateOne({_id: transfer_id}, {cancel: true, confirm: false}, {useFindAndModify: false})
                        .exec(err => {
                            if(!err) {
                                for(let c of data.cart_id) {
                                    cart.findById(c)
                                    .select('product_id product_type')
                                    .exec((err, dataFromCart) => {
                                        if(!err) {

                                            let i = 0;
                                            start(i);
                                            function start(i) {
                                                cart.find({_id: {$in: data.cart_id}})
                                                .select('product_id product_type')
                                                .exec((err, data) => {
                                                    if(!err) {
                                                        if(i === data.length) {
                                                            return 1;
                                                        }
                                                        makeNewArr(data[i].product_id, data[i].product_type);
                                                    }
                                                })
                                            }
                                            function makeNewArr(id, type) {
                                                let typeArr = [];
                                                return usersproduct.findById(id)
                                                .select('product_type')
                                                .exec((err, dataFromProduct) => {
                                                    if(!err) {
                                                        if(type.length === 3) {
                                                            for(let t of dataFromProduct.product_type) {
                                                                if(t[0] === type[0]) {
                                                                    let newArr = [t[0], t[1], (t[2] + type[2])];
                                                                    typeArr.push(newArr);
                                                                }else  {
                                                                    typeArr.push(t)
                                                                }
                                                            }
                                                            return updating(typeArr, id);
                                                        }else if(type.length === 2) {
                                                            let newArr = [dataFromProduct.product_type[0][0], (dataFromProduct.product_type[0][1] + type[1])]
                                                            typeArr.push(newArr);
                                                            return updating(typeArr, id);
                                                        }
                                                    }
                                                })
                                            }
                                            function updating(arr, id) {
                                                return usersproduct.findByIdAndUpdate(id, {product_type: arr}, {new: true})
                                                .select('_id product_type')
                                                .exec(err => {
                                                    return start(++i);
                                                })
                                            }

                                            let sold = (dataFromCart.product_type.length == 3) ? dataFromCart.product_type[2]: dataFromCart.product_type[1];
                                            usersproduct.findByIdAndUpdate(dataFromCart.product_id, {$inc: {product_sold: -sold}}, {useFindAndModify: false})
                                            .exec(err => {
                                            })
                                        }
                                    })
                                }
                                redirect();
                            }
                        })
                    }
                })
            }
        })
    }
})

app.get('/payment-list/view-payment-products/:transferId', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        transfer.findById(req.params.transferId)
        .exec((err, data) => {
            if(!err) {
                cart.find({_id: {$in: data.cart_id}, in_payment: true})
                .exec((err, result) => {
                    if(!err) {
                        cart.find({buyer_id: req.params.id, in_payment: false})
                        .exec((err, dataFromCart) => {
                            if(!err) {
                                res.render('view-payment-products', {
                                    username: req.session.username,
                                    data: result,
                                    transfer: req.params.transferId,
                                    number: dataFromCart.length
                                })
                            }
                        })
                    } 
                })
            }
        })
    }
})


//Order route.
app.get('/order', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        cart.find({shop_id: req.session.user_id, in_payment: true})
        .sort({buy_time: -1})
        .exec((err, data) => {
            if(!err) {
                cart.find({buyer_id: req.session.user_id, in_payment: false})
                .exec((err, dataFromCart) => {
                    res.render('order', {
                        username: req.session.username,
                        data: data,
                        number: dataFromCart.length
                    })
                })
            }
        })
    }
})

app.post('/set-status/:id', (req, res) => {
    if(req.body['status-' + req.params.id] === 'shipped') {
        cart.findByIdAndUpdate(req.params.id, {status: req.body['status-' + req.params.id], shipped_time: new Date}, {useFindAndModify: false})
        .exec(err => {
            if(!err) {
                res.redirect('/order');
            }
        })
        return;
    }
    cart.findByIdAndUpdate(req.params.id, {status: req.body['status-' + req.params.id]}, {useFindAndModify: false})
    .exec(err => {
        if(!err) {
            res.redirect('/order');
        }
    })
})


//Review route.
app.get('/review', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        usersproduct.findById(req.query.p)
        .select('product_image product_name')
        .exec((err, data) => {
            if(!err) {
                cart.find({buyer_id: req.session.user_id, in_payment: false})
                .select('_id')
                .exec((err, result) => {
                    res.render('review', {
                        username: req.session.username,
                        user_id: req.session.user_id,
                        product_id: req.query.p,
                        number: result.length,
                        transfer: req.query.t,
                        cart_id: req.query.c,
                        data: data
                    })
                })
            }
        })
    }
})

app.post('/reviewed', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        let form = formidable.IncomingForm({ multiples: true });
        form.parse(req, (err, fields, files) => {
            if(!err) {
                if(files.image.name != '') {
                    let image = files.image;
                    let path = 'public/review-images/'
                    let newName = req.session.user_id + '_' + math.Mathematic.random(100000, 999999) + '.' + image.name.split('.')[1];
                    while(fs.existsSync(path + newName)) {
                        newName = req.session.user_id + '_' + math.Mathematic.random(100000, 999999) + '.' + image.name.split('.')[1];
                    }
                    fs.renameSync(image.path, path+newName, err => {})
                    productscomment.insertMany([{date: new Date(), product_id: fields.product_id, review_image: newName, username: req.session.username, comment: fields.review, point: parseInt(fields.points)}])
                }else {
                    productscomment.insertMany([{date: new Date(), product_id: fields.product_id, review_image: "", username: req.session.username, comment: fields.review, point: parseInt(fields.points)}])
                }
                cart.updateOne({_id: fields.cart_id}, {status: 'received', review: true}, {useFindAndModify: false})
                .exec(err => res.redirect('/payment-list/view-payment-products/' + fields.transfer));
            }
        })
    }
})


//Sale history route.
app.get('/sale-history', (req, res) => {
    if(!req.session.username) {
        res.redirect('/');
    }else {
        const getDataFromPeriod = (period) => {
            let now = new Date();
            let laterStamp;
            if(req.query.p === '1week') {
                laterStamp = now.setDate(now.getDate() - period);
            }
            else if(req.query.p === '1month') {
                laterStamp = now.setMonth(now.getMonth() - period);
            }
            else if(req.query.p === '6months') {
                laterStamp = now.setMonth(now.getMonth() - period);
            }
            else if(req.query.p === '1year') {
                laterStamp = now.setFullYear(now.getFullYear() - period);
            }
            else if(req.query.p === '3years') {
                laterStamp = now.setFullYear(now.getFullYear() - period);
            }
            let later = new Date(laterStamp);
            cart.find({shop_id: req.session.user_id, in_payment: true, $or: [{status: "shipped"}, {status: "received"}], $and: [{buy_time: {$lte: new Date()}}, {buy_time: {$gte: later}}]})
            .select('product_image product_name product_id product_type buy_time')
            .sort({buy_time: -1})
            .exec((err, data) => {
                if(!err) {
                    cart.find({buyer_id: req.session.user_id, in_payment: false})
                    .select("_id")
                    .exec((err, result) => {
                        res.render('sale-history', {
                            user_id: req.session.user_id,
                            username: req.session.username,
                            data: data,
                            period: req.query.p,
                            number: result.length
                        })
                    })
                }
            })
        }
        if(req.query.p === '1week') {
            getDataFromPeriod(7);
        }else if(req.query.p === '1month') {
            getDataFromPeriod(1);
        }else if(req.query.p === '6months') {
            getDataFromPeriod(6);
        }else if(req.query.p === '1year') {
            getDataFromPeriod(1);
        }else if(req.query.p === '3years') {
            getDataFromPeriod(3);
        }else {
            res.render('sale-history', {
                username: req.session.username,
                user_id: req.session.user_id,
                error: true
            })
        }
    }
})


//Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
})

app.listen(8000, () => {
    console.log('Connected');
})