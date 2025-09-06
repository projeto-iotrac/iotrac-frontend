import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { StyleProp, ViewStyle } from "react-native";
import theme from "../theme";

type DropdownItem = { label: string; value: string };

type DropdownProps = {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  placeholder: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
};

const ITEM_HEIGHT = 38;
const WINDOW = Dimensions.get("window");

const Dropdown: React.FC<DropdownProps> = ({
  items,
  onSelect,
  placeholder,
  value,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);
  const animation = useRef(new Animated.Value(0)).current;

  const selectedLabel = items.find((item) => item.value === value)?.label;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [open]);

  const openMenu = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setOpen(true);
      });
    }
  };

  const closeMenu = () => setOpen(false);

  const dropdownHeight = Math.min((items.length * ITEM_HEIGHT) + 6, WINDOW.height * 0.5);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dropdownHeight],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.button, style]}
        onPress={openMenu}
        activeOpacity={0.8}
      >
        <Text style={selectedLabel ? styles.buttonText : styles.placeholderText}>
          {selectedLabel || placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.dropdownContainer,
            {
              top: anchor.y + anchor.height,
              left: anchor.x,
              width: anchor.width,
            },
          ]}
        >
          <Animated.View style={[styles.dropdown, { height: animatedHeight }]}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item.value);
                    closeMenu();
                  }}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    borderRadius: 8,
    backgroundColor: theme.colors.neutralBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
  },
  buttonText: {
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dropdownContainer: {
    position: "absolute",
    zIndex: 9999,
    width: '100%'
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  dropdownItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});

export default Dropdown;
