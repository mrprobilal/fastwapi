import CommonAPI from './common_api'
import ClientAPI from './client_api'
import DriverAPI from './driver_api'
import VendorAPI from './vendor_api'

/**
  * 
  * COMMON API
  * 
  */
exports.loginUser=CommonAPI.loginUser;
exports.registerUser=CommonAPI.registerUser;
exports.getNotifications=CommonAPI.getNotifications;
exports.updateOrderStatus=CommonAPI.updateOrderStatus;
exports.deactivateUser=CommonAPI.deactivateUser;

/**
 * 
 * Client API
 * 
 */
 exports.getCities=ClientAPI.getCities;
 exports.getRestaurants=ClientAPI.getRestaurants;
 exports.getRestaurantInfo=ClientAPI.getRestaurantInfo;
 exports.getDeliveryFee=ClientAPI.getDeliveryFee;
 exports.getItemsInRestaurant=ClientAPI.getItemsInRestaurant;
 exports.placeOrder=ClientAPI.placeOrder;
 exports.getClientOrders=ClientAPI.getClientOrders;
 exports.getAddressWithFees=ClientAPI.getAddressWithFees;
 exports.getAddress=ClientAPI.getAddress;
 exports.saveAddress=ClientAPI.saveAddress;

/**
  * 
  * DRIVER API
  * 
  */
exports.getDriverStatus=DriverAPI.getDriverStatus;
exports.setActiveStatus=DriverAPI.setActiveStatus;
exports.getDriverOrders=function(coords,cs,ce){
  if(coords==null){
    DriverAPI.getDriverOrders(cs,ce);
  }else{
    DriverAPI.getDriverOrdersWithLatLng(coords,cs,ce);
  }
}
exports.getDriverOrder=DriverAPI.getDriverOrder;
exports.getDriverEarnings=DriverAPI.getDriverEarnings;
exports.updateDriverOrderLocation=DriverAPI.updateDriverOrderLocation;
exports.updateDriverLocation=DriverAPI.updateDriverLocation;
exports.updateOrderDeliveryPrice=DriverAPI.updateOrderDeliveryPrice;

/**
  * 
  * VENDOR API
  * 
  */
 exports.getVendorOrders=VendorAPI.getVendorOrders;
 exports.getVendorOrder=VendorAPI.getVendorOrder;
 exports.getVendorEarnings=VendorAPI.getVendorEarnings;

 /**
  * 
  * CHAT API
  * 
  * 
  */
 exports.getConversations=VendorAPI.getConversations
 exports.getChatMessages=VendorAPI.getChatMessages
 exports.sendMessage=VendorAPI.sendMessage