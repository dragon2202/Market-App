# Market-Website
My Market website is side project that is designed to mimic e-commerce websites like Amazon, Target, etc. This project is more of a proof of concept than an actual attempt to build a professional website. This project was made for learning.

## Built with
[Node.js](https://en.wikipedia.org/wiki/Node.js)
<br>
Node.js Dependacies
<br>
-[body-parser](https://www.npmjs.com/package/body-parser)- Used to extract incoming request streams and process those request
<br>
-[express](https://www.npmjs.com/package/express)
<br>
-[passport](https://www.npmjs.com/package/passport)- Used to authenticate my login requests with express using strategies(username and password credentials)
<br>
-[nodemailer](https://www.npmjs.com/package/nodemailer)- Used to Send Emails with Node
<br>
<br>
[Mongoose](https://www.npmjs.com/package/mongoose)- an Object Modeling Tool for MongoDB
<br>
[Multer](https://www.npmjs.com/package/multer)- Used to receive uploaded images from front end
<br>
[GridFs](https://www.npmjs.com/package/gridfs)- Used to process images for upload to MongoDB

## Primary Features
### Admin Page
This page has the CRUD(Create,Read, Update, Delete) functionality needed to manipulate stock/product.
<img src="Market Website/Market Website Admin.png" height="500">

### Customer Page
This page allows customers to make purchases and add items to their carts.
<img src="Market Website/Market Website Home.png" height="500">

### Cart Page
This page allows customers to update(remove or add the chosen product) their cart. If customers are sure, this page can also finalize purchases, and send a reciept to the customer's registered email.
<img src="Market Website/Cart.png" height="500">

## Link to my website
This is a link to my deployed website on Heroku - [Market Website Link](http://ctang-marketwebsite.herokuapp.com/)
