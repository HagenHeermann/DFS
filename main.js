/*
TODO LIST:
    1.0 goals:
    - Encryption on client side for passwords and username
    - Only Encrypted user data in the databas 
    - basicly get the server up and running in an alpha state
    - summ up mainpage rendering in one function in the db module <- priority
    - make errors general
    
    2.0 goals:
    - changing the db to mongo db
    - modulise more for easyer understanding and debugging
    - Use of session cookies
    - directory creation in the Files directory so users can structure files they upload
    - save file information in the database with uploader information time etc.
    - config module for customistaiton of the server
        - using of routers

    3.0 goals:
    - admin system so admins can manage files in the ui

 */
/*
__________████████_____██████
_________█░░░░░░░░██_██░░░░░░█
________█░░░░░░░░░░░█░░░░░░░░░█
_______█░░░░░░░███░░░█░░░░░░░░░█
_______█░░░░███░░░███░█░░░████░█
______█░░░██░░░░░░░░███░██░░░░██
_____█░░░░░░░░░░░░░░░░░█░░░░░░░░███
____█░░░░░░░░░░░░░██████░░░░░████░░█
____█░░░░░░░░░█████░░░████░░██░░██░░█
___██░░░░░░░███░░░░░░░░░░█░░░░░░░░███
__█░░░░░░░░░░░░░░█████████░░█████████
_█░░░░░░░░░░█████_████___████_█████___█
_█░░░░░░░░░░█______█_███__█_____███_█___█
█░░░░░░░░░░░░█___████_████____██_██████
░░░░░░░░░░░░░█████████░░░████████░░░█
░░░░░░░░░░░░░░░░█░░░░░█░░░░░░░░░░░░█
░░░░░░░░░░░░░░░░░░░░██░░░░█░░░░░░██
░░░░░░░░░░░░░░░░░░██░░░░░░░███████
░░░░░░░░░░░░░░░░██░░░░░░░░░░█░░░░░█
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
░░░░░░░░░░░█████████░░░░░░░░░░░░░░██
░░░░░░░░░░█▒▒▒▒▒▒▒▒███████████████▒▒█
░░░░░░░░░█▒▒███████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
░░░░░░░░░█▒▒▒▒▒▒▒▒▒█████████████████
░░░░░░░░░░████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
░░░░░░░░░░░░░░░░░░██████████████████
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
██░░░░░░░░░░░░░░░░░░░░░░░░░░░██
▓██░░░░░░░░░░░░░░░░░░░░░░░░██
▓▓▓███░░░░░░░░░░░░░░░░░░░░█
▓▓▓▓▓▓███░░░░░░░░░░░░░░░██
▓▓▓▓▓▓▓▓▓███████████████▓▓█
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
*/
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
var util = require('./util_mod');
const fileUpload = require('express-fileupload');




/*Creating express app obj */
var app = express();

/*Creating parser obj */
var urlencodedParser = bodyParser.urlencoded({extended:false});

/*state object */
var _conf =
{
    /* server state */
    "port":8888,
    "file_dir_path":"./Files/",
    "public_dir":"public",

    /* ownership state */
    "owner_first_name":"",
    "owner_last_name":"",
    "owner_email_address":"",
    "owner_tel_num":""
}

/* Setting up express */
app.use(express.static(path.join( __dirname,_conf.public_dir)));
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

/* CONTACT */
app.get('/Contact',function(req,resp){
    var owner_state = 
    {
        "owner_first_name":_conf.owner_first_name,
        "owner_last_name":_conf.owner_last_name,
        "owner_email_address":_conf.owner_email_address,
        "owner_tel_num":_conf.owner_tel_num
    }
    resp.render('contact',{owner_state});
})

/* UPLOAD */
app.post('/file_upload',function(req,resp){
   
   var uploaderr = "No filen given!";
   if(!req.files)
   {
       var s_files = util.file_listing();
       resp.render('mainpage',{uploaderr,s_files})
   }
   else
   {
       if(!req.files.file){var s_files = util.file_listing();resp.render('mainpage',{uploaderr,s_files})}
       else
       {
                
            let uploaded_file = req.files.file;
            var filename = req.files.file.name.replace(new RegExp(' ','g'),'');
            var file_path = path.join(__dirname,"Files",filename);

            console.log(filename);
            console.log(file_path);

                uploaded_file.mv(file_path,function(err)
                {
                    if(err)
                    {
                        var uploaderr = "Error while uploading file!";
                        var s_files = util.file_listing();
                        resp.render('mainpage',{uploaderr,s_files});
                        console.log("Error moving the file to the Files directory");
                    }
                    else
                    {
                        var s_files = util.file_listing();
                        resp.render('mainpage',{s_files});
                        console.log("Succesfull upload");
                    }
                });
        }
    }

    
})

/* File Download */
app.get('/download/*',function(req,resp){
    var file = path.basename(req.path);
    var type = path.extname(file);
    var file_path = path.join(__dirname,"Files",file);
    resp.download(file_path);
})

/* Session Cookies */
/* Cookie dependend on username , time , date
    unique id so no easy fakeing
 */
function create_session_cookie(username)
{
    /* get time and date */

    /* create the unique id */

    /* build the cookie */

    /* encryption of the cookie */

    /* return cookie */

}

function get_unique_hash_simple()
{
    /* 20 char hash */
    var hash = null;


}

/* config load */
function load_configs()
{
    fs.readFile('./config.json','utf8',function(err,data)
    {
        if(err)
        {
            //console.log(err);
            console.log("config file not found creating a new one...");
            var stringifyed = JSON.stringify(_conf);
            fs.writeFile("config.json",stringifyed,function(err){
                if(err)
                {
                    console.log("err");
                }
            });
            console.log("new config file created");
        }
        else
        {
            var conf_json_file = JSON.parse(data);
            for(var key in conf_json_file)
            {
                switch(key){
                    case "port":
                        _conf.port = conf_json_file["port"];
                        console.log(conf_json_file["port"]);
                        console.log(_conf.port);
                        break;
                    case "owner_first_name":
                        _conf.owner_first_name = conf_json_file["owner_first_name"];
                        console.log(conf_json_file["owner_first_name"]);
                        console.log(_conf.owner_first_name);
                        break;
                    case "owner_last_name":
                        _conf.owner_last_name = conf_json_file["owner_last_name"];
                        console.log(conf_json_file["owner_last_name"]);
                        console.log(_conf.owner_last_name);
                        break;
                    case "owner_email_address":
                        _conf.owner_email_address = conf_json_file["owner_email_address"];
                        console.log(conf_json_file["owner_email_address"]);
                        console.log(_conf.owner_email_address);
                        break;
                    case "owner_tel_num":
                        _conf.owner_tel_num = conf_json_file["owner_tel_num"];
                        console.log(conf_json_file["owner_tel_num"]);
                        console.log(_conf.owner_tel_num);
                        break;
                    default:
                        break;
                };
            }
            console.log("Loaded configs")
        }
    })
}

/* Listen start */
load_configs();
var server = app.listen(_conf.port,function(){
    var host = server.address().address;
    var port = server.address().port;


    console.log("DFS listening at http://%s:%s",host,port);
})

