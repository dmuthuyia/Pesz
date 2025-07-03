import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createStackNavigator()
const Tab   = createBottomTabNavigator()

function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Home Screen</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Details Screen</Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Settings Screen</Text>
    </View>
  )
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="HomeTab"     component={HomeStack}       options={{ title: 'Home' }} />
        <Tab.Screen name="SettingsTab" component={SettingsScreen}  options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text:   { fontSize: 18, marginBottom: 12 },
})
