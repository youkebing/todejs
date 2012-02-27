var fsModule = require("fs");
var pathModule = require("path");

/**
 * class Template
 * */
function Template()
{
	this.response = null;
	this.path = '';
	this.tmpl = null;
}

Template.prototype.render = function(response,path)
{
	this.response = response;  
	this.path = path;  
	this.findfile();
	return new Render(response,this.tmpl,this.path)
}

Template.prototype.findfile = function()
{
	    this.tmpl = new Array();
	    var files   = fsModule.readdirSync(this.path)
	    for(var i=0;i<files.length;i++)
	    {
	    	if( pathModule.extname(files[i])=='.html' )
	    	{
	    		this.tmpl.push( files[i].split('.')[0] );
	    	}
	    }
}
/**
 * class Render
 * */
function Render(response,tmpl,path)
{ 
		
	this.response = response;
	this.tmpl = tmpl;
	this.path = path;
	var thisObj = this;
    for(var i=0;i<this.tmpl.length;i++)
	{
	    Render.prototype[this.tmpl[i]] = function(filename)
	    {
	    	  return function(variable){
					var html = fsModule.readFileSync(this.path+filename+".html",'utf-8');
					this.response.writeHead(200, {"Content-Type": "text/html"});
					this.response.write( this.parse(html,variable) );
					this.response.end();
			 };
	    }(this.tmpl[i]);
	}
	
}
Render.prototype.parse = function(html,variable)
{
    html = Render.normalize(html)	
	var lines = html.split("\n");
	var item = {data:variable}
	var nfunc = this.bulidTmplFunc( lines );
    //Render.out(  )
    //var rline = nfunc(item);
    return nfunc(item).join('\n')
}
Render.prototype.bulidTmplFunc = function(lines)
{
	
    var block = new Array();
	var func = "var __=[],$data=item.data;";
	func += "with($data){"
	var text = new Array()
    for(i=0;i<lines.length;i++)
    {	
    	patt = /\{\{(\/?)(\w+)(.*?)\}\}/    	
    	if((result = patt.exec( lines[i] )) != null)
    	{
    		if( result[1] == '' )
    		{
    			block.push( result[2] );
    			if( result[2] == "elseif" )
    			{
    				func +="}else if"+ result[3] ;
    			}
    			else if( result[2] == "else" )
    			{
    				func +="}else"+ result[3] ;
    			}    			
    			else
    			{
    				func += result[2]+ result[3] ;
    			}
    			func += "{";
    		}
    		else
    		{
    			func += "}" 
    		}
    	}
    	else
    	{
    		lines[i] = lines[i].replace(/\${(.*?)\}/g,"\"+$1+\"");
    		func += "__.push(\""+lines[i]+"\");" 
    		text.push( lines[i] );
    	}
    }
    func  += "};return __;";
	return  new Function("item",func);
}
Render.normalize = function(html)
{
	return html.replace(/\r\n/g,'\n').replace(/\r/g, '\n').replace(/"/g, '\\"').replace(/'/g, '\\\'');
}
Render.out = function out(array)
{
	document.write('#####################################')
	for(var v in array)
	{
		document.write( array[v] )
	}
}
exports.template = new Template();