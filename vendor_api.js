import APICaller from './api_callers';


/***
 * 
 * ORDERS 
 * 
 */
exports.getVendorOrders=async (callback,eCallback)=>{APICaller.authAPI('GET','vendor/orders',{},callback,eCallback)};
exports.getVendorOrder=async (id,callback,eCallback)=>{APICaller.authAPI('GET','vendor/orders/order/'+id,{},callback,eCallback)};
exports.getVendorEarnings=async (callback,eCallback)=>{APICaller.authAPI('GET','vendor/orders/earnings',{},callback,eCallback)};

/***
 * 
 *  CHATS
 */
exports.getConversations=async (callback,eCallback)=>{APICaller.authAPIPureSaaS('POST','api/wpbox/getConversations/none?from=mobile_api',{},callback,eCallback)};
exports.getChatMessages=async (callback,eCallback,data)=>{APICaller.authAPIPureSaaS('POST','api/wpbox/getMessages',data,callback,eCallback)};
exports.sendMessage=async (callback,eCallback,data)=>{APICaller.authAPIPureSaaS('POST','api/wpbox/sendmessage',data,callback,eCallback)};