import { ScrollView, View, FlatList } from 'react-native';
import { Text } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import DoctorCard from '../../components/User/Doctors/DoctorCard';
import StylesDoctorCard from '../../components/User/Doctors/StylesDoctorCard';
import { Searchbar } from 'react-native-paper';
import Apis, { endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';

const Home = ({navigation}) => {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // chua try catch
    const loadDoctors = async () => {
        try {
            const res = await Apis.get(endpoints.doctors, { params: { page } });
            const results = res.data.results;
            if (!results || results.length === 0) {
                setDoctors([]);
                setDetailDoctor([]);
                setPage(1);
            } else {
                setDoctors(prev => [...prev, ...results]);
            }
        } catch (err) {
            console.error("Lỗi:", err);
        }
    }

    useEffect(() => {
        loadDoctors();
    }, [page]);


    return (
        <ScrollView   showsVerticalScrollIndicator={false}>
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
                    data={doctors}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    onEndReached={() => setPage(prev => prev + 1)}
                    onEndReachedThreshold={0.3}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={StylesDoctorCard.listContainer}
                    renderItem={({ item }) => {
                        return (<DoctorCard item={item} navigation={navigation}/>);
                    }}
                />
            </View>
        
        </ScrollView>
    );
};

export default Home;