const User=require('./models/schema');
const Blog=require('./models/blogModel');
const Due=require('./models/duesModel');

exports.updateprofile_get= (req,res)=>{
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
            request_session_update(req);
            // redirect to home page
            res.redirect('/home');
        })// catch errors if any and print them out
        .catch((err)=>console.log(err));
};

exports.updateprofilehmc_post=(req,res)=>{
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
                request_session_update(req);
            }
            //redirect to home page
            res.redirect('/home');
        })
        .catch((err)=>console.log(err));
};
exports.login_post=(req,res)=>{
    console.log(req.body);
    User.findOne({email:req.body.email})
        .then((result)=>{
            console.log("see user from login request " ,result);
            // if there isn't any user with this email id , return that no user with this email
            if(!result)res.render('index',{response:'No user with this email ID',ishmc:req.session.hmc,name:req.session.firstname});
            if(req.body.password === result.password){
                // store details of current user in the session store
                req.session.isAuth=true,
                req.session.email=req.body.email;
                req.session.hmc=result.hmc;
                req.session.firstname=result.firstname;
                req.session.lastname=result.lastname;
                req.session.userid= result._id;
                // redirect user to home page
                console.log("valjhdsdf ",req.session);
                res.redirect('/home');
            }else{
                // if password does not matches with the given id, show wrong id password message
                res.render('index',{response:"Wrong Id or Password",ishmc:req.session.hmc,name:req.session.firstname});
            }
        })
        .catch(err=>console.log(err));
};

exports.deleteaccount_post=async (req,res)=>{
    let userData = await User.findOne({email:req.session.email});
    if(userData.password === req.body.password){
        await User.findOneAndDelete({email:req.session.email});
        res.render('index',{response:'Account deleted Sucessfully!!',ishmc:req.session.hmc,name:req.session.firstname});
    }else{
        res.render('deleteaccount',{response:'Wrong password!!',ishmc:req.session.hmc,name:req.session.firstname});
    }
};
exports.signup_post=(req,res)=>{
    console.log("signup : " ,req.body);
    if(req.body.password.length<5 || req.body.password.length>20){
        res.render('index',{response:'Password length must be between 5 and 20',ishmc:req.session.hmc,name:req.session.firstname})
    }
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
                            //update_session_signup(req,result2);
                            req.session.isAuth=true,
                            req.session.email=req.body.email;
                            req.session.hmc=varhmc;
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
};
exports.updateroomchangerequest_post=(req,res)=>{
    //console.log("see rroom ",req.body,req.body.requestedroom, typeof(req.body.requestedroom));
    let req_room = req.body.requestedroom;
    if((req_room[0]==='A' || req_room[0]==='B' || req_room[0]==='C') && req_room.length === 4){
        User.findOne({email:req.session.email})
        .then((result)=>{
            result.requestedroom=req.body.requestedroom;result.reasonOfRoomChange=req.body.reason;
            result.save()
            .then((result2)=>{
                    res.redirect('/home');
                })
        })
    }else{
        User.findOne({email:req.session.email})
        .then((result)=>{
            res.render('roomchangerequestUpdate',{response:"Requested room no. is Incorrect",user:result, ishmc:req.session.hmc, name:req.session.firstname});
        });
    }
    
};
exports.createdue_post=async (req,res)=>{
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
};
exports.deletedues_post=async (req,res)=>{
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
};
exports.deleteannouncement_post= (req, res) => {
    let blogId = req.params.id;
    Blog.findByIdAndDelete(blogId)
        .then(result => {
            //res.json({ redirect: '/home' });
            res.redirect('/home');
        })
        .catch(err => {
            console.log(err);
        });
};
exports.profile_get=(req,res)=>{
    // find user with the email stored in session variables
    User.findOne({email:req.session.email})
        .then((result)=>{
            if(result){
                // render the profile details
                res.render('profile',{user:result,response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
            }
        })
        .catch(err=>console.log(err));
};
exports.deleteuser_delete=(req,res)=>{
    //console.log("delete -user ",req.body);
    // find user with given id and delete
    User.findByIdAndDelete(req.params.id)
        .then((result)=>{
            // after deletion, redirect user to home page
            res.redirect('/viewprofiles');
        })
        .catch((err)=>console.log(err));
};
exports.deleteuser_post=(req,res)=>{
    //console.log("delete -user ",req.body);
    // find user with given id and delete
    User.findByIdAndDelete(req.params.id)
        .then((result)=>{
            // after deletion, redirect user to home page
            res.redirect('/viewprofiles');
        })
        .catch((err)=>console.log(err));
};
exports.seeprofile_get=(req,res)=>{
    console.log("see comp req ",req.params);
    // find a user with the requested id
    User.findById(req.params.id)
        .then((result)=>{
            // render the data of particular profile
            res.render('view_profile_as_hmc',{user:result,response:"nothing",ishmc:req.session.hmc,name:req.session.firstname});
        })
        .catch((err)=>{

        });
};