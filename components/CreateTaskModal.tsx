import useTheme from "@/hooks/useTheme";
import { Category, Priority } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    notes?: string;
    priority: Priority;
    category: Category;
    dueDate?: string | null;
    dueTime?: string | null;
    reminderEnabled: boolean;
  }) => Promise<void>;
}

const CATEGORIES: Category[] = ["Personal", "Work", "Health", "Study", "Finance", "Urgent"];
const PRIORITIES: { label: string; value: Priority; color: string }[] = [
  { label: "Low", value: "low", color: "#3B82F6" },
  { label: "Medium", value: "medium", color: "#F59E0B" },
  { label: "High", value: "high", color: "#EF4444" },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("Personal");
  const [dueDateType, setDueDateType] = useState<"none" | "today" | "tomorrow">("today");
  const [dueTime, setDueTime] = useState("09:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || isSubmitting) return;

    let computedDate: string | null = null;
    if (dueDateType === "today") {
      computedDate = new Date().toISOString().split("T")[0];
    } else if (dueDateType === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      computedDate = tomorrow.toISOString().split("T")[0];
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        category,
        dueDate: computedDate,
        dueTime: computedDate ? dueTime : null,
        reminderEnabled: computedDate ? reminderEnabled : false,
      });

      // Reset
      setTitle("");
      setNotes("");
      setPriority("medium");
      setCategory("Personal");
      setDueDateType("today");
      setDueTime("09:00");
      setReminderEnabled(true);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgrounds.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Notes */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Notes / Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                {
                  backgroundColor: colors.backgrounds.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Add extra details, checklist, or links..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Priority */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Priority</Text>
            <View style={styles.pillRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setPriority(p.value)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? p.color : colors.backgrounds.input,
                        borderColor: isSelected ? p.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="flag"
                      size={14}
                      color={isSelected ? "#fff" : p.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? "#fff" : colors.text },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Category</Text>
            <View style={styles.pillRow}>
              {CATEGORIES.map((c) => {
                const isSelected = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgrounds.input,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? "#fff" : colors.text },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Due Date */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Due Date</Text>
            <View style={styles.pillRow}>
              {[
                { label: "Today", value: "today" },
                { label: "Tomorrow", value: "tomorrow" },
                { label: "No Date", value: "none" },
              ].map((d) => {
                const isSelected = dueDateType === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    onPress={() => setDueDateType(d.value as any)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgrounds.input,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={isSelected ? "#fff" : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? "#fff" : colors.text },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reminder & Notification Toggle */}
            {dueDateType !== "none" && (
              <View style={[styles.reminderCard, { backgroundColor: colors.backgrounds.input }]}>
                <View style={styles.reminderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Ionicons name="notifications" size={20} color={colors.primary} />
                    <View>
                      <Text style={[styles.reminderTitle, { color: colors.text }]}>
                        Notification Reminder
                      </Text>
                      <Text style={[styles.reminderSubtitle, { color: colors.textMuted }]}>
                        Alert me at {dueTime}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {reminderEnabled && (
                  <View style={styles.timeButtonsRow}>
                    {["08:00", "09:00", "12:00", "18:00", "21:00"].map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setDueTime(t)}
                        style={[
                          styles.timeBtn,
                          {
                            backgroundColor: dueTime === t ? colors.primary : "transparent",
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeBtnText,
                            { color: dueTime === t ? "#fff" : colors.text },
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!title.trim() || isSubmitting}
            activeOpacity={0.8}
            style={styles.submitContainer}
          >
            <LinearGradient
              colors={
                title.trim() ? colors.gradients.primary : colors.gradients.muted
              }
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? "Creating..." : "Add Task"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  reminderCard: {
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  reminderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  timeButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  timeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitContainer: {
    marginTop: 16,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
