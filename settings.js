import AsyncStorage from '@react-native-async-storage/async-storage';
/*
 * Gets the content of the Settings
 * @param callback
 */
async function getSettingsKey(callback,key,defaultValue) {
    try {
      const value =await AsyncStorage.getItem('settings');
      if (value !== null){
        // We have data!!
        var parsed=JSON.parse(value);
        if(parsed[key]){
            callback(parsed[key]);
        }else{
            callback(defaultValue);
        }
        
      }else{
        callback(defaultValue);
      }
    } catch (error) {
      // Error retrieving data
      callback(defaultValue);
    }
  }
  exports.getSettingsKey=getSettingsKey;