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
        <View>
             <LinearGradient colors={['#f5a9c4', '#f48fb1']} 
             start={{x:0,y:0}}
             end={{x:1, y:1}}/>
             <View>
                <View>
                    <TouchableOpacity>
                        <Ionicons name="chevron-back" size={28} color="black" />
                    </TouchableOpacity>
                    <Text>New Medication</Text>
                </View>
                //Scroll view for Input from the user
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View>
                    <View>
                        <TextInput
                        placeholder="Medication Name"
                        placeholderTextColor={'#999'}/>
                    </View>
                    <View>
                        <TextInput
                        placeholder="Dosage (eg: 200mg)"
                        placeholderTextColor={'#999'}/>
                    </View>
                    <View>
                      <Text>How often?</Text>
                      {renderFrequencyOptions()}
                      <Text>For how long?</Text>
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
                </ScrollView>
             </View>
        </View>
    )
}