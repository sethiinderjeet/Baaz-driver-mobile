import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { RootStackParamList } from './navigation/types';
import DeliveryDetailScreen from './screens/JobDetailScreen';
import DeliveriesScreen from './screens/JobsScreen'; // renamed screen uses delivery wording
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function InnerNavigator() {
    const { user, loading } = useAuth();

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="Jobs" component={DeliveriesScreen} />
                    <Stack.Screen name="JobDetail" component={DeliveryDetailScreen} />
                </>
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}

export default function RootEntry() {
    return (
        <AuthProvider>
            <InnerNavigator />
        </AuthProvider>
    );
}
