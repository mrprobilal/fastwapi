import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Image
} from "react-native";
import { Block, Checkbox, Text, theme } from "galio-framework";
import config from '../config';
import { Button, Icon, Input } from "../components";
import { Images, argonTheme, Language } from "../constants";
import { AsyncStorage } from 'react-native';
import AppEventEmitter from '../functions/emitter';
const { width, height } = Dimensions.get("screen");
import API from "./../services/api"
import User from './../services/user';
import AuthContext from './../store/auth'
import { ThemeProvider } from "@react-navigation/native";

class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        email:"",
        password:"",
        phone:"",
        name:""
    };
   
  }

 
  render() {
    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block flex middle>
            <Block style={styles.registerContainer}>
              
              <Block flex>
                <Block flex={0.17} middle style={{marginTop:20}}>
                <Image source={{ uri:Images.RemoteLogo }} style={{width: (244),height: (config.LOGOHeight*(244/config.LOGOWidth))}}/>

                  <Text muted></Text>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >

                     {/** Name */}
                     <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                       value ={this.state.name}
                        borderless
                        onChangeText={text => this.setState({
                          name:text
                        })}
                        placeholder={"Name"}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="hat-3"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    {/**
                     * Phone
                     */}
                     <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                       value ={this.state.phone}
                        borderless
                        onChangeText={text => this.setState({
                          phone:text
                        })}
                        placeholder={"Phone"}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="g-check"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    
               
                    
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                       value ={this.state.email}
                        borderless
                        onChangeText={text => this.setState({
                          email:text
                        })}
                        placeholder={"Email"}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ic_mail_24px"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    
                        <Block width={width * 0.8}>
                      <Input
                       value ={this.state.password}
                        password
                        borderles
                        placeholder={"Password"}
                        onChangeText={text => this.setState({
                          password:text
                        })}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="padlock-unlocked"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                      
                    </Block>
                    <Block middle>
                      <AuthContext.Consumer>
                      {({  signUp }) => (
                          <Button color="primary" style={styles.createButton} onPress={()=> signUp({email:this.state.email,password:this.state.password,name:this.state.name,phone:this.state.phone})}>
                              <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                                {Language.register}
                              </Text>
                          </Button>
                      )}
                      </AuthContext.Consumer>
                      
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </Block>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.78,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
  },
  inputIcons: {
    marginRight: 12
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25
  }
});

export default Register;
