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
  import {Conversation} from '../components';


  function Chats({navigation}){

    const [refreshing, setRefreshing] = React.useState(false);
    const cardContainer = [styles.card, styles.shadow];
    const [conversations,setConversations]=useState([]);

    useEffect(()=>{
      refreshChats();
    },[])

    useEffect(() => {
      const pusherKey = config.pusher_key;;
      const cluster = config.pusher_cluster;
      const channelName = 'chatupdate.1';
      const eventName = 'general';

      console.log('Connecting to WebSocket...');
  
      const socketURL='wss://ws-'+cluster+'.pusher.com/app/'+pusherKey+'?protocol=7&client=js&version=4.4.0';
      console.log('WebSocket URL:', socketURL);
      const socket = new WebSocket(socketURL);
  
     
      
      socket.onopen = () => {
        console.log('Conversations WebSocket connection opened.');
  
        // Subscribe to a channel
        const subscribeMessage = JSON.stringify({
          event: 'pusher:subscribe',
          data: {
            channel: channelName
          }
        });
        socket.send(subscribeMessage);
      };
  
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Conversations  WebSocket message received:', message);
  
        // Handle the event
        if (message.event === eventName) {
          const eventData = message.data;
          //console.log('Conversations  Event data:', eventData);

          // Refresh the chats
          refreshChats();
        }
      };
  
      socket.onerror = (error) => {
        console.error('Conversations  WebSocket error:', error);
      };
  
      socket.onclose = () => {
        console.log('Conversations  WebSocket connection closed.');
      };
  
      return () => {
        console.log('Closing Conversations WebSocket connection...');
        refreshChats();
       // socket.close();
      };
    }, []); 

    const onRefresh = React.useCallback(() => {
      refreshChats();    
    }, []);

    function refreshChats(){
      setRefreshing(true);
      API.getConversations((conversationsResponse)=>{
        console.log("Conversations loaded ok")
        console.log(conversationsResponse)
        setConversations(conversationsResponse);
        setRefreshing(false);
      },(error)=>{
        console.log("Conversations not loaded ok")
        //setRefreshing(false);
        //alert(error)
      })
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
                                    {

                                      (conversations || []).map((item)=>{
                                      return (
                                        <TouchableOpacity
                                          key={item.id}
                                          onPress={() => navigation.navigate("ChatDetails", { item })}
                                        >
                                          <Conversation
                                            transparent
                                            system
                                            is_last_message_by_contact={item.is_last_message_by_contact}
                                            title={item.name}
                                            avatar={item.avatar}
                                            time={moment(item.last_reply_at).fromNow()}
                                            body={item.last_message}
                                            iconName="bell"
                                            iconFamily="font-awesome"
                                            color={"#B0EED3"}
                                            style={{ marginBottom: 10 }}
                                          />
                                        </TouchableOpacity>
                                      );
                                      })

                                   }
                                  
                                
                        
                    </Block>
                </ScrollView>
                <LoadingIndicator  visible={false}/>
        </Block>
        )
        
  }
  export default Chats;

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