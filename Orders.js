import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl
} from "react-native";
import { Block, theme, Text, } from "galio-framework";
import {Language } from "../constants";
const { width, } = Dimensions.get("screen");
import API from './../services/api'
import { TouchableOpacity } from 'react-native-gesture-handler';
import config from './../config'
import {  LoadingIndicator } from 'react-native-expo-fancy-alerts';
import { Checkbox } from 'galio-framework';
import moment from "moment";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';



function Orders({navigation}){

    

  //Location
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [orders,setOrders]=useState([]);
  const [available,setAvailable]=useState(false);
  const [ordersLoaded,setOrdersLoaded]=useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [updatinglocation, setUpdatingLocation] = React.useState(false);
  const cardContainer = [styles.card, styles.shadow];

  const LOCATION_UPDATE_TASK = 'background-location-update';

  TaskManager.defineTask(LOCATION_UPDATE_TASK, async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const { locations } = data;
      console.log("Location update task");
      console.log(locations);
      // Send location updates to the server
      // Example: await sendLocationToServer(locations);
      setLocation(locations[0]);
    }
  });


  async function startBackgroundLocationUpdates() {
    // Request location permissions
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Background Location permission not granted.');
      return;
    }
  
    // Request background location permission for iOS (not needed for Android)
    if (Platform.OS === 'ios') {
      const { status: bgStatus } = await
        Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          console.error('Background location permission not granted');
          return;
        }
      }
    
      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_UPDATE_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 100, // Update interval in milliseconds (optional)
        distanceInterval: 10, // Update distance in meters (optional)
        showsBackgroundLocationIndicator: true, // Shows an indicator on iOS (optional)
      });
    }
    
    // Call the function to start background location updates
    if(config.DRIVER_APP){
    //  startBackgroundLocationUpdates();
      //requestUserLocation();
    }


    function requestUserLocation(){
      (async () => {
        if(config.DRIVER_APP){
          console.log("Requesting location for Driver app");
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Foreground Permission to access location was denied');
            return;
          }
          console.log("Update driver location");
          let locationr = await Location.getCurrentPositionAsync({});
          console.log(locationr);
          setLocation(locationr);
        }
      })();
    }

    function updateOrderLocation(ordersToUpdate){
      if(location!=null&&location.coords){
        ordersToUpdate.forEach(orderToUpdate => {
          API.updateDriverOrderLocation(orderToUpdate.id,location.coords.latitude,location.coords.longitude,(ordersUpdateResponse)=>{},(errorOrdersUpdateResponse)=>{});
        });
      }
    }

    function refreshOrders(){
      console.log("Refresh orders");
      if(config.DRIVER_APP){
        //Driver get orders
        console.log("Location")
        console.log(location)
        API.getDriverOrders(location!=null&&location.coords?location.coords:null,(ordersResponse)=>{
          console.log("Orders loaded ok")
          setOrders(ordersResponse);
          updateOrderLocation(ordersResponse.filter(function (e) {
            return e.last_status[0].alias=="picked_up";
          }));
          setOrdersLoaded(true);
          setRefreshing(false);
        },(error)=>{
          console.log("Orders not loaded ok")
          setOrders([]);
          setRefreshing(false);
          setOrdersLoaded(true);
          alert(error)
        })

        API.getDriverStatus((statusResponse)=>{
          console.log(statusResponse);
          setAvailable(statusResponse.working+""=="1");
        })


      }else if(config.VENDOR_APP){

        //Vendor get orders
        console.log("Before the response");
        API.getVendorOrders((ordersResponse)=>{
          console.log("We did get the response");
          setOrders(ordersResponse);
          setOrdersLoaded(true);
          setRefreshing(false);
        },(error)=>{
          setOrders([]);
          setRefreshing(false);
          setOrdersLoaded(true);
          alert(error)
        })
      }else{
        //Client get orders
        API.getClientOrders((ordersResponse)=>{
          setOrders(ordersResponse);
          setOrdersLoaded(true);
          setRefreshing(false);
        })
      }
    }

    useEffect(() => {
      //console.log("Location changed effect");
      //refreshOrders();
    }, [location]);

    useEffect(()=>{
      refreshOrders();
    },[])

    const onRefresh = React.useCallback(() => {
      refreshOrders();    
    }, []);

    //Timer for location
    useEffect(() => {
      const interval = setInterval(() => {
        //setRefreshing(true);
        requestUserLocation();
      }, 10000);
      return () => clearInterval(interval);
    }, []);

     //Timer for orders
     useEffect(() => {
      const intervalOrders = setInterval(() => {
        refreshOrders()
      }, 10000);
      return () => clearInterval(intervalOrders);
    }, []);


    function setActiveStatus(status){
      API.setActiveStatus(status,(statusResponse)=>{
        console.log("Changed to ->"+statusResponse);
        setAvailable(statusResponse);
      })
    }

    function renderDriverActionBox(initValue){
      
      if(config.DRIVER_APP){
        if(initValue){
          return (
            <Block row={true} card flex style={styles.actioncard} >
                <Block style={{"some":available}} flex space="between" justifyContent="center" paddingHorizontal={10} > 
                    <Checkbox key={"true"} onChange={setActiveStatus} initialValue={true} color="success" labelStyle={{color:"white"}} color="success"  checkboxStyle={{margin:10}} label={Language.driverWorkingStatus} />
                </Block>
            </Block>
          )
        }else{
          return (
            <Block row={true} card flex style={styles.actioncard} >
                <Block style={{"some":available}} flex space="between" justifyContent="center" paddingHorizontal={10} > 
                    <Checkbox key={"false"} onChange={setActiveStatus} initialValue={false} color="success" labelStyle={{color:"white"}} color="success"  checkboxStyle={{margin:10}} label={Language.driverWorkingStatus} />
                </Block>
            </Block>
          )
        }
        
      }else{
        return null
      }
      
    }


    function renderOrderItem(item){
        return (
        <Block row={true} card flex style={cardContainer}>
          <TouchableOpacity onPress={()=>{
            navigation.navigate("OrderDetails",{order:item});
          }}>
             <Block flex space="between" style={styles.cardDescription}>
                <Text bold style={styles.cardTitle}>#{item.id} {item.restorant.name}</Text>
                <Text muted  style={styles.cardTitle}>{Language.created+": "}{moment(item.created_at).format(config.dateTimeFormat)}</Text>
                <Text muted bold style={styles.cardTitle}>{Language.status+": "}{item.status.length-1>-1?item.status[item.status.length-1].name:""}</Text>
                <Text bold style={styles.cardTitle}>{(parseFloat(item.order_price)+parseFloat(item.delivery_price)).toFixed(2)}{config.currencySign}</Text>  
            </Block>
          </TouchableOpacity>
           
        </Block>)
    }

    function renderNoOrders(){
      if(ordersLoaded&&orders.length==0){
        return ( <Text muted>{Language.no_items}</Text>);
      }else{
        return null;
      }
    }

return (
<Block flex center style={styles.home}>
  {
    renderDriverActionBox(available)
  }
<ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.articles}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            >
                <Block flex  >
                {
                    orders.map((item)=>{
                        return renderOrderItem(item)
                    })
                }
                {renderNoOrders()}
                
            </Block>
        </ScrollView>
        <LoadingIndicator  visible={!ordersLoaded}/>
</Block>
)


}
export default Orders;

const styles = StyleSheet.create({
    cartCheckout: {
      backgroundColor:"white"
      },
      listStyle:{
          padding:theme.SIZES.BASE,
      },
    home: {
      width: width,    
    },
    articles: {
      width: width - theme.SIZES.BASE * 2,
      paddingVertical: theme.SIZES.BASE,
    },
    actionButtons:{
  
      //width: 100,
      backgroundColor: '#DCDCDC',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom:9.5,
      borderRadius: 3,
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 1,
    
    },
    card: {
      backgroundColor: theme.COLORS.WHITE,
      marginVertical: theme.SIZES.BASE,
      borderWidth: 0,
      minHeight: 114,
      marginBottom: 16
    },
    actioncard: {
      backgroundColor: theme.COLORS.DARK_SUCCESS,
      marginVertical: theme.SIZES.BASE,
      borderWidth: 0,
      minHeight: 50,
      maxHeight: 50,
      marginHorizontal:16,
      marginBottom: 16,
      alignContent:'center',
      justifyContent:"center"
    },
    cardTitle: {
      flex: 1,
      flexWrap: 'wrap',
      paddingBottom: 6
    },
    cardDescription: {
      padding: theme.SIZES.BASE / 2
    },
    imageContainer: {
      borderRadius: 3,
      elevation: 1,
      overflow: 'hidden',
      resizeMode: "cover"
    },
    image: {
      // borderRadius: 3,
    },
    horizontalImage: {
      height: 122,
      width: 'auto',
    },
    horizontalStyles: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    verticalStyles: {
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0
    },
    fullImage: {
      height: 200
    },
    shadow: {
      shadowColor: theme.COLORS.BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.1,
      elevation: 2,
    },
  });
