import { ScrollView, View, FlatList } from 'react-native';
import { Text } from 'react-native';
import React from 'react';
import DoctorCard from '../../components/User/Doctors/DoctorCard';
import StylesDoctorCard from '../../components/User/Doctors/StylesDoctorCard';
import { Searchbar } from 'react-native-paper';
import Mystyles from '../../styles/Mystyles';

const MOCK_DOCTORS = [
  { id: 1, name: 'Ngô Trung Nam', degree: 'BS CKII', specialty: 'Sản phụ khoa', price: '200.000đ', avatar: null },
  { id: 2, name: 'Lê Tuấn', degree: 'BS', specialty: 'Nội khoa', price: '150.000đ', avatar: null },
  { id: 3, name: 'Trần Minh', degree: 'ThS', specialty: 'Tim mạch', price: '180.000đ', avatar: null },
  { id: 4, name: 'Nguyễn Hoa', degree: 'CKI', specialty: 'Nhi khoa', price: '160.000đ', avatar: null },
];


const handlePress = (doctor) => {
    navigation.navigate('DoctorDetail', { doctor });
  };

const Home = () => {

    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <ScrollView  style = {Mystyles.container} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 24, fontWeight: '600', marginVertical: 36 }}>Home Screen</Text>
            <Searchbar placeholder="Search" onChangeText={setSearchQuery} value={searchQuery}/>
            <View style={{ marginVertical: 30 }}>
                {/* Header */}
                <View style={StylesDoctorCard.header}>
                    <View>
                    <Text style={StylesDoctorCard.sectionTitle}>BÁC SĨ TƯ VẤN</Text>
                    <Text style={StylesDoctorCard.sectionSub}>khám bệnh qua video</Text>
                    </View>
                    <Text style={StylesDoctorCard.seeAll}>Xem tất cả »</Text>
                </View>
                <FlatList
                    data={MOCK_DOCTORS}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={StylesDoctorCard.listContainer}
                    renderItem={({ item }) => (<DoctorCard item={item} onPress={handlePress} />)}
                />
            </View>
        
        </ScrollView>
    );
};

export default Home;