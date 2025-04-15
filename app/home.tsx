import { useState, useEffect, useRef, useCallback } from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Dimensions,Animated,Modal,Alert,AppState,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
const {width}=Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const quick_actions=[
{
  icon:'add-circle-outline' as const,
  label:'Add \n Medication',
  route:'/medications/add' as const,
  color: "#2E7D32",
  gradient: ['#B8F2E6','#A0E7D7'] as [string, string],
},
{
  icon: "calendar-outline" as const,
  label: "Calendar\nView",
  route: "/calendar" as const,
  color: "#B2E0FF",
  gradient: ['#A5D8FF','#B2E0FF'] as [string, string],
},
{
  icon: "time-outline" as const,
  label: "History\nLog",
  route: "/history" as const,
  color: "#C5B2FF",
  gradient: ['#D6C7FF','#C5B2FF'] as [string, string],
},
{
  icon: "medical-outline" as const,
  label: "Refill\nTracker",
  route: "/refills" as const,
  color: "#FFCBA0",
  gradient: ['#FFD6A5','#FFCBA0'] as [string, string],
},
];
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
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        <Text style={styles.progressLabel}>{completedDoses} of {totalDoses} doses</Text>
      </View>
      <Svg width={size} height={size} style={styles.progressRing}>
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
  const {router} = useRouter();
    return(

        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <LinearGradient colors={['#f5a9c4', '#f48fb1']} style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={styles.flex1}>
                    <Text style={styles.greeting}> Daily Progress</Text>
                  </View> 
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white"/>
                       {
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>5</Text>
                        </View>
                       }
                    </TouchableOpacity>
                  </View>
                  <CircularProgress 
                  progress={50}
                  totalDoses={10}
                  completedDoses={5}
                   />
                </View>
          </LinearGradient>
          <View style={styles.content}>
            <View style={styles.quickActionsContainer}>
             <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quick_actions.map((actions)=>(
                <Link href={actions.route} key={actions.label} asChild>
                  <TouchableOpacity style={styles.actionButton}>
                    <LinearGradient colors={actions.gradient} style={styles.actionGradient}>
                      <View style={styles.actionContent}>
                        <View style={styles.actionIcon}>
                        <Ionicons name={actions.icon} size={24} color="#2F4F4F"/>
                        </View>
                        <Text style={styles.actionLabel}>{actions.label}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
          </View>
        </ScrollView>
    )
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginLeft: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: -4, //to push it to top right corner
    right: -4,
    backgroundColor: "#FF5252",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f48fb1",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, //so that all this writing content goes on top of the circle
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  progressDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  progressRing: {
    transform: [{ rotate: "-90deg" }],
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    width: (width - 52) / 2,
    height: 110,
    borderRadius: 16,
    overflow: "hidden", //rounded borders na so the content hsouldnt spill out
  },
  actionGradient: {
    flex: 1,
    padding: 15,
  },
  actionContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 5,
  },
})