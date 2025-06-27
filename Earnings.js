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
import EarningBox from "./../components/EarningBox"
import { TouchableOpacity } from 'react-native-gesture-handler';
import config from './../config'
import {  LoadingIndicator } from 'react-native-expo-fancy-alerts'
import argonTheme from "../constants/Theme";

function Earnings({navigation}){
    
    const [earnings, setEarnings]=useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const [earningsLoaded,setEarningsLoaded]=useState(false);

    useEffect(()=>{
      if(config.DRIVER_APP){
        //Driver get orders
        API.getDriverEarnings((earningsResponse)=>{
          setEarnings(earningsResponse);
          setRefreshing(false);
          setEarningsLoaded(true);
        },(error)=>{
          setEarnings(null);
          setRefreshing(false);
          alert(error);
          setEarningsLoaded(true);
        })
      }if(config.VENDOR_APP){
        //Driver get orders
        API.getVendorEarnings((earningsResponse)=>{
          setEarnings(earningsResponse);
          setRefreshing(false);
          setEarningsLoaded(true);
        },(error)=>{
          setEarnings(null);
          setRefreshing(false);
          alert(error);
          setEarningsLoaded(true);
        })
      }else{
      }
    },[refreshing])

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);      
    }, [refreshing]);

    //Timer
    useEffect(() => {
      const interval = setInterval(() => {
        setRefreshing(true);
      }, 30000);
      return () => clearInterval(interval);
    }, []);


    function renderEarnings(){
        if(earnings==null){
            return null
        }else{
            return(
                <Block >
                    <Text style={{paddingTop:30}} h2>{Language.hi} {earnings.user}!</Text>
                    <Text muted style={{marginBottom:20}}>{Language.today_you_have_made} {earnings.today&&earnings.today.earning?earnings.today.earning.toFixed(2):""}{config.currencySign} {Language.by_doing} {earnings.today.orders} {Language.orders}</Text>
                     
                     <EarningBox earnings={earnings.today} title={Language.today} color={argonTheme.COLORS.PRIMARY} />
                     <EarningBox earnings={earnings.week} title={Language.this_week} color={argonTheme.COLORS.SUCCESS} />
                     <EarningBox earnings={earnings.month} title={Language.this_month} color={argonTheme.COLORS.WARNING} />
                     <EarningBox earnings={earnings.previous} title={Language.previous_month} color={argonTheme.COLORS.LABEL} />
                </Block>
           )
        }
    } 

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
               {renderEarnings()} 
                
            </Block>
        </ScrollView>
        <LoadingIndicator  visible={!earningsLoaded}/>
</Block>
)


}
export default Earnings;

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
