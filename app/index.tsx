import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const router = useRouter();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/auth');
        }, 2000);
        return () => {
            clearTimeout(timer);
        }
    }, []);
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.iconContainer,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
            }
            ]}>
                <FontAwesome5 name="hand-holding-medical" size={150} color="white" />
                <Text style={styles.appName}>Pill Pal</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f48fb1',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        color: 'white',
        fontSize: 38,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1,
    },
});