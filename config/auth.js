module.exports = {//prevents pages from being accessed without login authentication
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/users/login');
    },
    forwardAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            return next();
        }
        res.redirect('/admin');
    }
    
};