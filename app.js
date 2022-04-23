const express=require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const app=express();
const User=require('./models/schema');
const Blog=require('./models/blogModel');
const Due=require('./models/duesModel');
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
})
// logout
app.get('/logout', isLoggedIn,(req, res) => {
    // clear the session variables
    req.logout();
    req.session.destroy();
    // render the login page
    res.render('index',{response:"Logged out sucessfully!"});
});
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
app.get('/seeprofile/:id',isHMC,(req,res)=>{
    console.log("see comp req ",req.params);
    // find a user with the requested id
    User.findById(req.params.id)
        .then((result)=>{
            // render the data of particular profile
            res.render('view_profile_as_hmc',{user:result,response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
        })
        .catch((err)=>{

        });
});
// get the logged in user profile
app.get('/profile/',isLoggedIn,(req,res)=>{
    // find user with the email stored in session variables
    User.findOne({email:req.session.email})
        .then((result)=>{
            if(result){
                // render the profile details
                res.render('profile',{user:result,response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
            }
        })
        .catch(err=>console.log(err));
});

// delete request by delete method
app.delete('/deleteuser/:id',(req,res)=>{
    console.log("delete -user ",req.body);
    // find user with given id and delete
    User.findByIdAndDelete(req.params.id)
        .then((result)=>{
            // after deletion, redirect user to home page
            res.redirect('/viewprofiles');
        })
        .catch((err)=>console.log(err));
});
// delete user with the given id if a post request is made
app.post('/deleteuser/:id',(req,res)=>{
    console.log("delete -user ",req.body);
    // find user with given id and delete
    User.findByIdAndDelete(req.params.id)
        .then((result)=>{
            // after deletion, redirect user to home page
            res.redirect('/viewprofiles');
        })
        .catch((err)=>console.log(err));
});

// update profile of logged in user
app.post('/updateprofile',(req,res)=>{
    console.log("update request ",req);
    // store whther user is an HMC member or not
    let varhmc=false;
    if(req.body.hmc){
        varhmc=true;
    }
    //console.log("see varhmc value          ---------------- ",varhmc);
    const user = { firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email,room: req.body.room,
        phone:req.body.phone, password: req.body.password,rollnumber:req.body.rollnumber,hmc:varhmc};
    
    // updating in users database
    User.findOneAndUpdate({email:req.session.email},user)
        .then((result)=>{
            // update details of current user in the session store
            req.session.email=req.body.email;
            req.session.hmc=req.body.hmc;
            req.session.firstname=req.body.firstname;
            req.session.lastname=req.body.lastname;
            // redirect to home page
            res.redirect('/home');
        })// catch errors if any and print them out
        .catch((err)=>console.log(err));
});

// update a particular user's profile
app.post('/updateprofilehmc/:id',(req,res)=>{
    let id=req.params.id;
    console.log("update request ",req);
    // check if user is an HMC member
    let varhmc=false;
    if(req.body.hmc){
        varhmc=true;
    }
    //console.log("see varhmc value          ---------------- ",varhmc);
    // store the profle data fields
    const user = { firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email,room: req.body.room,
        phone:req.body.phone,rollnumber:req.body.rollnumber,hmc:varhmc,breakfastDiet:req.body.breakfastdiet,
        lunchDiet:req.body.lunchdiet,dinnerDiet:req.body.dinnerdiet};
    // updating in users database
    User.findByIdAndUpdate(id,user)
        .then((result)=>{
            if(req.session.userid == id){
                // update the local session data
                req.session.email=req.body.email;
                req.session.hmc=req.body.hmc;
                req.session.firstname=req.body.firstname;
                req.session.lastname=req.body.lastname;
            }
            //redirect to home page
            res.redirect('/home');
        })
        .catch((err)=>console.log(err));
});

// login to website
app.post('/login',(req,res)=>{
    console.log(req.body);
    User.findOne({email:req.body.email})
        .then((result)=>{
            console.log("see user from login request " ,result);
            // if there isn't any user with this email id , return that no user with this email
            if(!result)res.render('index',{response:'No user with this email ID',ishmc:req.session.hmc,name:req.session.firstname});
            if(req.body.password === result.password){
                // store details of current user in the session store
                req.session.isAuth=true,
                req.session.email=result.email;
                req.session.hmc=result.hmc;
                req.session.firstname=result.firstname;
                req.session.lastname=result.lastname;
                req.session.userid= result._id;
                console.log("see the session ",req.session);
                // redirect user to home page
                res.redirect('/home');
            }else{
                // if password does not matches with the given id, show wrong id password message
                res.render('index',{response:"Wrong Id or Password",ishmc:req.session.hmc,name:req.session.firstname});
            }
        })
        .catch(err=>console.log(err));
});
app.get('/deleteaccount',isLoggedIn,async (req,res)=>{
    res.render('deleteaccount',{response:"Nothing",ishmc:req.session.hmc,name:req.session.firstname});
});
// user can delete account
app.post('/deleteaccount',isLoggedIn,async (req,res)=>{
    let userData = await User.findOne({email:req.session.email});
    if(userData.password === req.body.password){
        await User.findOneAndDelete({email:req.session.email});
        res.render('index',{response:'Account deleted Sucessfully!!',ishmc:req.session.hmc,name:req.session.firstname});
    }else{
        res.render('deleteaccount',{response:'Wrong password!!',ishmc:req.session.hmc,name:req.session.firstname});
    }
})
// Sign up to website
app.post('/signup',(req,res)=>{
    console.log("signup : " ,req.body);
    User.findOne({"email":req.body.email})
        .then((result)=>{
            console.log("user exist array ",result);
            // if user already exist, then return a message 
            if(result)res.render('index',{response:'User already exist with this user ID',ishmc:req.session.hmc,name:req.session.firstname});
            else{
                // save the user details
                let varhmc=false;
                if(req.body.hmc == 'on'){
                    varhmc=true;
                }
                // store user values
                const user = { firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email,room: req.body.room,
                    phone:req.body.phone, password: req.body.password,rollnumber:req.body.rollnumber ,hmc:varhmc};
                    const newuser= new User(user);
                    // save user data
                    newuser.save()
                        .then((result2)=>{
                            // save the user data in session store
                            req.session.isAuth=true,
                            req.session.email=req.body.email;
                            req.session.hmc=req.body.hmc;
                            req.session.firstname=req.body.firstname;
                            req.session.lastname=req.body.lastname;
                            req.session.userid= result2._id;
                            // after saving, redirect user to home page
                            res.redirect('/home');
                        })
                        .catch(err=>console.log(err));
            }
        })
        .catch(err=>console.log(err));
});
// view diets count
app.get('/viewdietcount',isLoggedIn, async (req,res)=>{
    let userData = await User.findOne({email:req.session.email});
    res.render('viewDietCount',{response:"nothing",user:userData,ishmc:req.session.hmc, name:req.session.firstname});
});
// delete a user profile
app.post('/deleteprofile/:id',(req,res)=>{
    let id=req.params.id;
    User.findByIdAndDelete(id)
        .then((result)=>{
            res.redirect('/');
        })
        .catch(err=>console.log(err));
});

// ---------------------------- announcement section -----------------------------ERROR
// create an announcement
app.get('/createannouncement',isHMC, (req, res) => {
    res.render('createAnnouncement', { title: 'Create a new blog',response:"nothing" , ishmc:req.session.hmc, name:req.session.firstname});
});
// create an announcement
app.post('/createannouncement',isHMC, (req, res) => {
    const newAnnouncement = new Blog(req.body);
    newAnnouncement.save()
        .then((result)=>{
            res.redirect('/home');
        })
        .catch(err=>console.log(err));
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
app.post('/deleteblog/:id', (req, res) => {
    let blogId = req.params.id;
    Blog.findByIdAndDelete(blogId)
        .then(result => {
            //res.json({ redirect: '/home' });
            res.redirect('/home');
        })
        .catch(err => {
            console.log(err);
        });
});

// ---------------------------- dues  section--------------------------------------------------------
// show dues of the person logged in 
app.get('/dues',isLoggedIn,async (req,res)=>{
    let result  = await User.findOne({email:req.session.email}).populate('dues');
    console.log("gggggg ",result);
    res.render('view_all_dues',{dues:result.dues,response:"nothing",name:req.session.firstname,ishmc:req.session.hmc});

});
// show dues of a person for given id
app.post('/getdues/:id',isHMC,async (req,res)=>{
    let result  = await User.findById(req.params.id).populate('dues');
    console.log("ggggggg due dede ",result,req.session.hmc);
    res.render('view_all_dues_as_hmc',{dues:result.dues,response:"nothing",name:req.session.firstname,ishmc:req.session.hmc});

});
// show required details to create a new due
app.get('/createdue',isLoggedIn,isHMC,(req,res)=>{
    res.render('createdue',{response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
});
// create a new due
app.post('/createdue', async (req,res)=>{
    let result = await User.findOne({email:req.body.email});
    if(!result){
        res.render('createdue',{response:"No user with this email.",ishmc:req.session.hmc,name:req.session.firstname});
    }
    let due = {name:req.body.name,description:req.body.description,user:result._id};
    const newdue= new Due(due);
    try {
        let res2 = await newdue.save();
        result.dues.push(res2);
        await result.save();
        res.redirect('/dues');
    }
    catch (err){
        console.log(err);
    }
});
// delete a due
app.post('/deletedues/:id',async (req,res)=>{
    let id= req.params.id;
    try{
        let requested_due = await Due.findById(id);
        let user= await User.findById(requested_due.user);
        user.dues.remove(id);
        user.save();
        await Due.findByIdAndDelete(id);
        res.redirect('/dues');
    }
    catch(err){
        console.log(err);
    }
    

});
// app.get('/try',isLoggedIn,isHMC,(req,res)=>{
//     res.render('try',{response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
// });

 
// ------------------------------------------------------------------------------------
// 404 page in case url does not matches
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});
