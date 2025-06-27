import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import { Image } from "react-native";
import { StyleSheet, Text, View } from 'react-native';
import { AppLoading } from "expo";
import * as Font from 'expo-font';
import { Asset } from "expo-asset";
import Toast from 'react-native-toast-message'
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(); // Ignore log notification by message

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import { Block, GalioProvider } from "galio-framework";

import config from './config';


//App Screens
import Screens from './navigation/Screens';

import { Images, articles, argonTheme } from './constants';
import { SharedStateProvider } from './store/store';
import 'expo-asset';



// cache app images
const assetImages = [
  Images.noData,
  Images.RemoteLogo
];

// cache product images
articles.map(article => assetImages.push(article.image));

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function myiOSPromptCallback(permission){
  // do something with permission value
}


export default class App extends React.Component {

  state = {
    fontsLoaded: false,
    expoPushToken: "",
  };  
  
  async loadFonts() {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      'ArgonExtra': require('./assets/font/ArgonExtra.ttf')
    });
    this.setState({ fontsLoaded: true });
  }
  
  

  constructor(props) {
    super(props);
    
  }

  componentWillUnmount() {
  }

  async componentDidMount() {
    await this.loadFonts();
  }



  render() {
    if (this.state.fontsLoaded) {
      return (
        <>
        <NavigationContainer>
          <GalioProvider theme={argonTheme}>
            <SharedStateProvider>
              <Block flex>
                <Screens />
              </Block>
            </SharedStateProvider>
          </GalioProvider>
        </NavigationContainer>
        <Toast />
        </>
      );
    }else{
      return null;
    }
     
    
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

}