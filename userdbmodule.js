/*
* Table users:
* username TEXT,
* password TEXT
*
* Table files:
* filename TEXT,
* filetype TEXT,
* path TEXT,
* filesize NUM <- später
*
*/

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var path = require('path');
var util = require('./util_mod');

const __FilesDir = './Files/';

module.exports = 
{
    
    
    //DONE
    connectDB:function()
    {
        var db = new sqlite3.Database('userdb');
        console.log("userdbmodule: Created connection to the user db");
        return db;
    },
    
    //DONE
    createTables:function(DBobj)
    {
        var user_table_query = "CREATE TABLE users(username TEXT,password TEXT)";
        var files_table_query = "CREATE TABLE files(filename TEXT, filetype TEXT, path TEXT)";
        DBobj.run(user_table_query,function(err){
            if(err)
            {
                console.log("userdbmodule: Table already created");
            }else
            {
                console.log("userdbmodule: Created table users");
            }
        });
        DBobj.run(files_table_query,function(err){
            if(err)
            {
                console.log("userdbmodule: Table already created");
            }
            else
            {
                console.log("userdbmodule: Created table files");
            }
        });
    },

    addFile:function(DBObj,filename,filetype,path,resp)
    {
        var query = "INSER INTO files(filename,filetype,path)VALUES(?,?,?)";
        var stmt = DBObj.prepare(query);
        stmt.run(filename,filetype,path,function(err)
        {
            if(err)
            {
                var s_files = [];
                fs.readdir(__FilesDir,function(err,files){
                    files.forEach(file=>{
                        var ftype = path.extname(file);
                        var fname = path.basename(file,ftype);
                        var fi = { "fname" : fname , "ftype" : ftype };
                        s_files.push(fi);
                    });
                });
                console.log(s_files)
                var uploaderr = "An error accured during the upload please try again";
                resp.render('mainpage',{s_files,uploaderr});
            }
            else
            {
                console.log("userdbmodule: Added file %s %s %s",filename,filetype,path);
            }
        });
    },


    //DONE workover to use again
    addUser:function(DBObj,username,userpw)
    {
        var stmt = DBObj.prepare("INSERT INTO users VALUES(?,?)");
        stmt.run(username,userpw,function(err)
        {
            if(err){
                console.log("userdb: failed to insert");
                console.log(err);
                return false;
            }
        });
        stmt.finalize();
        return true;
    },
    
    //DONE
    dropUserTable:function(DBObj){
        var query = "DROP TABLE users";
        DBObj.run(query,function(err){
            if(err){
                console.log("Failed to drop the user table with error:%s",err);
            }
            else
            {
                console.log("Succesfully dropped table users");
            }
        });
    },
    //TODO
    deleteUser:function(DBObj,username)
    {
        var query = "";
        DBobj.run(query);
    },
    
    // Done needs testing tho TODO
    handleLogin:function(DBObj,username,pass,req,resp)
    {
        var query = "SELECT * FROM users WHERE \"username\"= \""+username+"\"";
        var stmt = DBObj.prepare(query);
        stmt.get(function(err,row){
            if(err)
            {
                console.log(err);
                resp.render('login');
            }
            else
            {
                if(row == undefined)
                {
                    console.log("user that isnt registered tried to register")
                    var loginerr = "Unknown username";
                    resp.render('login',{loginerr});
                }
                else
                {
                    var db_pw = row.password
                    console.log(db_pw);
                    console.log(pass);
                    if(db_pw === pass)
                    {              
                        console.log("userdb: login correct user exists and pass is matching");
                        var s_files = util.file_listing();
                        resp.render('mainpage',{s_files});
                    }
                    else
                    {
                        console.log("userdb: login failed because the pass doesnt match");
                        var loginerr = "Wrong Password";
                        resp.render('login',{loginerr})
                    }
                }
            }
        });    
    },
    //TODO shit doesnt realy work out as i want it to
    handleRegister:function(DBObj,uname,pass,req,resp)
    {
        var query =  "SELECT * FROM users WHERE \"username\"= \""+uname+"\"";
        var stmt = DBObj.prepare(query)
        var user_registered = false;
        var val = null;
        
        stmt.get(function(err,row)
        {
            if(err)
            {
                console.log(err);
                resp.render('login');
                user_registered = true;
            }
            val = row;
        });

        if(!user_registered)
        {
            if(val == undefined)
            {
                var query1 = "INSERT INTO users(username,password)VALUES(?,?)";
                var stmt1 = DBObj.prepare(query1);
                stmt1.run(uname,pass,function(err){
                    if(err)
                    {
                        console.log("userdb: failed to insert");
                        console.log(err);
                        resp.render('login')
                    }
                    else
                    {
                        console.log("userdb: Added user %s to the db",uname);
                        var s_files = util.file_listing();
                        resp.render('mainpage',{s_files});
                    }
                });
            }
            else
            {
                console.log("userdb: User %s is already registered",uname);
                var regerr = "Username already in use";
                resp.render('login',{regerr});
            }
        }
    },

    //TODO
    getUser:function(DBObj,username)
    {
        var query="";
        DBObj
    },

    //maybe useless
    checkCredentials:function(DBObj,username,userpw)
    {
        return false;
    },

    //just for debuging
    logUsers:function(DBObj)
    {
        console.log("trying to log db");
        var query = "SELECT * FROM users";

        DBObj.each(query,function(err,row){
            console.log(row.username +" "+ row.password);
        });
    },

    //DONE
    user_exists:function(DBObj,username)
    {
        var query = "SELECT * FROM users WHERE \"username\"= \""+username+"\"";
        var stmt = DBObj.prepare(query);
        stmt.get(function(err,row){
            if(err)
            {
                console.log(err);
                return false;
            }
            else
            {
                if(row == undefined)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
        });   
    }
}