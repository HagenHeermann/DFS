var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var validator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var userdbmodule = require('./userdbmodule');
var mime = require('mime');
var fs = require('fs');
const fileUpload = require('express-fileupload');

const __FilesDir = './Files/';



/*Creating express app obj */
var app = express();

/*Creating parser obj */
var urlencodedParser = bodyParser.urlencoded({extended:false});

/*Const setups */
const port = 8888;

/* Setting up express */
app.use(express.static(path.join( __dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(validator());
app.use(fileUpload());

/*Set up for handlebars engine */
app.engine('handlebars',exphbs({defaultLayout:'layout'}));
app.set('view engine','handlebars');

/* Session set up */
app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}));

/* Set up for the validator */
app.use(validator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

/* Set up for flash */
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

/*Setting up db */
var userdb = userdbmodule.connectDB();
//only run the statement below when you havent set up the tables already
userdbmodule.createTables(userdb) 
//userdbmodule.dropUserTable(userdb);

/* HTTP function stuff */

/* Login */
function LoginResponse(req,resp)
{
    resp.render('login');
    console.log("login html request")
}
app.get('/',function(req,resp){LoginResponse(req,resp);});
app.get('',function(req,resp){LoginResponse(req,resp);})

app.post('/login_post',urlencodedParser,function(req,resp){
    user = {
        u_name:req.body.username,
        u_pass:req.body.password 
    }

    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('password','Password is required').notEmpty();

    var errors = req.validationErrors();
    
    if(errors)
    {
        console.log("errors occured");
        resp.render('login',{
            errors:errors
        });
    }
    else
    {
        userdbmodule.handleLogin(userdb,user.u_name,user.u_pass,req,resp);
        //console.log(val);
        //resp.render('mainpage');
    }
})

/*Registration */

app.post('/registration_post',function(req,resp){
    
    /*Creating a json format obj for the registration credentials*/
    credentials = {
        u_name:req.body.username,
        u_password_0:req.body.password0,
        u_password_1:req.body.password1,
    } 
    
    /* Validations */
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('password0','Password is required').notEmpty();
    req.checkBody('password1','Password repeat is required').notEmpty();
    req.checkBody('password1','Passwords do not match').equals(req.body.password0);

    var errors = req.validationErrors();

    if(errors)
    {
        console.log("errors occured");
        resp.render('login',{
            errors:errors
        })
    }
    else
    {
        userdbmodule.handleRegister(userdb,credentials.u_name,credentials.u_password_0,req,resp);
    }
})

/* LEGAL */
app.get('/Legal',function(req,resp)
{
    resp.render('legal');
})

/* ABOUT */
app.get('/About',function(req,resp)
{
    resp.render('about');
})

/* File Upload */
function file_listing()
{
    var filenames = [];
    fs.readdir(__FilesDir,function(err,files){
        files.forEach(file=>{
            filenames.push(file);
        })
    });
    return filenames;
}


app.post('/file_upload',function(req,resp){
   
   if(!req.files)
   {
       var uploaderr = "No filen given!";
       var filenames = file_listing();
       resp.render('mainpage',{uploaderr,filenames})
   }
   else
   {
       let uploaded_file = req.files.file;
       var filename = req.files.file.name;
       var file_path = path.join(__dirname,"Files",filename);

       console.log(filename);
       console.log(file_path);

        uploaded_file.mv(file_path,function(err)
        {
            if(err)
            {
                var uploaderr = "Error while uploading file!";
                var filenames = file_listing();
                resp.render('mainpage',{uploaderr,filenames});
                console.log("Error moving the file to the Files directory");
            }
            else
            {
                var filenames = file_listing();
                resp.render('mainpage',{filenames});
                console.log("Succesfull upload");
            }
        });
    }

    
})

/* Download GET */
app.get('/download',function(req,resp)
{
    /* Check if the user has selected a file for its request */
    req.checkBody('filename',"No file selected").notEmpty();
    var errors = req.validationErrors();
    
    if(errors)
    {
        /* Rendering the mainpage again with the error mesages */
        var filenames = file_listing();
        resp.render('mainpage',{errors,filenames});
    }
    else
    {
        /* Getting all the infos for the piping */
        var filename = req.body.filename;
        var file = path.join(__dirname,"Files",filename);
        var mimetype = mime.lookup(file);
        
        /* Setting the headers for the browser */
        resp.setHeader('Content-disposition','attachment; filename='+filename);
        resp.setHeader('Content-type',mimetype);

        /* creating the file stream for the response and starting the piping */
        var stream = fs.createReadStream(file);
        stream.pipe(resp);
    }
})


/* Listen start */
var server = app.listen(port,function(){
    var host = server.address().address;
    var port = server.address().port;


    console.log("Example app listening at http://%s:%s",host,port);
})