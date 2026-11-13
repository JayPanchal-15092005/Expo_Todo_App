import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface TodoInputProps {
  onAddQuick: (text: string) => Promise<void>;
  onOpenAdvanced: () => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ onAddQuick, onOpenAdvanced }) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  const [newTodo, setNewTodo] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (newTodo.trim() && !isAdding) {
      try {
        setIsAdding(true);
        await onAddQuick(newTodo.trim());
        setNewTodo("");
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <View style={homeStyles.inputSection}>
      <View style={homeStyles.inputWrapper}>
        <TextInput
          style={homeStyles.input}
          placeholder="What needs to be done?"
          value={newTodo}
          onChangeText={setNewTodo}
          onSubmitEditing={handleAdd}
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
        />

        {/* Advanced / Details button */}
        <TouchableOpacity
          onPress={onOpenAdvanced}
          activeOpacity={0.8}
          style={{
            width: 50,
            height: 56,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.backgrounds.input,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="options-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* Quick Add Button */}
        <TouchableOpacity
          onPress={handleAdd}
          activeOpacity={0.8}
          disabled={!newTodo.trim() || isAdding}
        >
          <LinearGradient
            colors={newTodo.trim() ? colors.gradients.primary : colors.gradients.muted}
            style={[homeStyles.addButton, !newTodo.trim() && homeStyles.addButtonDisabled]}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TodoInput;
