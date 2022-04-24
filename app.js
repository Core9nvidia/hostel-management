const express=require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const app=express();
const User=require('./models/schema');
const Blog=require('./models/blogModel');
const Due=require('./models/duesModel');
const appController = require("./appController");
//const AllUser=require('./models/AllUser');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
// mongodb connected from local session
var url="mongodb://localhost/hostelmanagement";
// mongob connected to online databse atlas
url="mongodb+srv://roha:roha@nodetut.hijdw.mongodb.net/hostelManagement?retryWrites=true&w=majority";
const port=process.env.PORT || 3000;
mongoose.connect(url)
    .then((result)=>app.listen(port))
    .catch((err)=>console.log(err));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// function to chck whether a user is logged in or not
function isLoggedIn(req,res,next){
    req.session.isAuth ? next() : res.status(401).redirect('/');
}
// function to check whether logged in user is an hmc member
function isHMC(req,res,next){
    req.session.hmc ? next() : res.redirect('/home');
}

// redirect to login/signup page
app.get('/',(req,res)=>{
    res.render('index',{response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
});
// logout
app.get('/logout', isLoggedIn,appController.logout);
// get home page
app.get('/home',isLoggedIn,(req,res)=>{
    // find all the announcements(blog) , sort them from their created time(newest first)
    Blog.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('announcement_view', { blogs: result,response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
        })//catch errors if any and show them
        .catch(err => {
            console.log(err);
        });
});

// view all profiles(only hmc members can access)
app.get('/viewprofiles',isHMC,(req,res)=>{
    // find all the users and render them
    User.find()
    .then((result)=>{
        // pass the data to viewprofiles page
        res.render('viewprofiles',{response:"nothing",users:result,name:req.session.firstname,ishmc:req.session.hmc});
    })
});
// see profile with a particular id (only for hmc)
app.get('/seeprofile/:id',isHMC,appController.seeprofile_get);
// get the logged in user profile
app.get('/profile/',isLoggedIn,appController.profile_get);

// delete request by delete method
app.delete('/deleteuser/:id',appController.deleteuser_delete);
// delete user with the given id if a post request is made
app.post('/deleteuser/:id',appController.deleteuser_post);

// update profile of logged in user
app.post('/updateprofile',appController.updateprofile_get);

// update a particular user's profile
app.post('/updateprofilehmc/:id',appController.updateprofilehmc_post);

// login to website
app.post('/login',appController.login_post);

app.get('/deleteaccount',isLoggedIn,async (req,res)=>{
    res.render('deleteaccount',{response:"Nothing",ishmc:req.session.hmc,name:req.session.firstname});
});

// user can delete account
app.post('/deleteaccount',isLoggedIn,appController.deleteaccount_post);

// Sign up to website
app.post('/signup',appController.signup_post);
// view diets count
app.get('/viewdietcount',isLoggedIn, appController.viewdietcount);
// delete a user profile
app.post('/deleteprofile/:id',(req,res)=>{
    let id=req.params.id;
    User.findByIdAndDelete(id)
        .then((result)=>{
            res.redirect('/');
        })
        .catch(err=>console.log(err));
});
// room change seciotn ----------------------------------------------------------
app.get('/roomchangerequest',isLoggedIn,async (req,res)=>{
    User.findOne({email:req.session.email})
    .then((result)=>{
        res.render('roomchangerequestUpdate',{response:"nothing",user:result, ishmc:req.session.hmc, name:req.session.firstname});
    });
});
// update room change request
app.post('/updateroomchangerequest',appController.updateroomchangerequest_post);
// delete room change request
app.post('/deleteroomchangerequest',appController.deleteroomchangerequest_post);
// add room change request
app.post('/addroomchangerequest',appController.addroomchangerequest_post);
// ---------------------------- announcement section -----------------------------ERROR
// create an announcement
app.get('/createannouncement',isHMC, (req, res) => {
    res.render('createAnnouncement', { title: 'Create a new blog',response:"nothing" , ishmc:req.session.hmc, name:req.session.firstname});
});
// create an announcement
app.post('/createannouncement',isHMC, (req, res) => {
    if(req.body.body.length <= 255){
        const newAnnouncement = new Blog(req.body);
        newAnnouncement.save()
            .then((result)=>{
                res.redirect('/home');
            })
            .catch(err=>console.log(err));
    }else{
        res.render('createAnnouncement', { title: 'Create a new blog',response:"Announcememnt body length can't be greater than 255." , ishmc:req.session.hmc, name:req.session.firstname});
    }
    
});
// show a particular blog with given id
app.get('/blogs/:id',isLoggedIn, (req, res) => {
    const blogId = req.params.id;
    Blog.findById(blogId)
        .then(result => {
            res.render('announcementDetails', { blog: result, response:"nothing", ishmc:req.session.hmc, name:req.session.firstname});
        })
        .catch(err => {
            console.log(err);
        });
});
// delete an announcement
app.delete('/deleteblog/:id', (req, res) => {
    let blogId = req.params.id;
    Blog.findByIdAndDelete(blogId)
        .then(result => {
            res.redirect('/home');
        })
        .catch(err => {
            console.log(err);
        });
});
// delete aan announcement
app.post('/deleteblog/:id',appController.deleteannouncement_post);

// ---------------------------- dues  section--------------------------------------------------------
// show dues of the person logged in 
app.get('/dues',isLoggedIn,appController.dues_get);
// show dues of a person for given id
app.post('/getdues/:id',isHMC,appController.getduesId_post);
// show required details to create a new due
app.get('/createdue',isLoggedIn,isHMC,appController.createdues_get);
// create a new due
app.post('/createdue', appController.createdue_post);
// delete a due
app.post('/deletedues/:id',appController.deletedues_post);
// ------------------------------------------------------------------------------------
// 404 page in case url does not matches
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});