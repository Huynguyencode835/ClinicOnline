import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { List } from 'react-native-paper';

const ListDropDown = ({ title, value, icon, data, onSelect}) => {
    return (
        <View style={styles.wrapper}>
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.container}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                itemTextStyle={styles.itemText}
                activeColor="#f0fdf4"
                data={data}
                labelField="name"
                valueField="id"
                placeholder={title}
                value={value}
                onChange={(item) => onSelect(item)}
                renderLeftIcon={() => (
                    <List.Icon icon={icon} color="#64748b" style={{ margin: 0 , paddingRight: 20}} />
                )}
                renderRightIcon={() => (
                    <List.Icon icon="chevron-down" color="#94a3b8" style={{ margin: 0 }} />
                )}
                renderItem={(item) => (
                    <View style={styles.item}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                        {item.specialty && <Text style={styles.itemDesc}>{item.specialty}</Text>}
                        {item.price && <Text style={styles.itemPrice}>{item.price}</Text>}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    dropdown: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    container: {
        borderRadius: 12,
        borderColor: '#e2e8f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    placeholder: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#64748b',
    },
    selectedText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1976D2',
    },
    itemText: {
        fontSize: 14,
        color: '#1976D2',
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
    },
    itemDesc: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 12,
        color: '#0f766e',
        fontWeight: '600',
        marginTop: 2,
    },
});

export default ListDropDown;