const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
const mongoose = require('mongoose');

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const { forwardAuthenticated } = require('../config/auth');

const nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport');
var async = require('async')

//User Model
const User = require('../models/User');
//Product Model
const Product = require('../models/Product');
//Inventory Model
const Cart = require('../models/Cart');

//DB Config
const db = 'mongodb+srv://ctang:Ryo12345@cluster0-uw5vm.mongodb.net/test?retryWrites=true&w=majority';

//https://github.com/bradtraversy/mongo_file_uploads
//https://github.com/shubhambattoo/node-js-file-upload

//Login Page ,{files: files}
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

//Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

router.get('/lostPassword', (req, res) => res.render('lostPassword'));

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/lostPassword');
    }
    res.render('reset', {
      user: req.user,
      token: req.params.token
    });
  });
});

//https://stackoverflow.com/questions/17206487/nodejs-expressjs-passportjs-for-admin-pages-only

//admin Page
//router.get('/admin', forwardAuthenticated, (req, res) => res.render('admin', { ProductVar: ProductVar }, { files: imgFile }));


//Init gfs
const conn = mongoose.createConnection(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let gfs;
//Init Stream
conn.once('open', () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
})
const storage = new GridFsStorage({//Storage for files
  //https://www.npmjs.com/package/multer-gridfs-storage
  url: db,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
})


const upload = multer({
  storage
});

//Upper Case all first letter of a string 
function titleCase(string) {
  var splitStr = string.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

/* Admin Page ----------------------------------------------------------------------------- */
// Handles /upload
// Uploads both Image and Product Info
router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    var { product_name, product_type, stock, price, description } = req.body;
    const fileId = req.file.id;
    let errors = [];
    //Check Required Field
    if (!product_name || !product_type || !stock || !price || !description) {
      errors.push({ msg: 'Please Fill in All Fields' });
    }

    if (errors.length > 0) {
      asyncProductFind().then(response => {
        //console.log(response)
        ProductVar = response;
      })

      gfs.delete(fileId, (err, data) => {//Deletes Image as Image will upload regardless
        if (err) return res.status(404).json({ err: err.message });
        asyncFile().then(response => {
          //console.log(response)
          imgFile = response;
        })
      });
      res.render('admin', {
        errors
      });
    } else {
      //Checks if Product exists
      Product.findOne({ product_name: product_name })
        .then(product => {
          if (product) {
            //Product exists
            errors.push({ msg: 'Product exists' })
            asyncProductFind().then(response => {
              //console.log(response)
              ProductVar = response;
            })

            gfs.delete(fileId, (err, data) => {//Deletes Image as Image will upload regardless
              if (err) return res.status(404).json({ err: err.message });
              asyncFile().then(response => {
                //console.log(response)
                imgFile = response;
              })
            });
            res.render('admin', {
              errors
            });
          } else {
            product_name = titleCase(product_name);//Uppercase the product name
            const newProduct = new Product({
              product_name,
              product_type,
              stock,
              price,
              description,
              fileId
            });
            newProduct.save()
              .then(product => {
                req.flash('success_msg', 'You have successfully added a new product.');
                asyncFile().then(response => {
                  //console.log(response)
                  imgFile = response;
                })
                //Finds collection to updates with new product
                asyncProductFind().then(response => {
                  //console.log(response)
                  ProductVar = response;
                })
                res.redirect('/admin');
              })
              .catch(err => console.log(err));
          }

        })
    }
  } else {
    req.flash('error_msg', 'Please fill in all fields');
    res.redirect('/admin');
  }
});

// route GET /files
router.get('/files', (req, res) => {
  gfs.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      })
    }
    return res.json(files);
  });
});

// route GET /files/:filename
// Display all files in JSON
router.get('/files/:filename', (req, res) => {
  gfs.find({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No Files Exist'
      });
    }
    //File exists
    return res.json(file);
  });
});

// route GET /files/:filename
// Display single file object
router.get('/image/:filename', (req, res) => {
  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No Files Exist"
      })
    };
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  });
});


// Handles Delete of Both Image and File
//Passes in Image Id to delete from Product Collection and GFS Collection
router.post('/files/delete/:id', (req, res) => {
  console.log(req.params.id)
  Product.findOne({ fileId: req.params.id })//Deletes Product Info
    .then(product => {
      Product.findByIdAndDelete(product._id, function (err, doc) {
        if (err) console.log(err)
        asyncProductFind().then(response => {
          //console.log(response)
          ProductVar = response;
        })
      });
    });

  gfs.delete(mongoose.Types.ObjectId(req.params.id), (err, data) => {//Deletes Image
    if (err) return res.status(404).json({ err: err.message });
    asyncFile().then(response => {
      //console.log(response)
      imgFile = response;
    })

    req.flash('success_msg', 'Product Deleted');
    res.redirect('/admin');
  });
});



//Update Handle 
//Handles the update of info in the admin page regarding product Info but not image
router.post('/update', (req, res) => {
  //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  var { product_name, product_type, stock, price, description, ProductId } = req.body;
  var userId = req.user._id;
  let errors = [];
  if (!product_name || !product_type || !stock || !price || !description) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (errors.length > 0) {
    res.render('admin', {
      errors
    });
  } else {
    //Changes everything except name
    product_name = titleCase(product_name);
    Product.findOne({ product_name: product_name })//checks if product name exists before updating
      .then(product => {
        if (product) {
          Cart.findOne({ userId: userId }).then(cart => {//updates the info to the cart page
            if (cart) {//IF there is a cart object
              for (i = 0; i < cart.inventory.length; i++) {
                if (cart.inventory[i].ProductId == ProductId) {
                  index = i;
                }
              }
              if (index >= 0) {
                cart.inventory[index].product_name = product_name;
                cart.inventory[index].product_type = product_type;
                cart.inventory[index].price = parseFloat(price);
                cart.inventory[index].description = description;
                cart.markModified('inventory'); //1
                cart.save();
              } else {
                console.log('Cant Find');
              }
            }
          })
          //Product exists and name is the same
          Product.findById(ProductId, function (err, doc) {//updates product info which affects both admin and cart as it's from the same mongo collection
            if (err) console.log(err)
            doc.product_type = product_type;
            doc.stock = parseInt(stock);
            doc.price = parseFloat(price);
            doc.description = description;
            doc.save()
              .then(product => {
                req.flash('error_msg', 'Product name exists');
                //Finds collection to update with new product
                asyncProductFind().then(response => {
                  //console.log(response)
                  ProductVar = response;
                })
                res.redirect('/admin');
              })
          });
        } else {
          Cart.findOne({ userId: userId }).then(cart => {
            if (cart) {
              for (i = 0; i < cart.inventory.length; i++) {
                if (cart.inventory[i].ProductId == ProductId) {
                  index = i;
                }
              }
              if (index >= 0) {
                cart.inventory[index].product_name = product_name;
                cart.inventory[index].product_type = product_type;
                cart.inventory[index].price = parseFloat(price);
                cart.inventory[index].description = description;
                cart.markModified('inventory'); //1
                cart.save();
              } else {
                console.log('Cant Find');
              }
            }
          })
          //handles name change
          Product.findById(ProductId, function (err, doc) {//updates product info which affects both admin and cart as it's from the same mongo collection
            if (err) console.log(err)
            doc.product_name = product_name;
            doc.product_type = product_type;
            doc.stock = parseInt(stock);
            doc.price = parseFloat(price);
            doc.description = description;
            doc.save()
              .then(product => {
                req.flash('success_msg', 'You have successfully updated a new product.');
                //Finds collection to update with new product
                asyncProductFind().then(response => {
                  //console.log(response)
                  ProductVar = response;
                })
                res.redirect('/admin');
              })
          });


        }
      });
  }
});


/* Admin Page ----------------------------------------------------------------------------- */


/* Cart Page ----------------------------------------------------------------------------- */
//Handles the purchase functions in Cart
router.post('/purchase', (req, res) => {
  var { product_name, product_type, stock, price, description, ProductId } = req.body;
  userId = req.user._id;

  var ProductId = req.body.ProductId;
  var quantity = req.body.quantity;
  var index = -1;

  Product.findOne({ product_name: product_name })//checks if product name exists before updating
    .then(product => {
      if (product) {
        //Product exists
        Product.findById(ProductId, function (err, doc) {
          doc.stock = doc.stock - parseInt(quantity);
          doc.save()
            .then(product => {
              req.flash('success_msg', 'Product has been purchased');
              //Finds collection to update with new product
              asyncProductFind().then(response => {
                //console.log(response)
                ProductVar = response;
              })
              Cart.findOne({ userId: userId }).
                then(cart => {
                  if (cart) {//IF there is a cart object
                    for (i = 0; i < cart.inventory.length; i++) {
                      if (cart.inventory[i].product_name == product_name) {
                        index = i;
                      }
                    }
                    if (index >= 0) {
                      cart.inventory[index].stock = cart.inventory[index].stock + parseInt(quantity);
                      cart.markModified('inventory'); //1
                      cart.save();
                      res.redirect('/customer');
                    } else {
                      cart.inventory.push({//If same Product add to stock(objectID)
                        product_name: product_name,
                        product_type: product_type,
                        stock: parseInt(quantity),
                        price: parseFloat(price),
                        description: description,
                        ProductId: ProductId
                      })
                      cart.save();
                      res.redirect('/customer');
                    }
                  } else {//if there is a new user and now cart for them
                    const newCart = new Cart({
                      userId
                    })
                    newCart.inventory.push({
                      product_name: product_name,
                      product_type: product_type,
                      stock: parseInt(quantity),
                      price: parseFloat(price),
                      description: description,
                      ProductId: ProductId

                    })
                    newCart.save()
                      .then(product => {
                        Cart.find({}).then(function (product) {
                          res.redirect('/customer');
                        })
                      });
                  }
                })
            })
        });
      }
    });
  //Handles the cart edit Function
  //Allows the user to remove a portion of the quantity in cart back to the customer page
  router.post('/cart_edit', (req, res) => {
    var { product_name, product_type, stock, price, description, ProductId } = req.body;
    userId = req.user._id;
    var quantity = req.body.quantity;
    var index = -1;
    Cart.findOne({ userId: userId }).
      then(cart => {
        if (cart) {//IF there is a cart object
          for (i = 0; i < cart.inventory.length; i++) {
            if (cart.inventory[i].product_name == product_name) {
              index = i;
            }
          }
          if (index >= 0) {
            if (cart.inventory[index].stock == parseInt(quantity)) {//If the amount of stock and quantity exist. Delete the cart item as well
              cart.inventory.pull({
                product_name: product_name,
                product_type: product_type,
                stock: parseInt(stock),
                price: parseFloat(price),
                description: description,
                ProductId: ProductId
              })
              cart.save();
              Product.findById(ProductId, function (err, doc) {
                doc.stock = doc.stock + parseInt(stock);
                doc.save()
                  .then(product => {
                    //Finds collection to update with new product
                    asyncProductFind().then(response => {
                      //console.log(response)
                      ProductVar = response;
                    })

                    res.redirect('/cart');
                  })
              });
            } else {//If the cart item amount is partial. Return partial amount back to Product View
              cart.inventory[index].stock = cart.inventory[index].stock - parseInt(quantity);
              cart.markModified('inventory'); //1
              cart.save();
              Product.findById(ProductId, function (err, doc) {
                doc.stock = doc.stock + parseInt(quantity);
                doc.save()
                  .then(product => {
                    //Finds collection to update with new product
                    asyncProductFind().then(response => {
                      //console.log(response)
                      ProductVar = response;
                    })
                    res.redirect('/cart');
                  })
              });
            }

          }
        }
      })
  })

});
//Handles the cart delete function
//Allows user to delete all quantities of an item in the cart and return to customer page
router.post('/cart_delete', (req, res) => {
  var { product_name, product_type, stock, price, description, ProductId, _id } = req.body;
  userId = req.user._id;

  Cart.findOne({ _id: _id }).
    then(cart => {
      if (cart) {
        cart.inventory.pull({
          product_name: product_name,
          product_type: product_type,
          stock: parseInt(stock),
          price: parseFloat(price),
          description: description,
          ProductId: ProductId
        })
        cart.save();
        Product.findById(ProductId, function (err, doc) {
          doc.stock = doc.stock + parseInt(stock);
          doc.save()
            .then(product => {
              //Finds collection to update with new product
              asyncProductFind().then(response => {
                //console.log(response)
                ProductVar = response;
              })

              res.redirect('/cart');
            })
        });
      }
    })
});

//Handles the checkout function in cart
//Allows the user to purchase the items in the cart. Sends a reciept back to the user's account email
router.post('/checkout', (req, res) => {
  var userId = req.user._id;
  var emailString = ""
  Cart.findOne({ userId: userId }).
    then(cart => {
      for (i = 0; i < cart.inventory.length; i++) {
        string = "\n" + cart.inventory[i].product_name + '\xa0 \xa0 \xa0' + "x" + cart.inventory[i].stock + '\xa0 \xa0 \xa0' + "$"
          + cart.inventory[i].price + '\xa0 \xa0 \xa0' + "Total: " + (cart.inventory[i].price * cart.inventory[i].stock).toFixed(2);
        emailString = emailString.concat(string);
      }


      string = "\n \nSubtotal: " + req.body.subtotal + "\nState Tax: " + + req.body.tax + "\nTotal: " + req.body.total
      emailString = emailString.concat(string);
      sendReciept(req.user.email, emailString);
      Cart.updateOne({ userId: userId }, { $set: { inventory: [] } }, function (err, response) {//empty the array
        req.flash('success_msg', 'Purchase has been processed');
        res.redirect('/cart');
      });
    });
});


/* Cart Page ----------------------------------------------------------------------------- */


/* Login, Register, Lost Password Page ----------------------------------------------------------------------------- */
//Handles Register of account
router.post('/register', (req, res) => {
  const { name, email, password, password2, admin } = req.body;
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
            password,
            admin
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
//Handles the Lost Password
//this function handles sending the email with a special url to reset password
router.post('/lostPassword', (req, res) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token)
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/lostPassword');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var options = {
        auth: {
          api_user: 'dragon2202',
          api_key: 'Ryo123456'
        }
      }
      var client = nodemailer.createTransport(sgTransport(options));
      //https://app.sendgrid.com/guide/integrate/langs/nodejs
      var email = {
        to: req.body.email,
        from: 'em2999.gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      client.sendMail(email, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          //console.log('Message sent: ' + info.response);
          done(err, 'done');
        }
      })
    }
  ], function (err) {
    if (err) return next(err);
    req.flash('success_msg', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
    res.redirect('/users/lostPassword');
  });
})

//Handles reset function
//Handles the password change with the special url from /lostPassword
router.post('/reset', function (req, res) {
  token = req.body.token;
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error_msg', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hash
            user.password = hash;

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            //Save User
            user.save(function (err) {
              done(err, user)
            });
          }))
      });
    }, function (user, done) {

      var options = {
        auth: {
          api_user: 'dragon2202',
          api_key: 'Ryo123456'
        }
      }
      var client = nodemailer.createTransport(sgTransport(options));
      //https://app.sendgrid.com/guide/integrate/langs/nodejs
      var email = {
        to: user.email,
        from: 'em2999.gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + req.body.email + ' has just been changed.\n'
      }
      client.sendMail(email, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          //console.log('Message sent: ' + info.response);
          done(err, 'done');
        }
      })
    }

  ], function (err) {
    req.flash('success_msg', 'Success! Your password has been changed.');
    res.redirect('/users/login');
  });

})

//Login Handle
router.post('/login', (req, res, next) => {
  //https://stackoverflow.com/questions/41896865/proper-error-handling-in-mongoose-query-exec
  asyncProductFind().then(response => {
    //console.log(response)
    ProductVar = response;
  })

  asyncFile().then(response => {
    //console.log(response)
    imgFile = response;
  })

  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);

});

//Login Handle for customer page
router.post('/login_customer', (req, res, next) => {
  asyncProductFind().then(response => {
    //console.log(response)
    ProductVar = response;
  })

  asyncFile().then(response => {
    //console.log(response)
    imgFile = response;
  })
  passport.authenticate('local', {
    successRedirect: '/customer',
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

/* Login, Register, Lost Password Page ----------------------------------------------------------------------------- */

/* Profile Page ---------------------------------------------------------------------------------------------------- */
//Handles post from profile page with switch function
router.post('/profile', (req, res) => {
  switch (req.body.switch) {
    case "1"://changes user name
      User.findOne({ name: req.body.oldname }, function (err, user) {
        user.name = req.body.name;
        user.save()
          .then(user => {
            req.flash('success_msg', 'You have successfully changed your name.')
            res.redirect('/profile')
          })
      })
      break;
    case "2"://changes user email
      User.findOne({ email: req.body.email }, function (err, user) {
        if (user) {//if email name exists
          req.flash('error_msg', 'This email has been taken.')
          res.redirect('/profile')
        } else {// if email name doesnt exist
          User.findOne({ email: req.body.oldemail }, function (err, user) {
            user.email = req.body.email;
            user.save()
              .then(user => {
                req.flash('success_msg', 'You have successfully changed your email.')
                res.redirect('/profile')
              })
          })
        }
      })
      break;
    case "3":
      User.findOne({ email: req.body.email }).then(user => {
        // Match password in database
        bcrypt.compare(req.body.oldPass, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            if (req.body.newPass !== req.body.newPass2) {
              req.flash('error_msg', 'New passwords does not match')
              res.redirect('/profile');
            } else if (req.body.newPass.length < 6) {
              req.flash('error_msg', 'Password should be at least 6 characters')
              res.redirect('/profile');
            } else {
              bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(req.body.newPass, salt, (err, hash) => {//hash password
                  if (err) throw err;
                  // Set password to hash
                  user.password = hash;
                  //Save User
                  user.save()
                    .then(user => {
                      req.flash('success_msg', 'Password has beeen successfully changed');
                      res.redirect('/profile');
                    })
                }))
            }
          } else {
            req.flash('error_msg', 'Your current password does not match')
            res.redirect('/profile');
          }
        });
      });
      break;
    case "4":
      User.findOne({ email: req.body.email }).then(user => {
        console.log(user.admin)
        user.admin = req.body.admin;
        console.log(req.body.admin)
        console.log(user.admin)
        user.save()
          .then(user => {
            req.flash('success_msg', 'Admin status has changed');
            res.redirect('/profile');
          })
      });
  }
})

/* Profile Page ---------------------------------------------------------------------------------------------------- */

//https://stackoverflow.com/questions/49097567/return-resolve-value-from-async-function
//https://stackoverflow.com/questions/52599229/node-js-mongodb-find-function-ignores-wait

//Async function to find file
async function asyncFile() {
  try {
    let imgFile = await gfsFind();
    return imgFile;
  } catch (err) {
    console.log(err)
  }
}

function gfsFind() {
  return new Promise(resolve => {
    gfs.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        resolve(false);
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        resolve(files);
      }
    });
  })
}
//Async find for product collection
async function asyncProductFind() {
  try {
    let Product = await productFind();
    return Product;
  } catch (err) {
    console.log(err)
  }
}

function productFind() {
  return new Promise(resolve => {
    Product.find({})
      .then(function (product) {
        resolve(product);
      })
      .catch(function (err) {
        return res.json(err);
      });
  })
}

//Async function for checkout
async function sendReciept(address, email) {
  var options = {
    auth: {
      api_user: 'dragon2202',
      api_key: 'Ryo123456'
    }
  }
  var client = nodemailer.createTransport(sgTransport(options));
  //https://app.sendgrid.com/guide/integrate/langs/nodejs
  var email = {
    to: address,
    from: 'em2999.gmail.com',
    subject: 'Reciept for Purchase',
    text: email
  }
  client.sendMail(email, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      //console.log('Message sent: ' + info);
    }
  })

}


module.exports = router;

//1: //https://stackoverflow.com/questions/15076317/unable-to-update-mongoose-model
