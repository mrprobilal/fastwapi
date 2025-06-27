import React, { useState, useEffect,useRef } from 'react';
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
import { LoadingIndicator } from 'react-native-expo-fancy-alerts';
import { NavigationEvents } from '@react-navigation/native';
import moment from "moment";
import config from "./../config";

function Notifications({navigation}){
    
    const [notifications,setNotifications]=useState([]);
    const [notificationsLoaded,setNotificationsLoaded]=useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const cardContainer = [styles.card, styles.shadow];

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);

      API.getNotifications((notificationsResponse)=>{
        setNotifications(notificationsResponse);
        setRefreshing(false);
      })
    }, [refreshing]);


    function renderNotificationItem(item){
        return (
        <Block row={true} card flex style={cardContainer}>
          <TouchableOpacity>
             <Block flex space="between" style={styles.cardDescription}>
                <Text bold style={styles.cardTitle}>{item.data.title}</Text>
                <Text bld style={styles.cardTitle}>{item.data.body}</Text>
                <Text muted  style={styles.cardTitle}>{Language.created+": "}{moment(item.created_at).format(config.dateTimeFormat)}</Text>
            </Block>
          </TouchableOpacity>
           
        </Block>)
    }


    useEffect(()=>{
      API.getNotifications((notificationsResponse)=>{
        setNotifications(notificationsResponse);
        setNotificationsLoaded(true);
      })
  },[])

return (
    <Block flex center style={styles.home}>
       <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.articles}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            >
                <Block flex  >
                    <Text muted>{notificationsLoaded&&notifications.length==0?Language.noNotifications:""}</Text>
                {
                    notifications.map((item)=>{
                        return renderNotificationItem(item)
                    })
                }
                
            </Block>
        </ScrollView>
        <LoadingIndicator  visible={!notificationsLoaded}/>
    </Block>

      
    
    
)

}
export default Notifications;

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
