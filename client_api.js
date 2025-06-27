import APICaller from './api_callers';


/**
 * 
 * Vendors
 * 
 */
exports.getCities=(callback)=>{APICaller.publicAPI('GET','client/vendor/cities',{},callback,(error)=>{alert(error)})};
exports.getRestaurants=(city_id,callback)=>{APICaller.publicAPI('GET','client/vendor/list/'+(city_id?city_id:"none"),{},callback,(error)=>{alert(error)})};
exports.getRestaurantInfo=(id,callback)=>{APICaller.publicAPI('GET','client/vendor/'+id+'/hours',{},callback,(error)=>{alert(error)})};
exports.getDeliveryFee=(restaurant_id,address_id,callback)=>{APICaller.publicAPI('GET','client/vendor/deliveryfee/'+restaurant_id+'/'+address_id,{},callback,(error)=>{alert(error)})};
exports.getItemsInRestaurant=(id,callback)=>{APICaller.publicAPI('GET','client/vendor/'+id+'/items',{},callback,(error)=>{alert(error)})};



/**
 * 
 * Orders
 * 
 */
async function placeOrder(paymentObject,callback){

  //Modify the payment object so instead variant:{object}, we have variant:id
  paymentObject.items.forEach(function(item, index) {
    if(item.variant){
      paymentObject.items[index]['variant'] = item.variant.id;
    }
  });

  APICaller.authAPI('POST','client/orders',paymentObject,callback,(error)=>{alert(error)})
}
exports.placeOrder=placeOrder;
exports.getClientOrders=async (callback)=>{APICaller.authAPI('GET','client/orders',{},callback,(error)=>{alert(error)})};


/**
 * 
 * Address
 * 
 */
exports.getAddressWithFees=async (restoid,callback)=>{APICaller.authAPI('GET','client/addresses/fees/'+restoid,{},callback,(error)=>{alert(error);callback([]);})};
exports.getAddress=async (callback)=>{APICaller.authAPI('GET','client/addresses',{},callback,(error)=>{alert(error);callback([]);})};
exports.saveAddress=async (addressElement,callback)=>{APICaller.authAPI('POST','client/addresses',addressElement,callback,(error)=>{alert(error);})};