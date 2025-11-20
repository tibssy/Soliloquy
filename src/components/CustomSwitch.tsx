import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    style?: ViewStyle;
}

const CustomSwitch = ({ value, onValueChange, style }: CustomSwitchProps) => {
    const theme = useTheme();
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const trackColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.surfaceVariant, theme.colors.primary],
    });

    const thumbColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["#888", theme.colors.onPrimary],
    });

    const thumbTranslate = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 20],
    });

    const thumbScale = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 1, 1],
    });

    return (
        <Pressable onPress={() => onValueChange(!value)} style={style}>
            <Animated.View
                style={[styles.track, { backgroundColor: trackColor }]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: thumbColor,
                            transform: [
                                { translateX: thumbTranslate },
                                { scale: thumbScale },
                            ],
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 46,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
    },
    thumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        position: "absolute",
        left: 0,
    },
});

export default CustomSwitch;
