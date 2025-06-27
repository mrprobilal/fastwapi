import React from 'react';
import { StyleSheet, Dimensions, ScrollView,TouchableOpacity} from 'react-native';
import { Block, theme } from 'galio-framework';
import appConfig from './../app.json'


import { Card } from '../components';
const { width } = Dimensions.get('screen');

// header for screens
import Header from "../components/Header";
import { Language } from '../constants'
import API from './../services/api'

class Home extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    header: <Header options title={appConfig.expo.name} navigation={navigation}/>
  });

  constructor(props) {
    super(props);
    this.state = {
        cities:[],
        
    };
    this.getCities = this.getCities.bind(this);
   
  }

  componentDidMount(){
   this.getCities();
   this.openDetails=this.openDetails.bind(this);
  }

  
  getCities() {
     let _this=this
     API.getCities((cities)=>{
        _this.setState({
            cities:cities
        })
     })
  }

  openDetails(city){
    this.props.navigation.navigate('RestaurantsInCity', {cityId:city.id, cityName:city.name})
  }

  renderItems = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}>
        <Block flex>
          {
            this.state.cities.map((item)=>{
              return (
                <TouchableOpacity  key={item.id}  onPress={()=>{this.openDetails(item)}}>
                    <Card key={item.id} item={item} from={"cities"}   />
                </TouchableOpacity>)
            })
          }
          
        </Block>
      </ScrollView>
    )
  }

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderItems()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Home;
