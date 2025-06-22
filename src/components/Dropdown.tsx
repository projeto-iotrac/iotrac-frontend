import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

type DropdownItem = { label: string; value: string };
import { StyleProp, ViewStyle } from 'react-native';

type DropdownProps = {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  placeholder: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
};

const Dropdown: React.FC<DropdownProps> = ({ items, onSelect, placeholder, value, style }) => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [open]);

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, items.length * 40],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectedLabel = items.find(item => item.value === value)?.label;

  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}>
        <Text style={selectedLabel ? styles.buttonText : styles.placeholderText}>
          {selectedLabel || placeholder}
        </Text>        
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Ionicons name="chevron-down" size={20} color="#555" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(item.value);
                setOpen(false);
              }}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  buttonText: {
    color: '#000',
  },
  placeholderText: {
    color: '#c0c0c0',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default Dropdown;
