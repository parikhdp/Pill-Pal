import { useState, useEffect, useRef, useCallback } from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Dimensions,Animated,Modal,Alert,AppState,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
const {width}=Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
interface CircularProgressProps
{
    progress:number;
    totalDoses:number;
    completedDoses:number;
}
function CircularProgress({
  progress, totalDoses, completedDoses
}: CircularProgressProps) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.55; // 55% of the screen width
  const strokeWidth = 15; // Width of the circular progress stroke
  const radius= (size - strokeWidth) / 2; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle

   useEffect(()=>{
      Animated.timing(animationValue, {
          toValue: progress,
          duration: 1000,
          useNativeDriver:true,
      }).start();
   },[progress]);

   const strokeDashoffset=animationValue.interpolate({
      inputRange:[0,1],
      outputRange: [circumference,0],
   });
   return(
    <View>
      <View>
        <Text>{Math.round(progress)}%</Text>
        <Text>{completedDoses} of {totalDoses} doses</Text>
      </View>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

       </Svg>
    </View>
  )
}
export default function HomeScreen(){
    return(
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#f5a9c4', '#f48fb1']}>
            <View>
                <View> //the circular progress bar
                  <View>
                    <Text> Daily Progress</Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} colour="white"/>
                    </TouchableOpacity>
                  </View>
                  //demo of what it looks like
                  <CircularProgress 
                  progress={50}
                  totalDoses={10}
                  completedDoses={5}
                   />
                </View>
            </View>
          </LinearGradient>
        </ScrollView>
    )
}