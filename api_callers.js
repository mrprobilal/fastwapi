import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function authAPI(method,path,data,callback,errorCallback){
   console.log("Calling the api, befores")
    var token = await AsyncStorage.getItem('token');
    var link=config.domain+'/api/v2/'+path+'?api_token='+token;
    console.log(link);
 
    var sendParam={
        method: method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      };
    if(method=="POST"){
        sendParam.body=JSON.stringify(data);
    }

    fetch(link, sendParam).then((response) => response.json()).then((responseJson) => {
     if(responseJson.status){
      callback(responseJson.data?responseJson.data:responseJson);
     }else{
        var message="";
        if(responseJson.message!=undefined){
          message+=responseJson.message;
        }
        if(responseJson.errMsg!=undefined){
          message+=" "+responseJson.errMsg;
        }
        errorCallback(message);
     } 
   }).catch(error => {
     console.error(error);
   });
}
exports.authAPI=authAPI;


async function authAPIPureSaaS(method,path,data,callback,errorCallback){
  console.log("Calling the api, authAPIPureSaaS")
   var token = await AsyncStorage.getItem('token');
   var link=config.domain+'/'+path;
   console.log(link);

   var sendParam={
       method: method,
       headers: {
         Accept: 'application/json',
         
         'Content-Type': 'application/json',
       },

     };
     data.token=token;
     sendParam.body=JSON.stringify(data);
     console.log(sendParam);
   

   fetch(link, sendParam).then((response) => response.json()).then((responseJson) => {
    if(responseJson.status!="error"){
     callback(responseJson.data?responseJson.data:responseJson);
    }else{
       var message="";
       if(responseJson.message!=undefined){
         message+=responseJson.message;
       }
       if(responseJson.errMsg!=undefined){
         message+=" "+responseJson.errMsg;
       }
       errorCallback(message);
    } 
  }).catch(error => {
    console.error(error);
  });
}
exports.authAPIPureSaaS=authAPIPureSaaS;


/**
 * 
 * @param {*} method 
 * @param {*} path 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} errorCallback 
 */
async function publicAPI(method,path,data,callback,errorCallback){
  var link=config.domain+'/api/v2/'+path;
  console.log(link);
  console.log(method);

  var sendParam={
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };
  if(method=="POST"){
      sendParam.body=JSON.stringify(data);
  }
  console.log(link);
  console.log(sendParam);
  fetch(link, sendParam).then((response) => response.json()).then((responseJson) => {
   if(responseJson.status){
    callback(responseJson.data?responseJson.data:responseJson);
   }else{
      var message="";
      if(responseJson.message!=undefined){
        message+=responseJson.message;
      }
      if(responseJson.errMsg!=undefined){
        message+=" "+responseJson.errMsg;
      }
      console.log(message);
      console.log(responseJson);
      errorCallback(message);
   } 
 }).catch(error => {
   console.error(error);
 });
}
exports.publicAPI=publicAPI;
