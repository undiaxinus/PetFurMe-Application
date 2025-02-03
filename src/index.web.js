import { AppRegistry } from 'react-native';
import App from '../App';

AppRegistry.registerComponent('PetFurMe', () => App);
AppRegistry.runApplication('PetFurMe', {
  rootTag: document.getElementById('root')
}); 