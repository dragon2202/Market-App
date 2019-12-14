/* 
DashBoard EJS

<!DOCTYPE html>
<!-- //http://programmerblog.net/nodejs-file-upload-tutorial/ -->
<head>
    <!-- Unused Code
       <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
        
        https://www.quackit.com/bootstrap/bootstrap_4/tutorial/bootstrap_modal.cfm
    -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
        integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <!-- Modal Window-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
        integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <!-- jQuery library -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
        integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"></script>

    <!-- Popper -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
        integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>

    <!-- Latest compiled and minified Bootstrap JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
        integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"></script>
    <!-- Modal Window-->
</head>


<body class="container">
    <% include ./partials/messages %>
    <main>
        <div class="main">
            <h1 class="mt-4">Dashboard</h1>
            <form action="/users/dashboard" method="POST">
                <div class="form-group">
                    <label for="product_name">Product Name</label>
                    <input type="product_name" id="product_name" name="product_name" class="form-control"
                        placeholder="Enter Product Name"
                        value="<%= typeof product_name != 'undefined' ? product_name : '' %>" />
                </div>
                <div class="form-group">
                    <label for="product_type">Product Type</label>
                    <input type="product_type" id="product_type" name="product_type" class="form-control"
                        placeholder="Enter Product Type"
                        value="<%= typeof product_type != 'undefined' ? product_type : '' %>" />
                </div>
                <div class="form-group">
                    <label for="stock">Stock</label>
                    <input type="number" id="stock" name="stock" class="form-control" placeholder="Enter Stock Number" min = "0"
                        value="<%= typeof stock != 'undefined' ? stock : '' %>" />
                </div>
                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" id="price" name="price" class="form-control" placeholder="Enter Price" min = "0" step = "0.01"
                        value="<%= typeof price != 'undefined' ? price : '' %>" />
                </div>
                <button type="submit" class="btn btn-primary btn-block">
                    Submit
                </button>
            </form>
            <div class="row">
                <div class="col-md-6 offset-md-3" style="background-color: #fff;margin-top: 25px;padding:20px;">
                    <h3> Product List </h3>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Product Type</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <% for(var i = 0; i < myVar.length; i++) { %>
                            <tr>
                                <td><%= myVar[i].product_name %></td>
                                <td><%= myVar[i].product_type %></td>
                                <td><%= myVar[i].stock %></td>
                                <td><%= myVar[i].price %></td>
                                <td>
                                    <button class="fa fa-pencil fa-lg" data-toggle="modal"
                                        data-target="#<%= i %>"></button>
                                    <!-- Modal -->
                                    <div class=" modal fade" id="<%= i %>" role="dialog">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h4 class="modal-title">Update Product</h4>
                                                    <button type="button" class="close"
                                                        data-dismiss="modal">&times;</button>
                                                </div>
                                                <div class="modal-body">
                                                    <form action="/users/update" method="POST">
                                                        <div class="form-group">
                                                            <label for="product_name">Product Name</label>
                                                            <input type="product_name" id="product_name"
                                                                name="product_name" class="form-control"
                                                                value="<%= myVar[i].product_name %>" />
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="product_type">Product Type</label>
                                                            <input type="product_type" id="product_type"
                                                                name="product_type" class="form-control"
                                                                value="<%= myVar[i].product_type %>" />
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="stock">Stock</label>
                                                            <input type="number" id="stock" name="stock" class="form-control" placeholder="Enter Stock Number" min = "0"
                                                             value="<%= myVar[i].stock %>" />
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="price">Price</label>
                                                            <input type="number" id="price" name="price" class="form-control" placeholder="Enter Price" min = "0" step = "0.01"
                                                                value="<%= myVar[i].price %>" />
                                                        </div>
                                                        <input type="hidden" id="ProductId" name="ProductId"
                                                            value="<%= myVar[i].id %>">
                                                        <button type="submit" class="btn btn-primary btn-block">
                                                            Submit
                                                        </button>
                                                    </form>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-default"
                                                        data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- DELETE-->
                                    <button class="fa fa-trash fa-lg" data-toggle="modal"
                                        data-target="#delete <%= i %>"></button>

                                    <div class=" modal fade" id="delete <%= i %>" role="dialog">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h4 class="modal-title">Delete Product</h4>
                                                    <button type="button" class="close"
                                                        data-dismiss="modal">&times;</button>
                                                </div>
                                                <div class="modal-body">
                                                    <p>
                                                        Are you sure you want to delete this product?
                                                        <br>
                                                        Press Delete to remove product.
                                                    </p>
                                                </div>
                                                <div class="modal-footer">
                                                    <form action="/users/delete" method="POST">
                                                        <input type="hidden" id="ProductId" name="ProductId"
                                                            value="<%= myVar[i].id %>">
                                                        <button type="submit" class="btn btn-default">Delete</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- DELETE-->
                                </td>
                            </tr>
                            <% } %>
                        </tbody>
                    </table>
                </div>
            </div>
            <a href="/users/logout" class="btn btn-secondary">Logout</a>
        </div>
    </main>
</body>


</html>



*/







/* 
User.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
//User Model
const User = require('../models/User');
//Product Model
const Product = require('../models/Product');
const { forwardAuthenticated } = require('../config/auth');
//Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

//Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

//Dashboard Page
router.get('/dashboard', forwardAuthenticated, (req, res) => res.render('dashboard', {myVar: myVar}));

//https://stackoverflow.com/questions/17206487/nodejs-expressjs-passportjs-for-admin-pages-only
//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    //Check Required Field
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    //Check password length
    if (password.length < 6) {
        errors.push({ msg: "Password should be at least 6 characters" })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User Exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hash
                            newUser.password = hash;
                            //Save User
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                        }))
                }
            });
    }
});


//Dashboard Handle
router.post('/dashboard', (req, res) => {
    const {product_name, product_type, stock, price} = req.body;
    let errors = [];
    //Check Required Field
    if(!product_name || !product_type || !stock || !price){
        errors.push({msg: 'Please fill in all fields'});
    }
    console.log(typeof(stock));
    console.log(stock);
    if(errors.length > 0){//TODO: implement checkers if stock and price are numbers
        Product.find({}, function(err, product) {//for refreshing the table
            if (err) throw err;
            myVar = product;
        });
        res.render('dashboard', {
            errors,
            product_name,
            product_type,
            stock,
            price
          });
    } else {
    Product.findOne({product_name: product_name})
        .then(product => {
            if(product){
                //Product exists
                errors.push({ msg: 'Product exists' })
                res.render('dashboard', {
                    errors,
                    product_name,
                    product_type, 
                    stock, 
                    price
                });
            } else {
                const newProduct = new Product({
                    product_name, 
                    product_type, 
                    stock, 
                    price
                });
                newProduct.save()
                .then(product => {
                    req.flash('success_msg', 'You have successfully added a new product.');
                    //Finds collection to updatewith new product
                    Product.find({}, function(err, product) {
                        if (err) throw err;
                        myVar = product;
                    });
                    res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
            }

        })
    }
});

//Update Handle
router.post('/update', (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
    const {product_name, product_type, stock, price, ProductId} = req.body;
    Product.findById(ProductId, function(err, doc){
        if(err) console.log(err)
        doc.product_name = product_name;
        doc.product_type = product_type;
        doc.stock = stock;
        doc.price = price;
        doc.save()
        .then(product => {
            req.flash('success_msg', 'You have successfully updated a new product.');//flash dont work
            //Finds collection to updatewith new product
            Product.find({}, function(err, product) {
                if (err) throw err;
                myVar = product;
            });
            res.redirect('/dashboard');
        })
    });
});

//Delete Handle
router.post('/delete', (req, res) => {
    Product.findByIdAndDelete(req.body.ProductId, function(err, doc){
        if(err) console.log(err)
        Product.find({}, function(err, product) {
            if (err) throw err;
            myVar = product;
        });
        res.redirect('/dashboard')
    });
});

//Login Handle
router.post('/login', (req, res, next) => {
    Product.find({}, function(err, product) {
        if (err) throw err;
        myVar = product;
    });
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;

//https://github.com/bradtraversy/node_passport_login
*/