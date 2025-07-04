import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
      <MaterialDesignIcons name="home" size={30} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 10,
  },
});

export default App;