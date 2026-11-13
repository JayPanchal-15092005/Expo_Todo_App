import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { api } from "@/services/api";
import { StatsData } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

const ProgressStats = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);

  const [stats, setStats] = useState<StatsData>({
    totalTodos: 0,
    pendingTodos: 0,
    completedTodos: 0,
    completedToday: 0,
    highPriority: 0,
    dueToday: 0,
    todoCompletionRate: 0,
    totalHabits: 0,
    completedHabits: 0,
    maxStreak: 0,
    habitCompletionRate: 0,
  });

  useEffect(() => {
    api
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.log("Failed to fetch stats:", err));
  }, []);

  return (
    <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Overview & Stats 📊</Text>

      <View style={settingsStyles.statsContainer}>
        {/* TOTAL TODOS */}
        <LinearGradient
          colors={colors.gradients.background}
          style={[settingsStyles.statCard, { borderLeftColor: colors.primary }]}
        >
          <View style={settingsStyles.statIconContainer}>
            <LinearGradient colors={colors.gradients.primary} style={settingsStyles.statIcon}>
              <Ionicons name="list" size={20} color="#fff" />
            </LinearGradient>
          </View>

          <View>
            <Text style={settingsStyles.statNumber}>{stats.totalTodos}</Text>
            <Text style={settingsStyles.statLabel}>Total Tasks</Text>
          </View>
        </LinearGradient>

        {/* PENDING TODOS */}
        <LinearGradient
          colors={colors.gradients.background}
          style={[settingsStyles.statCard, { borderLeftColor: colors.warning }]}
        >
          <View style={settingsStyles.statIconContainer}>
            <LinearGradient colors={colors.gradients.warning} style={settingsStyles.statIcon}>
              <Ionicons name="time" size={20} color="#fff" />
            </LinearGradient>
          </View>

          <View>
            <Text style={settingsStyles.statNumber}>{stats.pendingTodos}</Text>
            <Text style={settingsStyles.statLabel}>Pending Tasks</Text>
          </View>
        </LinearGradient>

        {/* COMPLETED TODAY */}
        <LinearGradient
          colors={colors.gradients.background}
          style={[settingsStyles.statCard, { borderLeftColor: colors.success }]}
        >
          <View style={settingsStyles.statIconContainer}>
            <LinearGradient colors={colors.gradients.success} style={settingsStyles.statIcon}>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
            </LinearGradient>
          </View>

          <View>
            <Text style={settingsStyles.statNumber}>{stats.completedToday}</Text>
            <Text style={settingsStyles.statLabel}>Done Today</Text>
          </View>
        </LinearGradient>

        {/* HABIT STREAK */}
        <LinearGradient
          colors={colors.gradients.background}
          style={[settingsStyles.statCard, { borderLeftColor: "#F59E0B" }]}
        >
          <View style={settingsStyles.statIconContainer}>
            <LinearGradient colors={["#F59E0B", "#D97706"]} style={settingsStyles.statIcon}>
              <Ionicons name="flame" size={20} color="#fff" />
            </LinearGradient>
          </View>

          <View>
            <Text style={settingsStyles.statNumber}>{stats.maxStreak}d</Text>
            <Text style={settingsStyles.statLabel}>Best Streak</Text>
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
};

export default ProgressStats;
