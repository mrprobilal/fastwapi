import React, { useState, useEffect,useRef } from 'react';
import { StyleSheet,ScrollView,Dimensions, LogBox ,Platform, Linking,} from 'react-native'
import { Block, theme, Text, } from "galio-framework";
const { height, width } = Dimensions.get('screen');
import { Language } from '../constants';
import config from "./../config";
import settings from "./../services/settings";
import MapView , { Marker } from 'react-native-maps';
import moment from "moment";
import Fancy from "./../components/Fancy"
import InfoBox from "../components/InfoBox"
import Input from "../components/Input"
import API from './../services/api'
import Button from "../components//Button";
import md5 from 'md5';


/**
   * Open on the map the location of the restaurant
   * @param {Float} lat 
   * @param {Float} long 
   */
 function openExternalApp(lat, long) {
  var scheme = Platform.OS === 'ios' ? 'apple' : 'google'
  Linking.canOpenURL('http://maps.' + scheme + '.com/maps?daddr=' + lat + ',' + long).then(supported => {
    if (supported) {
      Linking.openURL('http://maps.' + scheme + '.com/maps?daddr=' + lat + ',' + long);
    } else {

    }
  });
}

function openExternalAppByAddress(address) {
  var scheme = Platform.OS === 'ios' ? 'apple' : 'google'
  Linking.canOpenURL('http://maps.' + scheme + '.com/maps?daddr=' +address).then(supported => {
    if (supported) {
      Linking.openURL('http://maps.' + scheme + '.com/maps?daddr=' + address);
    } else {

    }
  });
}


/**
   * Call the restaurant function
   * @param {String} phoneNumber 
   */
 function openPhoneApp(phoneNumber) {
  console.log(phoneNumber)
  var number = "tel:" + phoneNumber
  Linking.canOpenURL(number).then(supported => {
    if (supported) {
      Linking.openURL(number);
    } else {

    }
  });
}



function OrderDetails({navigation,route}){
    const [order,setOrder]=useState(route.params.order);
    const [driver_percent_from_deliver,setDriverPercentFromDeliver]=useState(100);
    const [issd,setIsSD]=useState(false);
    const [units,setUnits]=useState("K");
    const [action,setAction]=useState("");
    const [refreshing, setRefreshing] = React.useState(false);
    const [order_delivery_price,setOrderDeliveryPrice]=useState(route.params.order.delivery_price)

    useEffect(()=>{
      if(config.DRIVER_APP){
        //Driver get orders
        API.getDriverOrder(order.id,(ordersResponse)=>{
          ordersResponse.restorant=order.restorant;
          ordersResponse.client=order.client;
          ordersResponse.address=order.address;
          ordersResponse.items=order.items;
          setOrder(ordersResponse);
          setRefreshing(false);
        },(error)=>{alert(error)})
      }else{
      } 
    },[refreshing])

    useEffect(()=>{
      settings.getSettingsKey(setDriverPercentFromDeliver,'driver_percent_from_deliver',100)
      settings.getSettingsKey(setIsSD,'issd',false)
      settings.getSettingsKey(setUnits,'units',"K")
    },[])

    //Timer
    useEffect(() => {
      const interval = setInterval(() => {
        setRefreshing(true);
      }, 20000);
      return () => clearInterval(interval);
    }, []);
    

    function showActions(){
      if(config.DRIVER_APP||config.VENDOR_APP){
        if(order.actions.buttons.length>0||order.actions.message){
          return (
            <InfoBox title={Language.actions}>
              <Block center  height={order.actions.buttons.length==0?50:null}> 
              {
                order.actions.buttons.map((action)=>{
                  return (<Button onPress={()=>{setAction(action)}} style={{opacity:(action.indexOf('reject')>-1?0.5:1)}} size="large" color={action.indexOf('reject')>-1?"error":"success"} >{Language[action].toUpperCase()}</Button>)
                })
              }
              <Text  size={14} muted >{order.actions.message}</Text>
              </Block>
          </InfoBox>
          )
        }else{
          return null
        }
      }else{
        return null
      }
    
    }

    function showDeliveryAddress(){
        if(order.delivery_method==1&&order.address){
         return ( 
            <InfoBox title={Language.deliveryAddress}>
                 <Text  size={14} style={styles.cardTitle}>{order.address.address}</Text>
                 <Block row center>
                          <Button onPress={()=>{openPhoneApp(order.client.phone)}}  size="small" color={"default"} >{Language.call.toUpperCase()}</Button>
                          <Button onPress={()=>{openExternalApp(order.address.lat,order.address.lng)}} size="small" color={"warning"} >{Language.directions.toUpperCase()}</Button>
                </Block>
            </InfoBox>
        
         )
        }else{
          return null;
        }
      }

      function showDriver(){
        if(order.delivery_method==1&&order.driver){
         return ( 
            <InfoBox title={Language.driver}>
                 <Text  size={14} style={styles.cardTitle}>{Language.driverName+": "}{order.driver.name}</Text>
                 <Text  size={14} style={styles.cardTitle}>{Language.driverPhone+": "}{order.driver.phone}</Text>
            </InfoBox>
        
         )
        }else{
          return null;
        }
      }

      function sendWhatsAppMessage(message){
        Linking.openURL(
          'http://api.whatsapp.com/send?phone=' + order.phone +"&text="+message
        );
      }

      function showMap(){
        if(order.delivery_method==1&&order.driver&&order.status[order.status.length-1].alias=="picked_up"){
         return ( 
            <InfoBox title={Language.orderTracking}>
                 <MapView 
                    region={{
                        latitude: order.lat,
                        longitude:order.lng,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.009,
                    }}
                    style={[{height:300,marginVertical:10}]}
                    showsScale={true}
                    showsBuildings={true}
                >
                    <Marker 
                key={1}
                coordinate={{latitude:order.lat,longitude:order.lng}}
                title={"Location"}
                description={""} 
                />
                </MapView>
            </InfoBox>
        
         )
        }else{
          return null;
        }
      }

    return (
        <Block flex center style={styles.home}>
          
        <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.articles}>
                  
                    <Block flex  >

                        {/* MODALS */}

                        {/* Reject by driver or owner */}
                        <Fancy 
                        visible={action=="rejected_by_driver"||action=="rejected_by_restaurant"} 
                        icon_ios={'thumbs-down-outline'} icon_android="thumbs-down-outline"
                        title={Language.reject_order} subtitle={Language.reject_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,action,"",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                            if(issd){
                              sendWhatsAppMessage(Language.message_when_rejected);
                            }
                          })}}
                        ></Fancy>

                         {/* SD - At client location */}
                         <Fancy 
                        visible={action=="at_location"} 
                        icon_ios={'location-outline'} icon_android="location-outline"
                        title={Language.at_location} subtitle={Language.inform_at_location}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          setAction("");
                          sendWhatsAppMessage(Language.message_at_location);
                        }}
                        ></Fancy>


                        {/* Approve */}
                        <Fancy 
                        visible={action=="accepted_by_driver"||action=="accepted_by_restaurant"} 
                        icon_ios={'thumbs-up-outline'} icon_android="thumbs-up-outline"
                        title={Language.accept_order} subtitle={Language.accept_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,action,"",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                            if(issd){
                              var approveMessage=Language.message_when_approved;
                              //Append the location tracking option
                              approveMessage+="\n\n"+Language.message_when_approved_tracking+"\n\n"+config.domain+"/l/"+order.md;
                              sendWhatsAppMessage(approveMessage);
                            }
                          })}}
                        ></Fancy>

                        {/* Prepare */}
                        <Fancy 
                        visible={action=="prepared"} 
                        icon_ios={'checkmark-circle-outline'} icon_android="checkmark-circle-outline"
                        title={Language.prepared_order} subtitle={Language.prepared_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,action,"",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                          })}}
                        ></Fancy>

                         {/* Pickup */}
                         <Fancy 
                        visible={action=="picked_up"} 
                        icon_ios={'checkmark-circle-outline'} icon_android="checkmark-circle-outline"
                        title={issd?Language.client_picked_up:Language.pickup_order} subtitle={issd?Language.client_picked_up_info:Language.pickup_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,"picked_up","",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                          })}}
                        ></Fancy>

                        {/* Delivered */}
                        <Fancy 
                        visible={action=="delivered"} 
                        icon_ios={'pin-outline'} icon_android="pin-outline"
                        title={issd?Language.deliver_client:Language.deliver_order} subtitle={issd?Language.deliver_client_info:Language.deliver_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,"delivered","",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                          })}}
                        ></Fancy>


                         {/* Closed */}
                         <Fancy 
                        visible={action=="closed"} 
                        icon_ios={'pin-outline'} icon_android="pin-outline"
                        title={Language.close_order} subtitle={Language.close_order_info}
                        button={Language.ok} closeAction={()=>{setAction("")}}
                        action={()=>{
                          API.updateOrderStatus(order.id,"closed","",(data)=>{
                            setAction("");
                            setOrder(data[0]);
                          })}}
                        ></Fancy>
                      

                      
                        {/* Show actions */}
                        {showActions()}

                         {/* Change order price */}
                         <InfoBox title={Language.change_price} hide={action!="change_price"}>
                            <Text size={14} style={styles.cardTitle}>{Language.change_price_info}</Text>
                            <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
                                <Input right placeholder={order_delivery_price+""} iconContent={<Block />} value={order_delivery_price+""} onChange={({ nativeEvent: { text } }) => setOrderDeliveryPrice(text)} />
                            </Block>
                            <Block row center>
                                <Button onPress={()=>{
                                      setAction("");
                                      API.updateOrderDeliveryPrice(order.id,order_delivery_price,(data)=>{
                                        setOrder(data[0]);
                                      })
                                }} size="small" color={"success"} >{Language.ok.toUpperCase()}</Button>
                            </Block>
                        </InfoBox>

                        {/* info */}
                        <InfoBox title={Language.order}>
                            <Text size={14} style={styles.cardTitle}>{Language.orderNumber+": #"}{order.id}</Text>
                            <Text size={14} style={styles.cardTitle}>{Language.created+": "}{moment(order.created_at).format(config.dateTimeFormat)}</Text>
                            <Text bold size={14} style={styles.cardTitle}>{Language.status+": "}{order.last_status.length>0?order.last_status[0].name:""}</Text>
                        </InfoBox>

                         {/* map */}
                         {showMap()}

                        {/* Driver */}
                        {showDriver()}

                         {/* Pickup - client ifo - show in sd */}
                         <InfoBox title={Language.pickup} hide={!issd}>
                          <Text bold style={styles.cardTitle}>{order.pickup_address}</Text>
                          <Text size={14} style={styles.cardTitle}>{order.phone}</Text>
                          <Block row center>
                            <Button onPress={()=>{openPhoneApp(order.phone)}} size="small" color={"default"} >{Language.call.toUpperCase()}</Button>
                            <Button onPress={()=>{openExternalApp(order.pickup_lat,order.pickup_lng)}} size="small" color={"warning"} >{Language.directions.toUpperCase()}</Button>
                          </Block>
                        </InfoBox>

                         {/* Drop off - client ifo - show in sd */}
                         <InfoBox title={Language.drop_off} hide={!issd}>
                          <Text bold style={styles.cardTitle}>{order.delivery_address}</Text>
                          <Text size={14} style={styles.cardTitle}>{order.distance} {units=="K"?"Km":units}</Text>
                          <Block row center>
                            <Button onPress={()=>{openExternalApp(order.delivery_lat,order.delivery_lng)}} size="small" color={"warning"} >{Language.directions.toUpperCase()}</Button>
                          </Block>
                        </InfoBox>

                        {/* Client INFO () - hide in sd */}
                        <InfoBox title={Language.Client} hide={order.configs.length==0}>
                          <Text bold style={styles.cardTitle}>{order.configs.client_name}</Text>
                          <Text muted size={14} style={styles.cardTitle}>{order.configs.client_phone}</Text>
                          <Text size={14} style={styles.cardTitle}>{Language.Area}: {order.configs.delivery_area_name}</Text>
                          <Text size={14} style={styles.cardTitle}>{Language.deliveryAddress}: {order.whatsapp_address}</Text>
                          <Block row center>
                            <Button onPress={()=>{openPhoneApp(order.phone.length>3?order.phone:order.configs.client_phone)}} size="small" color={"default"} >{Language.call.toUpperCase()}</Button>
                            <Button onPress={()=>{openExternalAppByAddress(order.whatsapp_address)}} size="small" color={"warning"} >{Language.directions.toUpperCase()}</Button>
                          </Block>
                        </InfoBox>

                        {/* Restaurant - hide in sd and hide when owner */}
                        <InfoBox title={Language.restaurant} hide={order.items.length==0 || config.VENDOR_APP}>
                          <Text bold style={styles.cardTitle}>{order.restorant.name}</Text>
                          <Text muted size={14} style={styles.cardTitle}>{order.restorant.address}</Text>
                          <Text size={14} style={styles.cardTitle}>{order.restorant.phone}</Text>
                          <Block row center>
                            <Button onPress={()=>{openPhoneApp(order.restorant.phone)}} size="small" color={"default"} >{Language.call.toUpperCase()}</Button>
                            <Button onPress={()=>{openExternalApp(order.restorant.lat,order.restorant.lng)}} size="small" color={"warning"} >{Language.directions.toUpperCase()}</Button>
                          </Block>
                        </InfoBox>

                        {/* Items */}
                        <InfoBox title={Language.items}  hide={order.items.length==0}>
                           {
                               order.items.map((item,index)=>{
                                return (
                                  <Block style={{marginTop:10}}>
                                    <Text size={14} style={styles.cardTitle}>{item.pivot.qty+" x "+item.name+"  "+item.pivot.variant_name+" "+item.pivot.variant_price}{config.currencySign}</Text>
                                    <Text muted style={styles.cardTitle}>{JSON.parse(item.pivot.extras).join(', ')}</Text>
                                  </Block>
                                )
                                })
                           }
                        </InfoBox>

                        {/* Address */}
                        {showDeliveryAddress()}

                         {/* deliveryMethod */}
                         <InfoBox title={Language.deliveryMethod}  hide={issd ||order.delivery_method==3 }>
                         <Text size={14} style={styles.cardTitle}>{Language.deliveryMethod+": "+(order.delivery_method==1?Language.delivery:Language.pickup)}</Text>
                         <Text size={14} style={styles.cardTitle}>{(order.delivery_method==1==1?Language.deliveryTime:Language.pickupTime)+": "+order.time_formated}</Text>
                        </InfoBox>

                        {/* Table */}
                        <InfoBox title={Language.table}  hide={order.delivery_method!=3}>
                         <Text size={14} style={styles.cardTitle}>{"#: "+order.tableassigned&&order.tableassigned[0]?order.tableassigned[0].name:""}</Text>
                         <Text size={14} style={styles.cardTitle}>{Language.Area+": "}{order.tableassigned&&order.tableassigned[0]&&order.tableassigned[0].restoarea?order.tableassigned[0].restoarea.name:""}</Text>
                        </InfoBox>

                         

                        {/* summary */}
                        <InfoBox title={Language.summary}>
                            <Block row space={"between"} style={{marginTop:16}}>
                                <Block><Text bold style={[styles.cardTitle]}>{Language.subtotal}</Text></Block>
                                <Block><Text  >{order.order_price}{config.currencySign}</Text></Block>
                            </Block>
                            <Block row space={"between"} style={{marginTop:0}}>
                                <Block><Text bold style={[styles.cardTitle]}>{Language.delivery}</Text></Block>
                                <Block><Text>{issd?"~":""}{order.delivery_price}{config.currencySign}</Text></Block>
                            </Block>

                            <Block row space={"between"} style={{marginTop:16}}>
                                <Block><Text bold style={[styles.cardTitle]}>{Language.total}</Text></Block>
                                <Block><Text bold >{issd?"~":""}{(parseFloat(order.order_price)+parseFloat(order.delivery_price)).toFixed(2)}{config.currencySign}</Text></Block>
                            </Block>
                        </InfoBox>

                       
                    
                </Block>
            </ScrollView>
        </Block>
    )
}

export default OrderDetails

const styles = StyleSheet.create({
    home: {
        width: width,    
      },
    card: {
        backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 114,
        marginBottom: 16
      },
      cardTitle: {
        flex: 1,
        flexWrap: 'wrap',
        paddingBottom: 6
      },
      cardDescription: {
        padding: theme.SIZES.BASE / 2
      },
      shadow: {
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 2,
      },
      articles: {
        width: width - theme.SIZES.BASE * 2,
        paddingVertical: theme.SIZES.BASE,
      },
})
