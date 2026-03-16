import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import LoginScreen from './src/screens/LoginScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import DriverDashboard from './src/screens/DriverDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileSettings from './src/screens/ProfileSettings';
import ManageBuses from './src/screens/ManageBuses';
import ManageStudents from './src/screens/ManageStudents';
import ActiveRoutesMap from './src/screens/ActiveRoutesMap';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SideDrawer from './src/components/SideDrawer';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  const MenuButton = ({ navigation }: any) => (
    <TouchableOpacity
      onPress={() => setDrawerVisible(true)}
      style={{ marginLeft: 15 }}
    >
      <Text style={{ color: '#1e3a8a', fontSize: 24 }}>☰</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {user.user_metadata?.role === 'admin' ? (
              <>
                <Stack.Screen 
                  name="AdminDashboard" 
                  component={AdminDashboard}
                  options={({ navigation }) => ({
                    title: 'Admin Dashboard',
                    headerLeft: () => <MenuButton navigation={navigation} />,
                  })}
                />
                <Stack.Screen 
                  name="ManageBuses" 
                  component={ManageBuses}
                  options={{ title: 'Manage Buses' }}
                />
                <Stack.Screen 
                  name="ManageStudents" 
                  component={ManageStudents}
                  options={{ title: 'Manage Students' }}
                />
                <Stack.Screen 
                  name="ActiveRoutesMap" 
                  component={ActiveRoutesMap}
                  options={{ title: 'Active Routes', headerShown: false }}
                />
                <Stack.Screen 
                  name="ProfileSettings" 
                  component={ProfileSettings}
                  options={{ title: 'Profile' }}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ title: 'Settings' }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ title: 'Notifications' }}
                />
              </>
            ) : user.user_metadata?.role === 'driver' ? (
              <>
                <Stack.Screen 
                  name="DriverDashboard" 
                  component={DriverDashboard}
                  options={({ navigation }) => ({
                    title: 'Driver Dashboard',
                    headerLeft: () => <MenuButton navigation={navigation} />,
                  })}
                />
                <Stack.Screen 
                  name="ProfileSettings" 
                  component={ProfileSettings}
                  options={{ title: 'Profile' }}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ title: 'Settings' }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ title: 'Notifications' }}
                />
              </>
            ) : (
              <>
                <Stack.Screen 
                  name="StudentDashboard" 
                  component={StudentDashboard}
                  options={({ navigation }) => ({
                    title: 'Student Dashboard',
                    headerLeft: () => <MenuButton navigation={navigation} />,
                  })}
                />
                <Stack.Screen 
                  name="ProfileSettings" 
                  component={ProfileSettings}
                  options={{ title: 'Profile' }}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ title: 'Settings' }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ title: 'Notifications' }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
      
      {user && (
        <SideDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <NotificationProvider>
          <LocationProvider>
            <NavigationContainer>
              <Navigation />
            </NavigationContainer>
          </LocationProvider>
        </NotificationProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
