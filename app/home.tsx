import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, AppState, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { registerForPushNotificationsAsync, scheduleMedicationReminder } from "../utils/notifications";
import { DoseHistory, Medication, getMedications, getTodaysDoses, recordDose } from './../utils/storage';

const {width}=Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const quick_actions=[
{
  icon:'add-circle-outline' as const,
  label:'Add \nMedication',
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
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaysMedications,setTodaysMedications]=useState<Medication[]>([]);
  const [completedDoses, setCompletedDoses] = useState(0);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);

  const loadMedications= useCallback(async()=>{
    try{
      const [allMedications, todaysDoses] = await Promise.all([
        getMedications(),
        getTodaysDoses(),
      ]);

      setDoseHistory(todaysDoses);
      setMedications(allMedications);

      //filter medications to only include what should be taken today
      const today = new Date();
      const todayMeds = allMedications.filter((med) => {
      const startDate = new Date(med.startDate);
      const durationDays = parseInt(med.duration.split(" ")[0]);
      // For ongoing medications or if within duration
        if (
          durationDays === -1 ||
          (today >= startDate &&
            today <=new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000))
        ) {
          return true;
        }
        return false;
      });

      setTodaysMedications(todayMeds);

      // Calculate completed doses
      const completed = todaysDoses.filter((dose) => dose.taken).length;
      setCompletedDoses(completed);
    }catch(error){   
      console.error("Error loading medications:", error);
    }
  },[]); // for callback hook we need to provide a dependency array so we just make it empty
  //Fetching all the medication to show it in todays schedule
    
  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.log("Failed to get push notification token");
        return;
      }

      // Schedule reminders for all medications
      const medications = await getMedications();
      for (const medication of medications) {
        if (medication.reminderEnabled) {
          await scheduleMedicationReminder(medication);
        }
      }
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  // Use useEffect for initial load
  useEffect(() => {
    loadMedications();
    setupNotifications();

    // Handle app state changes for notifications. when app is reloaded to use ie to the foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        loadMedications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

   useFocusEffect(
    useCallback(() => {
      const unsubscribe = () => {
        // Cleanup if needed when screen is unfocused
      };

      loadMedications();
      return () => unsubscribe();
    }, [loadMedications])
  );
  
  const handleTakeDose = async (medication: Medication) => {
    try {
      await recordDose(medication.id, true, new Date().toISOString());
      await loadMedications(); // Reload data after recording dose
    } catch (error) {
      console.error("Error recording dose:", error);
      Alert.alert("Error", "Failed to record dose. Please try again.");
    }
  };

  const isDoseTaken = (medicationId: string) => {
    return doseHistory.some(
      (dose) => dose.medicationId === medicationId && dose.taken
    );
  };

  const progress =
    todaysMedications.length > 0
      ? completedDoses / (todaysMedications.length * 2)
      : 0;

    return(

        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <LinearGradient colors={['#f5a9c4', '#f48fb1']} style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={styles.flex1}>
                    <Text style={styles.greeting}> Daily Progress</Text>
                  </View> 
                    <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={() => setShowNotifications(true)}>
                        <Ionicons name="notifications-outline" size={24} color="white"/>
                       {
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>5</Text>
                        </View>
                       }
                    </TouchableOpacity>
                  </View>
                  <CircularProgress 
                  progress={progress}
                  totalDoses={todaysMedications.length * 2}
                  completedDoses={completedDoses}
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
          <View style={{paddingHorizontal:20}}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Todays's Schedule</Text>
                <Link href="/calender" asChild>
                <TouchableOpacity >
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
                </Link>
              </View>
              {todaysMedications.length===0 ?(
                <View style={styles.emptyState}>
                  <Ionicons name="medical-outline" size={48} color="#ccc"/>
                  <Text style={styles.emptyStateText}>No Medication Scheduled for Today</Text>
                  <Link href="/medications/add">
                    <TouchableOpacity style={styles.addMedicationButton}>
                      <Text style={styles.addMedicationButtonText}>Add Medication</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              ) : (
                todaysMedications.map((medication)=>{
                  const taken=isDoseTaken(medication.id);
                  return (
                   <View style={styles.doseCard}>
                    <View 
                    style={[
                      styles.doseBadge,
                      {
                        backgroundColor:'${medication.color}15'
                      }
                    ]}>
                      <Ionicons name="medical" size={24}/>
                    </View>
                    <View style={styles.doseInfo}>
                      <View>
                      <Text style={styles.medicineName}>{medication.name}</Text>
                      <Text style={styles.dosageInfo}>{medication.dosage}</Text>
                     </View> 
                     <View style={styles.doseTime}>
                      <Ionicons name="time-outline" size={16} color="#ccc"/>
                      <Text style={styles.timeText}>{medication.times[0]}</Text>
                     </View> 
                    </View> 
                     {taken?(
                      <View style={styles.takeDoseButton}>
                        <Ionicons name="checkmark-circle-outline" size={24}/>
                        <Text style={styles.takeDoseText}>Taken</Text>
                      </View>
                     ) : (
                       <TouchableOpacity style={[styles.takeDoseButton,{backgroundColor: medication.color}]} onPress={()=>handleTakeDose(medication)}>
                        <Text style={styles.takeDoseText}>Take</Text>  
                       </TouchableOpacity> 
                     )}
                    </View>
                  );
                })  
              )}
          </View>
          
          <Modal visible={false} transparent={true} animationType="slide"
          onRequestClose={() => setShowNotifications(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Notification</Text>
                <TouchableOpacity style={styles.closeButton}
                     onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close-circle-outline" size={24} color="#333"/>
                </TouchableOpacity>
              </View>
              {todaysMedications.map((medication)=>(
                   <View style={styles.notificationItem}>
                    <View style={styles.notificationIcon}>
                      <Ionicons name="medical" size={24}/>
                    </View>
                    <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{medication.name}</Text>
                    <Text style={styles.notificationMessage}>{medication.dosage}</Text>
                    <Text style={styles.notificationTime}>{medication.times[0]}</Text>
                    </View>
                   </View>
              ))}
            </View>
          </Modal>
        </ScrollView>
    );
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)", // dark shadow
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  seeAllButton: {
    color: '#f48fb1',
    fontWeight: "600",
  },
  doseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  doseBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  doseInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dosageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  doseTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  takeDoseButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginLeft: 10,
  },
  takeDoseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  addMedicationButton: {
    backgroundColor: '#f48fb1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMedicationButtonText: {
    color: "white",
    fontWeight: "600",
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  takenText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
})