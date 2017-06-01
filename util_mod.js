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
        var count = 0;
        fs.readdir(__FilesDir,function(err,files){
            files.forEach(file=>{
                var ftype = path.extname(file);
                var fname = path.basename(file,ftype);
                var fi = { "num" : count , "fname" : fname , "ftype" : ftype };
                count = count + 1;
                s_files.push(fi);
            });
        });
        return s_files;
    },

    /* 
        Logging 

        log.txt string = <log0>|<log1>|.......
        <logi> = timestamp:logmsg
    */

    /* Log to txt file | type=0->Info 1->Error */
    log_to_file:function(type,msg)
    {
        var __logpath = './log.txt';
        if(type===0)
        {
            fs.readFile(__logpath,'utf8',function(err,data)
            {
                if(err)
                {
                    fs.writeFile("log.txt","InitLog|",function(err)
                    {
                        if(err)
                        {
                            return;
                        }
                        else
                        {
                            var stamp = + new Date();
                            var log = stamp + msg;
                            data = data + log;
                            fs.writeFile("log.txt",data,function(err)
                            {

                            });
                        }
                    });
                }
                else
                {

                }
            });
        }
        else if(type===1)
        {

        }
    },

    /* just logging to console type just like log_to_file */
    log_to_console:function(type,msg)
    {
        if(type===0)
        {
            
        }
        else if(type===1)
        {

        }
    }
}