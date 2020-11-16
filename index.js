import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './HomeScreen';

const Stack = createStackNavigator();

function BackgroundFetchNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="BackgroundFetchHome" component={Home} />
        </Stack.Navigator>
    );
}

export default BackgroundFetchNavigator;