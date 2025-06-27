import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  Linking,
  View
} from "react-native";
import { Block, Text, theme} from "galio-framework";
import config from '../config';
import { Button,PillQty } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("screen");
import Toast from 'react-native-toast-message';
import { Checkbox } from 'galio-framework';

import Cart from './../services/cart';
import Tabs from './../components/Tabs';


const thumbMeasure = (width - 48 - 32) / 3;

// header for screens
import Header from "../components/Header";
import { Language } from '../constants'
import API from './../services/api'
import ArgonTheme from './../constants/Theme'

function SelectableTabs(props){
  const { tabs, tabIndex, changeFunction } = props;
  const defaultTab = tabs && tabs[0] && tabs[0].id;
  
  if (!tabs) return null;

  return (
    <Block style={{marginTop:5}} flex>
      <Text bold size={16} style={[styles.title,{marginTop:8,fontSize:14}]}>
          {props.title}
        </Text>

      <Tabs
      containerStyle= {{
        width: width-theme.SIZES.BASE*4,
        backgroundColor: theme.COLORS.WHITE,
        zIndex: 2,
      }}
      style={{backgroundColors:"#F8F9FE", backgroundColord:"red", width:300}}
      data={tabs || []}
      vertical={props.vertical}
      initialIndex={0}
      onChange={id => changeFunction(id)} />
    </Block>
    
  )
}

class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.route&&props.route.params.item ? props.route.params.item  : {},
      qty:1,
      variantFound:false,
      variant:null,
      variantPrice:0,
      extraPrice:0,
      searchVariant:{},
      showOrderActions:props.route.params.item.has_variants==0,
      extras:props.route.params.item.has_variants==0?props.route.params.item.extras:[],
      selectedExtras:[],
    };

    this.inc=this.inc.bind(this);
    this.dec=this.dec.bind(this);
    this.addToCart=this.addToCart.bind(this);
    this.setSearchVariant=this.setSearchVariant.bind(this);
    this.variantFound=this.variantFound.bind(this);
    this.getSinglePrice=this.getSinglePrice.bind(this);
    this.clickOnExtra=this.clickOnExtra.bind(this);
  }

  static navigationOptions = ({ navigation }) => ({
    header: (<Header  white back transparent   options title={navigation.state.params.item.name} navigation={navigation} />), 
    headerTransparent: true
  });

  componentDidMount(){
    
  }

  addToCart(){
    console.log("Item to add");
    console.log(this.state.item);
    var itemToAdd=this.state.item;
    itemToAdd.qty=this.state.qty;
    itemToAdd.variant=this.state.variantFound?this.state.variant:null;
    itemToAdd.extrasSelected=this.state.selectedExtras;
    itemToAdd.price=this.getSinglePrice();

    var _this=this;
    Cart.addCartContent(itemToAdd,(error=null)=>{
      console.log("Added in cart");
      Toast.show({
        type: 'success',
        text1: _this.state.qty==1?Language.itemAddedInCart:_this.state.qty+" "+Language.itemsAddedInCart
      });
     
      
      
    },(message)=>{
      //Error occured
      Toast.show({
        type: 'error',
        text2: message
      });
    });
    
  }

  inc(){
    this.setState({
      qty:this.state.qty+1
    })
  }

  dec(){
    this.setState({
      qty:this.state.qty-1
    })
  }

  renderOrderActions(){
    if(this.state.showOrderActions){
      return (<Block><Block transparent flex>
        <Text bold size={16} style={styles.title}>
          {Language.quatity.toUpperCase()}
        </Text>
        <Block flex row  middle style={styles.qtyManager}>
          <Block flex={3}>
            <Text>{this.state.qty} {this.state.qty>1?Language.items:Language.item}</Text>
          </Block>
          <Block flex={1} right>
             <PillQty allowDec={this.state.qty>1} inc={this.inc} dec={this.dec}></PillQty>
          </Block>
        </Block>
      </Block>

      <Block transparent flex style={styles.orderCard}>
          <Block flex>
            <Block middle>
              <Button style={{width:"100%"}} disabled={this.state.item.has_variants?!this.state.variantFound:false} style={{opacity:this.state.item.has_variants?(this.state.variantFound?1:0.5):1}} onPress={this.addToCart}>{Language.addToOrder.toUpperCase()+"         "+(this.state.qty*this.getSinglePrice())+"  "+config.currencySign}</Button>
            </Block>
          </Block>
      </Block></Block>)
    }else{
      return (<View></View>)
    }
  }

  optionFromApiToTabs(options){
    //options : "Small,Medium,Large,Family"
    var optionsArray=options.split(",");
    var result=[];

    optionsArray.forEach(element => {
      result.push({title:element,id:element.replace(/ /g, "-").toLowerCase()})
    });

    return result;
    
  }

  getSinglePrice(){
    var itemPrice=parseFloat(this.state.variantFound?this.state.variantPrice:this.state.item.price);
    console.log("Item price is "+itemPrice);
    //Add extra prices
    this.state.selectedExtras.forEach(extra => {
        itemPrice+=parseFloat(extra.price);
        console.log("Extr price is "+extra.price);
    });
    console.log("Item price now is "+itemPrice);
    return itemPrice.toFixed(2);
  }

  variantFound(variant){
    console.log("Start looking for extras");
    console.log(JSON.stringify(variant));

    //Make list of extras
    var extras=[];
    this.state.item.extras.map((extra)=>{
      if(extra.extra_for_all_variants==1){
        extra.uid=extra.id+"_"+variant.id;
        extras.push(extra);
      }
    })

    //Now insert variant extras
    variant.extras.map((extra)=>{
      extra.uid=extra.id+"_"+variant.id;
      extras.push(extra);
    })

    this.setState({
      variantFound:true,
      showOrderActions:true,
      variantPrice:variant.price,
      variant:variant,
      extras:extras,
      selectedExtras:[]
    })
    
  }

  setSearchVariant(id,value){
   var sv=this.state.searchVariant;
   sv[id]=value;
   console.log(Object.keys(sv).length)
   var fullOption=JSON.stringify(sv);
   console.log(fullOption);
   if(Object.keys(sv).length==this.state.item.options.length){
     //Do a seach
     console.log("Do a search");
     var found=false;
     this.state.item.variants.forEach(variant => {
       if(variant.options==fullOption){
         found=true;
         this.variantFound(variant)
       }
     });

     if(!found){
       console.log("ALERT: No Variant can be found");
       this.setState({
        variantFound:false,
        variantPrice:0
       })
     }

   }else{
     console.log("Wait for more selection");
   }
  }

  renderOptions(){
    if(this.state.item.has_variants){
      return (<Block flex>
        <Text bold size={16} style={styles.title}>
            {Language.options}
          </Text>
          {this.state.item.options.map((item)=>{
            return (<SelectableTabs title={item.name} tabs={this.optionFromApiToTabs(item.options)} changeFunction={(value)=>{this.setSearchVariant(item.id,value)}}/>)
          })}
        </Block>)
    }else{
      return (<Block></Block>)
    }
    
  }

  clickOnExtra(selected, id){
    
    console.log("clickOnExtra "+id+" "+(selected?"Select ":"Unselect"));
    //Check if extra is in the list of selected
    var alreadySelectedExtras=this.state.selectedExtras;

    if(selected){
      //Add
      this.state.extras.forEach(item => {
        if (item.id === id) {
          alreadySelectedExtras.push(item);
        }
      });

      

    }else{
      //Remove
      alreadySelectedExtras.forEach(function(item, index, object) {
        if (item.id === id) {
          object.splice(index, 1);
        }
      });

    }

    this.setState({
      selectedExtras:alreadySelectedExtras
    })
   
  }

  renderExtras(){
    if(this.state.extras.length){
      return (<Block><Text bold size={16} style={styles.title}>
        {Language.extras}
      </Text>
      {this.state.extras.map((item)=>{
      return (<Checkbox onChange={(e)=>{console.log("Change trigared "+item.id); console.log(e); this.clickOnExtra(e,item.id)}} key={ item.uid} color="primary"  checkboxStyle={{margin:10}} label={item.name+" +"+item.price+" "+config.currencySign} />)
      })}
    </Block>)
    }else{
      return (<Block></Block>)
    }
    
  }

  render() {
    return (
      <Block flex style={styles.profile}>
        <Block flex>
          <ImageBackground
            source={Images.ProfileBackground}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: '25%', marginBottom:'25%' }}
            >
              <Block flex style={styles.itemCard}>
                <Block middle style={styles.avatarContainer}>
                  <Image
                    source={{ uri: this.state.item.icon.indexOf('http')!=-1?this.state.item.icon:(config.domain+"/"+this.state.item.icon)     }}
                    style={styles.avatar}
                  />
                </Block>
                
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={28} color="#32325D">
                      {this.state.item.name}
                    </Text>
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                      {this.state.item.description}
                    </Text>
                  </Block>
                  <Block middle style={{ marginTop: 30, marginBottom: 16 }}>
                    <Block style={styles.divider} />
                  </Block>
                  <Block middle>
                    <Text
                      h4
                      bold
                      color={ArgonTheme.COLORS.LABEL}
                      style={{ textAlign: "center" }}
                    >
                      {this.getSinglePrice()} {config.currencySign}
                    </Text>

                  </Block>
                  </Block>
              </Block>

              <Block flex style={styles.orderActionContainer}>

              {this.renderOptions()}
              {this.renderExtras()}
              {this.renderOrderActions()}

              <Block middle style={{ marginTop: 20 }}>
                <Button
                  color="default"
                  style={{ width: '100%' }}
                  onPress={() => this.props.navigation.goBack()}
                >
                  Go back
                </Button>
              </Block>
              </Block>

              


              

              

            </ScrollView>
            
          </ImageBackground>

        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  orderActionContainer:{
    paddingHorizontal:20,
    backgroundColor: theme.COLORS.WHITE,
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
  },
  title: {
    paddingBottom: theme.SIZES.BASE,
    //paddingHorizontal: theme.SIZES.BASE,
    marginTop: 44,
    color: argonTheme.COLORS.HEADER
  },
  group: {
    paddingTop: theme.SIZES.BASE
  },
  qtyManager:{
    //paddingHorizontal: theme.SIZES.BASE,
  },
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  itemCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  orderCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
   // backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0
  },
  nameInfo: {
    marginTop: 35
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF"
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default Item;
