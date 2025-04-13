import { useState, useEffect, useRef, useCallback } from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Dimensions,Animated,Modal,Alert,AppState,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
                </View>
            </View>
          </LinearGradient>
        </ScrollView>
    )
}