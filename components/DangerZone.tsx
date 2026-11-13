import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const DangerZone = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);

  const handleClearCompleted = async () => {
    Alert.alert(
      "Clear Completed Tasks",
      "This will remove all completed tasks from your list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Completed",
          style: "destructive",
          onPress: async () => {
            try {
              const count = await api.clearCompletedTodos();
              Alert.alert(
                "Cleared",
                `Successfully removed ${count} completed task${count === 1 ? "" : "s"}.`
              );
            } catch (error) {
              console.log("Error clearing completed todos", error);
              Alert.alert("Error", "Failed to clear completed tasks");
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitleDanger}>Task Cleanup</Text>

      <TouchableOpacity
        style={[settingsStyles.actionButton, { borderBottomWidth: 0 }]}
        onPress={handleClearCompleted}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient colors={colors.gradients.danger} style={settingsStyles.actionIcon}>
            <Ionicons name="trash" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Clear Completed Tasks</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default DangerZone;
