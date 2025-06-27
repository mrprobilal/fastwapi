import APICaller from './api_callers';
import config from "./../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login user
 * @param {*} email 
 * @param {*} password 
 * @param {*} callback 
 */
function loginUser(email,password,expoPushToken,callback){
    var link='client/auth/gettoken';
    if(config.DRIVER_APP){
      link='driver/auth/gettoken';
    }
    if(config.VENDOR_APP){
      link='vendor/auth/gettoken';
    }
    if(config.CHAT_APP){
      link='login';
    }

    var loginData={
      email:email,
      password:password
     };
     if(expoPushToken.length>3){
      loginData.expotoken=expoPushToken;
     }

  
    APICaller.publicAPI('POST',link,loginData,(response)=>{
        if(!config.CHAT_APP){
          setSettings();
        }
        callback(response)
    },(error)=>{alert(error)});
   }
exports.loginUser=loginUser;

/**
 * Register user / vendor account
 * @param {*} name 
 * @param {*} email 
 * @param {*} password 
 * @param {*} phone 
 * @param {*} callback 
 */
function registerUser(name,email,password,phone,callback){
    const data = { 
      name: name,
      email:email,
      password:password,
      phone:phone,
      app_secret:config.APP_SECRET,
    };
  
    var link='client/auth/register';
    if(config.DRIVER_APP){
      link='driver/auth/register';
    }
    if(config.VENDOR_APP){
      link='vendor/auth/register';
      data.vendor_name=name;
    }
    APICaller.publicAPI('POST',link,data,(response)=>{
        setSettings();
        callback(response)
    },(error)=>{
      console.log(error);
      alert(error)
    })
  
}
exports.registerUser=registerUser;

/**
 * Set setting
 */
async function setSettings(){
    APICaller.authAPI('GET','client/settings',{},async (response)=>{
      await AsyncStorage.setItem('settings',JSON.stringify(response));
    },(error)=>{alert(error)})
}

/**
 * getNotifications
 * @param {*} callback 
 */
exports.getNotifications=async (callback)=>{APICaller.authAPI('GET','client/notifications',{},callback,(error)=>{alert(error)})}
   

/**
 * Update orders status
 * @param {*} order_id 
 * @param {*} status_slug 
 * @param {*} comment 
 * @param {*} callback 
 */
exports.updateOrderStatus=async (order_id,status_slug,comment,callback)=>{
    var statuses={
        "just_created":"1",
        "accepted_by_admin":"2",
        "accepted_by_restaurant":"3",
        "assigned_to_driver":"4",
        "prepared":"5",
        "picked_up":"6",
        "delivered":"7",
        "rejected_by_admin":"8",
        "rejected_by_restaurant":"9",
        "updated":"10",
        "closed":"11",
        "rejected_by_driver":"12",
        "accepted_by_driver":"13"
    }
    var mode=config.DRIVER_APP?"driver":"vendor";
    APICaller.authAPI('GET',mode+'/orders/updateorderstatus/'+order_id+"/"+statuses[status_slug],{"comment":comment},callback,(error)=>{alert(error)})
};


exports.deactivateUser=async (callback,eCallback)=>{APICaller.authAPI('GET','client/auth/deactivate',{},callback,eCallback)};