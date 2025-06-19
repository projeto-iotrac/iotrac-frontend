import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DropdownItem = { label: string; value: string };
type DropdownProps = {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  placeholder: string;
  value?: string;
};

const Dropdown: React.FC<DropdownProps> = ({ items, onSelect, placeholder, value }) => {
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
    outputRange: [0, items.length * 40], // altura do dropdown
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectedLabel = items.find(item => item.value === value)?.label;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}>
        <Text style={styles.buttonText}>{selectedLabel || placeholder}</Text>
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
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  buttonText: {
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
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
