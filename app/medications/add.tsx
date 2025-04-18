import { useState } from "react";
import {View,Text,StyleSheet,TextInput,TouchableOpacity,ScrollView,Switch,Dimensions,Platform,KeyboardAvoidingView,Alert} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const FREQUENCIES = [
    {
      id: "1",
      label: "Once daily",
      icon: "sunny-outline" as const,
      times: ["09:00"],
    },
    {
      id: "2",
      label: "Twice daily",
      icon: "sync-outline" as const,
      times: ["09:00", "21:00"],
    },
    {
      id: "3",
      label: "Three times daily",
      icon: "time-outline" as const,
      times: ["09:00", "15:00", "21:00"],
    },
    {
      id: "4",
      label: "Four times daily",
      icon: "repeat-outline" as const,
      times: ["09:00", "13:00", "17:00", "21:00"],
    },
    { id: "5", label: "As needed", icon: "calendar-outline" as const, times: [] },
  ];

  const DURATIONS = [
    { id: "1", label: "7 days", value: 7 },
    { id: "2", label: "14 days", value: 14 },
    { id: "3", label: "30 days", value: 30 },
    { id: "4", label: "90 days", value: 90 },
    { id: "5", label: "Ongoing", value: -1 },
  ];
  
export default function AddMedicationScreen() {
    const router = useRouter();
    const [form, setForm] = useState({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      startDate: new Date(),
      times: ["09:00"],
      notes: "",
      reminderEnabled: true,
      refillReminder: false,
      currentSupply: "",
      refillAt: "",
    });
  
const [errors, setErrors] = useState<{[key:string]:string}>({});

const renderFrequencyOptions = () => {  
    return (
       <View>
          {FREQUENCIES.map((freq) =>(
            <TouchableOpacity
            key={freq.id}
            >
             <View>
                <Ionicons name={freq.icon} size={24}
                //different color for if that freq is selected
                />
                <Text>{freq.label}</Text>
             </View>
            </TouchableOpacity>
          ))}
       </View>
    )
}
const renderDurationOptions = () => {  
    return (
       <View>
          {DURATIONS.map((dur) =>(
            <TouchableOpacity
            key={dur.id}
            >
             <View>
                <Text>{dur.value>0?dur.value:'∞'}</Text>
                <Text>{dur.label}</Text>
             </View>
            </TouchableOpacity>
          ))}
       </View>
    )
}
    return(
        <View style={styles.container}>
             <LinearGradient colors={['#f5a9c4', '#f48fb1']} 
             start={{x:0,y:0}}
             end={{x:1, y:1}}
             style={styles.headerGradient}/>
             <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Medication</Text>
                </View>
                //Scroll view for Input from the user
                <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}
                contentContainerStyle={styles.formContentContainer}>//more semantic and reliable since it applies to the scrollable content to give the style here than view inside
                  <View style={styles.section}>
                    <View style={styles.inputContainer}>
                        <TextInput
                        style={[styles.mainInput, errors.name && styles.inputError]}
                        placeholder="Medication Name"
                        placeholderTextColor={'#999'}
                        value={form.name}
                      onChangeText={(text)=>{
                        setForm({...form,name:text})
                        if(errors.name){
                          setErrors({...errors,name:''})
                        }
                        }}/>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput 
                         style={[styles.mainInput, errors.name && styles.inputError]}
                        placeholder="Dosage (eg: 200mg)"
                        placeholderTextColor={'#999'}
                        value={form.dosage}
                      onChangeText={(text)=>{
                        setForm({...form,dosage:text})
                        if(errors.dosage){
                          setErrors({...errors,dosage:''})
                        }
                        }}/>
                        {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
                    </View>
                    </View>
                    <View style={styles.container}>
                      <Text style={styles.sectionTitle}>How often?</Text>
                      {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}
                      {renderFrequencyOptions()}
                      <Text style={styles.sectionTitle}>For how long?</Text>
                      {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
                      {renderDurationOptions()}

                      <TouchableOpacity>
                        <View>
                          <Ionicons name="calendar" size={20} color={'#f48fb1'} />
                        </View>
                        <Text>Starts</Text>
                      </TouchableOpacity>
                      <DateTimePicker
                        mode="date"
                        value={form.startDate}
                      />
                      <DateTimePicker
                        mode="time"
                        value={(()=>{
                          const [hours,minutes] = form.times[0].split(':').map(Number);
                          const date=new Date();
                          date.setHours(hours,minutes,0,0);
                          return date;
                        })()}
                      />
                    </View>
                  
                  <View>
                  </View>
                  {/* Reminder*/}
                  <View>
                    <View>
                      <View>
                        <View>
                          <View>
                            <Ionicons name="notifications" size={20} color={'#f48fb1'} />
                          </View>
                          <View>
                            <Text>Reminders</Text>
                            <Text>Enable reminders for this medication</Text>
                          </View>
                        </View>
                        <Switch
                        trackColor={{false:'#ddd', true:'#1a8e2d'}}
                        thumbColor={"white"}/>
                      </View>
                    </View>
                  </View>
                  {/*Refill tracker*/}
                  {/*notes*/}
                  <View>
                    <View>
                      <TextInput
                      placeholder="Add notes or special instructions..."
                      placeholderTextColor="#999"/>
                    </View>
                  </View>
                </ScrollView>
                <View>
                  <TouchableOpacity>
                  <LinearGradient
                     colors={["#1a8e2d", "#146922"]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                   >
                  <Text>Add Medication
                {/*isSubmitting ? "Adding..." : "Add Medication"*/}
                  </Text>
                  </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
             </View>
        </View>
    );
}

const styles=StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginLeft: 15,
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
    marginTop: 10,
  },
  mainInput: {
    fontSize: 20,
    color: "#333",
    padding: 15,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  optionCard: {
    width: (width - 60) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    backgroundColor: "#1a8e2d",
    borderColor: "#1a8e2d",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedOptionIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedOptionLabel: {
    color: "white",
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a8e2d",
    marginBottom: 5,
  },
  selectedDurationNumber: {
    color: "white",
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchSubLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 100,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  saveButtonGradient: {
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  refillInputs: {
    marginTop: 15,
  },
  timesContainer: {
    marginTop: 20,
  },
  timesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  }
})