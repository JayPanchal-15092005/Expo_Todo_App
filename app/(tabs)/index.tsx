import { createHomeStyles } from "@/assets/styles/home.styles";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import useTheme from "@/hooks/useTheme";
import { api } from "@/services/api";
import { cancelTaskReminder, scheduleTaskReminder } from "@/services/notifications";
import { Category, Priority, Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "pending" | "today" | "completed";

export default function Index() {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const loadTodos = useCallback(async () => {
    try {
      const data = await api.getTodos({
        filter: activeFilter,
        search: searchQuery.trim() || undefined,
      });
      setTodos(data);
    } catch (error) {
      console.error("Error loading todos:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTodos();
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      // Optimistic update
      const updatedTodos = todos.map((t) =>
        t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
      );
      setTodos(updatedTodos);

      await api.toggleTodo(todo.id);

      if (!todo.is_completed) {
        // Was marked completed -> cancel reminder
        await cancelTaskReminder(todo.id);
      } else if (todo.reminder_enabled && todo.due_date) {
        // Was marked uncompleted -> re-schedule reminder
        await scheduleTaskReminder(todo.id, todo.title, todo.due_date, todo.due_time || undefined);
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      Alert.alert("Error", "Could not toggle todo");
      loadTodos();
    }
  };

  const handleDeleteTodo = (todo: Todo) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setTodos(todos.filter((t) => t.id !== todo.id));
            await api.deleteTodo(todo.id);
            await cancelTaskReminder(todo.id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete task");
            loadTodos();
          }
        },
      },
    ]);
  };

  const handleAddQuick = async (text: string) => {
    try {
      const newTodo = await api.createTodo({
        title: text,
        priority: "medium",
        category: "Personal",
      });
      setTodos([newTodo, ...todos]);
    } catch (error) {
      Alert.alert("Error", "Failed to add task");
    }
  };

  const handleAddAdvanced = async (taskData: {
    title: string;
    notes?: string;
    priority: Priority;
    category: Category;
    dueDate?: string | null;
    dueTime?: string | null;
    reminderEnabled: boolean;
  }) => {
    try {
      const newTodo = await api.createTodo(taskData);
      setTodos([newTodo, ...todos]);

      if (newTodo.reminder_enabled && newTodo.due_date) {
        await scheduleTaskReminder(
          newTodo.id,
          newTodo.title,
          newTodo.due_date,
          newTodo.due_time || undefined
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      await api.updateTodo(id, { title: editText.trim() });
      setTodos(todos.map((t) => (t.id === id ? { ...t, title: editText.trim() } : t)));
      setEditingId(null);
      setEditText("");
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const completedCount = todos.filter((t) => t.is_completed).length;
  const totalCount = todos.length;

  const renderTodoItem = ({ item }: { item: Todo }) => {
    const isEditing = editingId === item.id;
    const isOverdue =
      item.due_date &&
      !item.is_completed &&
      item.due_date < new Date().toISOString().split("T")[0];

    const priorityColor =
      item.priority === "high"
        ? "#EF4444"
        : item.priority === "medium"
        ? "#F59E0B"
        : "#3B82F6";

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
            onPress={() => handleToggleTodo(item)}
          >
            <LinearGradient
              colors={
                item.is_completed
                  ? colors.gradients.success
                  : colors.gradients.muted
              }
              style={[
                homeStyles.checkboxInner,
                {
                  borderColor: item.is_completed ? "transparent" : colors.border,
                },
              ]}
            >
              {item.is_completed && <Ionicons name="checkmark" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          {isEditing ? (
            <View style={homeStyles.editContainer}>
              <TextInput
                style={homeStyles.editInput}
                value={editText}
                onChangeText={setEditText}
                autoFocus
                multiline
                placeholder="Edit your task..."
                placeholderTextColor={colors.textMuted}
              />
              <View style={homeStyles.editButtons}>
                <TouchableOpacity onPress={() => handleSaveEdit(item.id)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.success}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={homeStyles.editButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.muted}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={homeStyles.editButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={homeStyles.todoTextContainer}>
              {/* Title */}
              <Text
                style={[
                  homeStyles.todoText,
                  item.is_completed && {
                    textDecorationLine: "line-through",
                    color: colors.textMuted,
                    opacity: 0.6,
                  },
                ]}
              >
                {item.title}
              </Text>

              {/* Notes if available */}
              {item.notes ? (
                <Text
                  style={[
                    styles.notesText,
                    { color: colors.textMuted },
                    item.is_completed && { opacity: 0.5 },
                  ]}
                  numberOfLines={2}
                >
                  {item.notes}
                </Text>
              ) : null}

              {/* Metadata Badges (Category, Priority, Due Date, Reminder) */}
              <View style={styles.badgeRow}>
                {/* Priority Badge */}
                <View style={[styles.badge, { backgroundColor: `${priorityColor}20` }]}>
                  <Ionicons name="flag" size={11} color={priorityColor} />
                  <Text style={[styles.badgeText, { color: priorityColor }]}>
                    {item.priority.toUpperCase()}
                  </Text>
                </View>

                {/* Category Badge */}
                <View style={[styles.badge, { backgroundColor: `${colors.primary}18` }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {item.category}
                  </Text>
                </View>

                {/* Due Date Badge */}
                {item.due_date && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.15)" : "rgba(100, 116, 139, 0.15)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={11}
                      color={isOverdue ? "#EF4444" : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        { color: isOverdue ? "#EF4444" : colors.textMuted },
                      ]}
                    >
                      {item.due_date} {item.due_time ? `• ${item.due_time}` : ""}
                    </Text>
                  </View>
                )}

                {/* Reminder enabled icon */}
                {item.reminder_enabled && (
                  <View style={[styles.badge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                    <Ionicons name="notifications" size={11} color="#10B981" />
                  </View>
                )}
              </View>

              {/* Actions: Edit & Delete */}
              <View style={homeStyles.todoActions}>
                <TouchableOpacity
                  onPress={() => handleStartEdit(item)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.warning}
                    style={homeStyles.actionButton}
                  >
                    <Ionicons name="pencil" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteTodo(item)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.danger}
                    style={homeStyles.actionButton}
                  >
                    <Ionicons name="trash" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        {/* Header with live counts */}
        <Header
          completedCount={completedCount}
          totalCount={totalCount}
          title="My Tasks ⚡"
          subtitle={`${completedCount} of ${totalCount} completed`}
        />

        {/* Filter Chips (All, Pending, Due Today, Completed) */}
        <View style={styles.filterContainer}>
          {[
            { label: "Pending", value: "pending" },
            { label: "Due Today", value: "today" },
            { label: "Completed", value: "completed" },
            { label: "All", value: "all" },
          ].map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveFilter(tab.value as FilterType)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? "#ffffff" : colors.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Add Bar */}
        <TodoInput
          onAddQuick={handleAddQuick}
          onOpenAdvanced={() => setIsModalOpen(true)}
        />

        {/* Task List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={todos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id.toString()}
            style={homeStyles.todoList}
            contentContainerStyle={homeStyles.todoListContent}
            ListEmptyComponent={
              <EmptyState
                // Pass custom text if empty
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Advanced Task Creation Modal */}
        <CreateTaskModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAdvanced}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
