const fs = require('fs');
const path = require('path');
module.exports = 
{
    /* Returns a list of json objects({fname:"",ftype""}) of the files in the ./Files dir */
    file_listing:function()
    {
        console.log("userdb: login correct user exists and pass is matching");
        var s_files = [];
        var __FilesDir = './Files/';
        fs.readdir(__FilesDir,function(err,files){
            files.forEach(file=>{
                var ftype = path.extname(file);
                var fname = path.basename(file,ftype);
                var fi = { "fname" : fname , "ftype" : ftype };
                s_files.push(fi);
            });
        });
        return s_files;
    }


}