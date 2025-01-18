import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../screens/CustomDrawerContent';

const Drawer = createDrawerNavigator();

function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="ChatScreen" component={ChatScreen} />
      {/* ... other screens ... */}
    </Drawer.Navigator>
  );
} 