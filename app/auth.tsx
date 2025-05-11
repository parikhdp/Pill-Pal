import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const {width}=Dimensions.get('window');
//actual width of the phone user is using

export default function AuthScreen() {  
    const router=useRouter();
    const [hasBiometric, setHasBiometric]=useState(false);
    const [isAuthenticating, setIsAuthenticating]=useState(false);
    const [error, setError]=useState<string | null>(null);

    useEffect(()=>{
       checkBiometrics();
    },[])

    const checkBiometrics =async()=>{
        const hasHardware=await LocalAuthentication.hasHardwareAsync();
        const isEnrolled=await LocalAuthentication.isEnrolledAsync();
        console.log('Is biometric enrolled:', isEnrolled);
        setHasBiometric(hasHardware && isEnrolled);
    }
    const authenticate=async()=>{
        try{
             setIsAuthenticating(true);
             setError(null);
             const hasHardware=await LocalAuthentication.hasHardwareAsync();
             const isEnrolled=await LocalAuthentication.isEnrolledAsync();

             const auth= await LocalAuthentication.authenticateAsync({
                promptMessage: hasHardware && isEnrolled? 'Use Face ID': 'Enter your pin to access',
                fallbackLabel: 'Use Pin',
                cancelLabel: 'Cancel',
                disableDeviceFallback:false
            });
            if(auth.success)
            {
               router.replace('/home')
            }
            else{
                setError('Authentication failed! Please try again');
            }
            } catch(error){

        }
    }
    return(
        <LinearGradient colors={['#f5a9c4', '#f48fb1']} style={styles.container}>

       <View style={styles.content}>
            <View style={styles.iconContainer}>
                <FontAwesome5 name="hand-holding-medical" size={80} color="white" />
            </View>
            <Text style={styles.title}>
                Pill Pal
            </Text>
            <Text style={styles.subtitle}>
            Your pocket-sized pill buddy
            </Text>
            <View style={styles.card}>
                <Text style={styles.welcomeText}>
                    Welcome back to Pill Pal!
                </Text>
                <Text style={styles.instructionText}>
                    {hasBiometric ? 'Use Face ID or PIN to access your medications ' : 'Enter your PIN to access your medications'}
                </Text>
                <TouchableOpacity style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                onPress={authenticate}
                disabled={isAuthenticating}
                >
                    {hasBiometric ? (
                    <MaterialCommunityIcons
                      name="face-recognition"
                      size={24}
                      color="white"
                      style={styles.buttonIcon}/>) 
                      : (
                         <Ionicons
                         name="keypad-outline"
                        size={24}
                        color="white"
                        style={styles.buttonIcon}/> 
                    )}  
                        <Text style={styles.buttonText}>
                            {isAuthenticating ? 'Verifying..' : hasBiometric ? 'Authenticate' : 'Enter PIN'}
                        </Text>
                </TouchableOpacity>  
                {error && <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={20} color="#f44336" />
                    <Text style={styles.errorText}>{error}</Text>
                    </View>} 
            </View>
        </View>
    </LinearGradient>
    );
}

const styles=StyleSheet.create({
    container:{
        flex:1,
    },
    content:{
        flex:1,
        padding:20,
        justifyContent:'center',
        alignItems:'center'
    },
    iconContainer:{
       width:120,
       height:120,
       backgroundColor:'rgba(255, 255, 255, 0.12)',
       borderRadius:60,
       justifyContent:'center',
       alignItems:'center',
       marginBottom:20
    },
    title:{
        fontSize:24,
        fontWeight:'bold',
        color:'white',
        marginBottom:10,
        textShadowColor:'rgba(0,0,0, 0.2)',
        textShadowOffset:{width:1,height:1},
        textShadowRadius:3,
    },
    subtitle:{
        fontSize:18,
        color:'rgba(255,255,255, 0.95)',
        marginBottom:40,
        textAlign:'center',
    },
    card:{
       backgroundColor:'white' ,
       borderRadius:20,
       padding:30,
       width:width-40,
       alignItems:'center',
       shadowColor:'black',
       shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
      },
      instructionText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
      },
      button: {
        backgroundColor: "#f48fb1",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      buttonDisabled: {
        opacity: 0.7,
      },
      buttonIcon: {
        marginRight: 10,
      },
      buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
      },
      errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        padding: 10,
        backgroundColor: "#ffebee",
        borderRadius: 8,
      },
      errorText: {
        color: "#f44336",
        marginLeft: 8,
        fontSize: 14,
      },
});