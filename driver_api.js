import APICaller from './api_callers';

/***
 * 
 * AUTH 
 * 
 */
exports.getDriverStatus=async (callback)=>{APICaller.authAPI('GET','driver/auth/data',{},callback,(error)=>{alert(error)})};
exports.setActiveStatus=async (status,callback)=>{APICaller.authAPI('GET',"driver/auth/"+(status?"driveronline":"drveroffline"),{},(data)=>{callback(data.working==1)},(error)=>{alert(error);callback(!status)});};


 /***
 * 
 * ORDERS 
 * 
 */
exports.getDriverOrders=async (callback,eCallback)=>{APICaller.authAPI('GET','driver/orders',{},callback,eCallback)};
exports.getDriverOrdersWithLatLng=async (coords,callback,eCallback)=>{APICaller.authAPI('GET','driver/orders/with_latlng/'+coords.latitude+"/"+coords.longitude,{},callback,eCallback)};
exports.getDriverOrder=async (id,callback,eCallback)=>{APICaller.authAPI('GET','driver/orders/order/'+id,{},callback,eCallback)};
exports.getDriverEarnings=async (callback,eCallback)=>{APICaller.authAPI('GET','driver/orders/earnings',{},callback,eCallback)};
exports.updateDriverOrderLocation=async (id,lat,lng,callback,eCallback)=>{APICaller.authAPI('GET','driver/orders/updateorderlocation/'+id+"/"+lat+"/"+lng,{},callback,eCallback)};
exports.updateOrderDeliveryPrice=async (order_id,delivery_price,callback)=>{APICaller.authAPI('GET','driver/orders/updateorderdeliveryprice/'+order_id+"/"+delivery_price,{},callback,(error)=>{alert(error)})
};