const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
        req.flash('error', 'You must be signed in!');
        return res.redirect(`/login?returnTo=${fullUrl}`);
    }
    next();
}

module.exports = isLoggedIn;