import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface HeaderProps {
  completedCount?: number;
  totalCount?: number;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const Header: React.FC<HeaderProps> = ({
  completedCount = 0,
  totalCount = 0,
  title = "My Tasks ✨",
  subtitle,
  icon = "flash-outline",
}) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const sub = subtitle || `${completedCount} of ${totalCount} completed`;

  return (
    <View style={homeStyles.header}>
      <View style={homeStyles.titleContainer}>
        <LinearGradient colors={colors.gradients.primary} style={homeStyles.iconContainer}>
          <Ionicons name={icon} size={28} color="#fff" />
        </LinearGradient>

        <View style={homeStyles.titleTextContainer}>
          <Text style={homeStyles.title}>{title}</Text>
          <Text style={homeStyles.subtitle}>{sub}</Text>
        </View>
      </View>

      {totalCount > 0 && (
        <View style={homeStyles.progressContainer}>
          <View style={homeStyles.progressBarContainer}>
            <View style={homeStyles.progressBar}>
              <LinearGradient
                colors={colors.gradients.success}
                style={[homeStyles.progressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={homeStyles.progressText}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Header;
