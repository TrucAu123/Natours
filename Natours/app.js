if(process.env.NODE_ENV !=="production"){
  require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const isLoggedIn = require('./middleware');
const ExpressError = require('./utility/expressError');
const wrapAsync = require('./utility/wrapAsync');
const Tour = require('./models/tours');
const User = require('./models/user');
const Story = require('./models/story');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/natours';
mongoose.connect(dbUrl);   
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'sass')));
app.use(express.urlencoded({extended:true}));
const secret = process.env.SECRET ||'thisshouldbebettersecret!'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*3600,
})
store.on("error",function(e){
    console.log('session store error',e)
});
app.use(session({
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        // secure:true, //cookie only can change when access through http
        expires: Date.now()+ 1000*60*60*24*7, //expire a week from now
        maxAge:1000*60*60*24*7
    },
    store:store,
}))
app.use(passport.initialize());
app.use(passport.session()); // make sure session use before passport.session
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error=req.flash('error');
  next();
})

//home
app.get('/', (req,res)=>{
    res.render('home')
})

//Tour
app.get('/natours', wrapAsync(async(req,res)=>{
  const tours = await Tour.find({});
  res.render('alltour', {tours});
}))

//User
app.get('/register', (req,res)=>{
  res.render('register');
})
app.post('/register', wrapAsync(async(req,res)=>{
  let{username,email,fullname,password,image}= req.body;
  if(!image){
    image = 'https://images.unsplash.com/photo-1610087796174-c88ea5d1559c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxzZWFyY2h8NHx8aW5zdGFncmFtJTIwcHJvZmlsZXx8MHx8fHwxNjE1MjM1MjU1&ixlib=rb-1.2.1&q=80&w=1080'
  };
  const user = new User({username,email,fullname,image});
  const registerUser = await User.register(user,password);
  req.login(registerUser, function(err){
      if(err){
          return next(err);
      }
      res.redirect('/');
    })
}))
 
app.get('/login', (req,res)=>{
  const {returnTo} = req.query;
  res.render('login',{returnTo});
})
app.post('/login',passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),(req,res)=>{
  const {returnTo} = req.query;
  req.flash('success','Welcome back!')
    if(returnTo.includes('/reviews')){
        const url= returnTo.replace('/reviews','');
        return res.redirect(url);
    }else{
        const url = returnTo || '/';
        res.redirect(url);
    }
    
})
app.get('/logout', (req,res)=>{
  req.logout(function(err){
    if(err){return next(err);}
    req.flash('success', 'Goodbye!');
    res.redirect('/');
  })
})

//Story
app.get('/stories', wrapAsync(async(req,res)=>{
  const stories = await Story.find({}).populate('author');
  res.render('story',{stories})
}))

app.post('/stories',isLoggedIn, wrapAsync(async(req,res)=>{
  const{header,content} = req.body;
  const story = new Story({
    header,
    content,
    author: req.user._id
  })
  await story.save();
  res.redirect('/stories')
}))

app.all('*', (req,res,next)=>{
  next(new ExpressError('Page Not Found', 404))
})
app.use((err,req,res,next)=>{
  const {statusCode = 500} =err;
  if(!err.message) err.message='Something went wrong';
  res.status(statusCode).render('error',{err});  
})
 
app.listen(3000,()=>{
    console.log("Listening on port 3000");
})