import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

import { Spacer, Text, TextInput } from "@/components";
import { Colors, textStyles } from "@/constants";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function AddDestinationScreen() {

  return (
    <KeyboardAwareScrollView style={{ paddingTop: 32, paddingHorizontal: 16 }} contentContainerStyle={{ flex: 1 }} bottomOffset={100}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Where&apos;s your next adventure? 🚀</Text>
        <Text style={styles.subtitle}>Please select a destination.</Text>
        <Spacer size={16} vertical />

        <View style={styles.form}>
          <TextInput
            label="Destination Name"
            placeholder="Enter the name of the destination"
            style={styles.destinationNameInput}
          />

          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.textHeading20,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.textBody12,
    textAlign: "center",
  },
  form: {
    width: "100%",
    justifyContent: 'space-between',
    height: "100%",
  },
  destinationNameInput: {
    ...textStyles.textBody12,
    borderWidth: 2,
    backgroundColor: Colors.light.borderDefault,
    borderColor: Colors.light.borderDefault,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },

  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  buttonText: {
    ...textStyles.textBody12,
    color: Colors.light.background,
    textAlign: "center",
  },
});