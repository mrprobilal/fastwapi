import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Dimensions,
    ScrollView,
    RefreshControl,
    FlatList,
    KeyboardAvoidingView,
    View,
    Image
  } from "react-native";
  import {Language } from "../constants";
  const { width, } = Dimensions.get("screen");
  import API from './../services/api'
  import { TouchableOpacity } from 'react-native-gesture-handler';
  import config from './../config'
  import {  LoadingIndicator } from 'react-native-expo-fancy-alerts';
  import { Checkbox } from 'galio-framework';
  import moment from "moment";
  import { Input, Block, Text, theme } from "galio-framework";
  import { Icon,MessageElement } from "../components/";
  import * as ImagePicker from 'expo-image-picker';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  function ChatDetails({navigation,route}){
  
    const { item } = route.params;
    messagesScroll = React.createRef();
    messagesInput = React.createRef();

    //Image picker
    const [image, setImage] = useState(null);
    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg', // or the appropriate image mime type
          name: 'upload.jpg'
        });

        //Add phone to formData
        formData.append('phone', item.phone);
        //Append token
        var token = await AsyncStorage.getItem('token');
        var link=config.domain+'/api/wpbox/sendmessage';
        formData.append('token', token);

        console.log('Sending image to:', link);
        console.log('Sending image:', formData);

        fetch(link, { // Replace with your actual API endpoint
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => {
          console.log(response); // Log the response object
          return response.text(); // Change this to text to see what's actually coming back
        })
        .then(text => {
          console.log('Received text:', text);
          return JSON.parse(text); // Now attempt to parse text to JSON
        })
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

        //setImage(result.assets[0].uri);
      }
    };

    const [refreshing, setRefreshing] = React.useState(false);
    //Chats loaded
    const [chatsLoaded,setChatsLoaded]=useState(true);

    useEffect(() => {
      const pusherKey = config.pusher_key;;
      const cluster = config.pusher_cluster;
      const channelName = 'chat.'+item.id;
      const eventName = 'general';

      console.log('Connecting to WebSocket...');

      setMessage("");
  
      const socketURL='wss://ws-'+cluster+'.pusher.com/app/'+pusherKey+'?protocol=7&client=js&version=4.4.0';
      console.log('Chat Details WebSocket URL:', socketURL);
      const socket = new WebSocket(socketURL);
  
     
      
      socket.onopen = () => {
        console.log('Chat Details  WebSocket connection opened.');
  
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
        //console.log('Chat Details WebSocket message received:', message);
  
        // Handle the event
        if (message.event === eventName) {
          const eventData = message.data;
          theMessage=JSON.parse(eventData).message;
          console.log('----> Chat Details  Message value:', theMessage.value+"<-------");
          console.log('----> Chat Details  Message:', theMessage);
          //console.log('Chat Details  Event data:', eventData);
          //console.log('Chat Details  Message data:', JSON.parse(eventData).message);

          //Add message to the list
          setMessages(prevMessages => [...prevMessages, theMessage]);
          handleScroll();
        }
      };
  
      socket.onerror = (error) => {
        console.error('----> Chat Details WebSocket error:', error);
      };
  
      socket.onclose = () => {
        console.log('----> Chat Details WebSocket connection closed.');
      };
  
      return () => {
        socket.close();
      };
    }, []); 
    
    useEffect(()=>{
      getMessages();
    },[])

    //State height
    const [height, setHeight] = useState(0);
    //State message
    const [message, setMessage] = useState("");

    //State messages
    const [messages, setMessages] = useState([]);
    var lastdate='';



    const itemLayout = (data, index) => ({
      length: messages.length - 1,
      offset: 32 * index,
      index
    });

    function sendMessage(messageToSend){
         setMessage("");
        
       
       
        API.sendMessage((response)=>{
          console.log("Message sent ok")
          console.log(response)
          //WebSocket will handle the message
        },(error)=>{
          console.log("Message not sent ok")
          alert(error)
        },{
          phone:item.phone,
          message:messageToSend
        })
      
    }

    function getMessages(){
      setRefreshing(true);
      API.getChatMessages((messagesResponse)=>{
        console.log("Messages loaded ok")
        console.log(messagesResponse)
        setMessages(messagesResponse.reverse());
        setRefreshing(false);

        //Scroll to he bottom
        setTimeout(() => {
          console.log("Scrolling to the bottom from setup")
          handleScroll();
        }, 1000);
        setTimeout(() => {
          console.log("Scrolling to the bottom from setup 2")
          handleScroll();
        }, 2000);

      },(error)=>{
        console.log("Messages not loaded ok")
        setRefreshing(false);
        alert(error)
      },{
        contact_id:item.id
      })
    }
  
    handleScroll = () => {
      // const totalIndex = this.state.messages.length - 1;
      // const insetBottom = this.state.messages.length * (theme.SIZES.BASE * 6.5) + 64; // total messages x message height
      setTimeout(() => {
        console.log('Scrolling to the bottom -->'+height );
        if(this.messagesScroll&&this.messagesScroll.current){
          this.messagesScroll.current.scrollToOffset({ offset: height });
        }
        
      }, 100);
    };
  
    onContentSizeChange = (width, height) => {
      console.log("onContentSizeChange");
      setHeight(height);
    };

    //showBigImage
    showBigImage = (image) => {
      console.log('Showing big image:', image);
    };

    renderMessage = msg => {
      var currentDate = moment(msg.created_at).format("LL");
      var showDate = false;
      if (currentDate + "" != lastdate) {
          lastdate = currentDate;
          showDate = true;
      }
      return (
        <TouchableOpacity id={msg.id}>
           <MessageElement currentDate={currentDate} msg={msg} showDate={showDate} />
          </TouchableOpacity>
      );
    }

   

    renderMessages = () => {
      const insetBottom =
      messages.length * (theme.SIZES.BASE * 6.5) + 64; // total messages x message height
      return (
        <FlatList
          ref={this.messagesScroll}
          data={messages}
          
          keyExtractor={item => `${item.id}`}
          showsVerticalScrollIndicator={false}
          getItemLayout={this.itemLayout}
          contentContainerStyle={[styles.messagesWrapper]}
          renderItem={({ item }) => this.renderMessage(item)}
          onContentSizeChange={this.onContentSizeChange}
        />
      );
    };


   
  
    handleMessage = () => {
      sendMessage(message);
    };
  
    messageForm = () => {
      
  
      return (
        <View style={styles.messageFormContainer}>
          <Block>
            <Input
              onRef={this.messagesInput}
              borderless
              color="#9fa5aa"
              multiline
              blurOnSubmit
              style={styles.input}
              placeholder="Message"
              autoCapitalize="none"
              returnKeyType="send"
              textContentType="none"
              placeholderTextColor="#9fa5aa"
              onSubmitEditing={this.handleMessage}
              onChangeText={setMessage}
              value={message}
              iconContent={
                <Icon
                onPress={pickImage}
                size={14}
                name="paperclip"
                family="font-awesome"
                color={theme.COLORS.ICON}
                style={{ marginRight: 12, marginTop: 5 }}
              />
              }
            />
          </Block>
        </View>
      );
    };

    return (
      <Block flex space="between" style={styles.container}>
          <KeyboardAvoidingView
            enabled
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={theme.SIZES.BASE * 5}
          >
            {this.renderMessages()}
            {this.messageForm()}
          </KeyboardAvoidingView>
        </Block>
        )
        
  }
  export default ChatDetails;

  const styles = StyleSheet.create({
    container: {},
    messageFormContainer: {
      height: 96,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32
    },
    input: {
      // width: width * 0.93,
      height: theme.SIZES.BASE * 3,
      backgroundColor: theme.COLORS.WHITE,
      shadowColor: theme.COLORS.BLACK,
      shadowOffset: { width: 0, height: 0.7 },
      shadowRadius: 3,
      shadowOpacity: 0.07,
      elevation: 2,
    },
    iconButton: {
      width: 40,
      height: 40,
      backgroundColor: "transparent"
    },
    messagesWrapper: {
      flexGrow: 1,
      top: 0,
      paddingLeft: 8,
      paddingRight: 8,
      paddingVertical: 16,
      paddingBottom: 56
    },
    messageCardWrapper: {
      maxWidth: "85%",
      marginLeft: 8,
      marginBottom: 32
    },
    messageCard: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      borderRadius: 6,
      backgroundColor: theme.COLORS.WHITE
    },
    messageCardPersonal: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      borderRadius: 6,
      marginRight: 8,
      backgroundColor: theme.COLORS.SUCCESS
    },
    shadow: {
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
      shadowOpacity: 1
    },
    time: {
     
      fontSize: 11,
      opacity: 0.5,
      marginTop: 8
    },
    avatar: {
      height: 40,
      width: 40,
      borderRadius: 20,
      marginBottom: theme.SIZES.BASE
    }
  });