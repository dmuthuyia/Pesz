import React from 'react';
import { StyleSheet, View, Text, Pressable, StatusBar, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(progress.value ? 200 : 100),
      height: withSpring(progress.value ? 200 : 100),
      backgroundColor: progress.value ? 'dodgerblue' : 'tomato',
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Animated.View style={[styles.box, animatedStyle]} />
      <Pressable
        style={styles.button}
        onPress={() => {
          progress.value = progress.value ? 0 : 1;
        }}
      >
        <Text style={styles.buttonText}>Toggle</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  box: {
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'gray',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
