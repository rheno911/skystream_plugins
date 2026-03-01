function getManifest(){return{name:"LaMovie",id:"com.rheno911.lamovie.debug",version:1};}
function getHome(callback){callback({type:"success",value:'{"Test":[{"title":"Working","url":"61323","posterUrl":""}]'});}
function search(query,callback){callback({type:"success",value:'[{"title":"'+query+'","url":"61323","posterUrl":""}]'});}
function load(id,callback){callback({type:"success",value:'{"url":"'+id+'","data":"'+id+'","title":"Movie"}'});}
function loadStreams(id,callback){callback({type:"success",value:'[{"name":"HD","url":"https://s15.vimeos.zip/hls2/01/00009/8l2e7h1uapnz_h/master.m3u8","headers":{"Referer":"https://player.vimeos.zip/"}}]'});}
