import { createHomeStyles } from "@/assets/styles/home.styles";
import LoadingSpinner from "@/components/LoadingSpinner";
import useTheme from "@/hooks/useTheme";
import { api } from "@/services/api";
import { DailyTask } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DailyScreen() {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const [habits, setHabits] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Health");

  const loadHabits = useCallback(async () => {
    try {
      const data = await api.getDailyTasks();
      setHabits(data);
    } catch (error) {
      console.error("Error loading daily habits:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleToggle = async (habit: DailyTask) => {
    try {
      // Optimistic update
      const updated = habits.map((h) => {
        if (h.id === habit.id) {
          const willComplete = !h.is_completed_today;
          return {
            ...h,
            is_completed_today: willComplete,
            streak: willComplete ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      });
      setHabits(updated);

      await api.toggleDailyTask(habit.id);
    } catch (error) {
      Alert.alert("Error", "Failed to update daily habit");
      loadHabits();
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await api.createDailyTask({
        title: newTitle.trim(),
        category: newCategory,
      });
      setHabits([created, ...habits]);
      setNewTitle("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create habit");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Habit", "Are you sure you want to remove this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setHabits(habits.filter((h) => h.id !== id));
            await api.deleteDailyTask(id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete habit");
            loadHabits();
          }
        },
      },
    ]);
  };

  const completedTodayCount = habits.filter((h) => h.is_completed_today).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? (completedTodayCount / totalCount) * 100 : 0;

  const renderHabitItem = ({ item }: { item: DailyTask }) => {
    return (
      <View style={homeStyles.todoItemWrapper}>
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.todoItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={homeStyles.checkbox}
            activeOpacity={0.7}
            onPress={() => handleToggle(item)}
          >
            <LinearGradient
              colors={
                item.is_completed_today
                  ? colors.gradients.success
                  : colors.gradients.muted
              }
              style={[
                homeStyles.checkboxInner,
                {
                  borderColor: item.is_completed_today ? "transparent" : colors.border,
                },
              ]}
            >
              {item.is_completed_today && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Details */}
          <View style={homeStyles.todoTextContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  homeStyles.todoText,
                  { marginBottom: 6 },
                  item.is_completed_today && {
                    textDecorationLine: "line-through",
                    color: colors.textMuted,
                    opacity: 0.6,
                  },
                ]}
              >
                {item.title}
              </Text>

              {/* Streak Badge */}
              <View style={[styles.streakBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Ionicons name="flame" size={14} color="#F59E0B" />
                <Text style={styles.streakText}>{item.streak}d</Text>
              </View>
            </View>

            {/* Sub-badge: category & frequency */}
            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={[styles.frequencyText, { color: colors.textMuted }]}>
                Resets daily at midnight
              </Text>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={homeStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        {/* Header */}
        <View style={homeStyles.header}>
          <View style={homeStyles.titleContainer}>
            <LinearGradient colors={colors.gradients.warning} style={homeStyles.iconContainer}>
              <Ionicons name="flame" size={28} color="#fff" />
            </LinearGradient>
            <View style={homeStyles.titleTextContainer}>
              <Text style={homeStyles.title}>Daily Habits 🔥</Text>
              <Text style={homeStyles.subtitle}>
                {completedTodayCount} of {totalCount} completed today
              </Text>
            </View>
          </View>

          {totalCount > 0 && (
            <View style={homeStyles.progressContainer}>
              <View style={homeStyles.progressBarContainer}>
                <View style={homeStyles.progressBar}>
                  <LinearGradient
                    colors={colors.gradients.warning}
                    style={[homeStyles.progressFill, { width: `${progressPercent}%` }]}
                  />
                </View>
                <Text style={[homeStyles.progressText, { color: "#F59E0B" }]}>
                  {Math.round(progressPercent)}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Add Habit Button */}
        <View style={styles.addHabitSection}>
          <TouchableOpacity
            style={[styles.addHabitBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={22} color={colors.primary} />
            <Text style={[styles.addHabitText, { color: colors.text }]}>Add New Daily Habit</Text>
          </TouchableOpacity>
        </View>

        {/* Habit List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={habits}
            renderItem={renderHabitItem}
            keyExtractor={(item) => item.id.toString()}
            style={homeStyles.todoList}
            contentContainerStyle={homeStyles.todoListContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  setIsRefreshing(true);
                  loadHabits();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={homeStyles.emptyContainer}>
                <View style={[homeStyles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                </View>
                <Text style={homeStyles.emptyText}>No daily habits yet</Text>
                <Text style={homeStyles.emptySubtext}>
                  Build consistency by tracking habits like Reading, Workout, or Coding every day!
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Modal: Add Habit */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Daily Habit</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.textMuted }]}>Habit Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgrounds.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Read for 20 mins, Drink 2L water..."
                placeholderTextColor={colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.label, { color: colors.textMuted }]}>Category</Text>
              <View style={styles.categoryRow}>
                {["Health", "Productivity", "Mindfulness", "Learning", "Fitness"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: newCategory === cat ? colors.primary : colors.backgrounds.input,
                        borderColor: newCategory === cat ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: newCategory === cat ? "#fff" : colors.text,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={!newTitle.trim()}
                style={styles.createBtnContainer}
              >
                <LinearGradient
                  colors={newTitle.trim() ? colors.gradients.warning : colors.gradients.muted}
                  style={styles.createBtn}
                >
                  <Text style={styles.createBtnText}>Start Habit 🔥</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  addHabitSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  addHabitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  addHabitText: {
    fontSize: 15,
    fontWeight: "600",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  frequencyText: {
    fontSize: 11,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  createBtnContainer: {
    marginTop: 24,
  },
  createBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
