import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IslamicCalendar from '../../components/islamic-calendar';

const CalendarScreen = ({ navigation }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  // Get event description based on event name
  const getEventDescription = (eventName) => {
    const eventDescriptions = {
      'Islamic New Year': 'Islamic New Year marks the beginning of the Islamic lunar calendar. It commemorates the Hijra, the migration of Prophet Muhammad ﷺ from Mecca to Medina.',
      'Day of Ashura': 'The Day of Ashura is the 10th day of Muharram. It commemorates the day when Allah saved Prophet Musa (Moses) and the Children of Israel from Pharaoh.',
      'Mawlid al-Nabi': 'Mawlid al-Nabi commemorates the birthday of Prophet Muhammad ﷺ. Muslims celebrate by reciting poetry, singing nasheeds, and gathering for communal meals.',
      'Start of Ramadan': 'Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, reflection, and community.',
      'Laylat al-Qadr': 'Laylat al-Qadr (The Night of Power) is one of the odd-numbered nights during the last ten days of Ramadan. It commemorates the night when the Quran was first revealed to Prophet Muhammad ﷺ.',
      'Eid al-Fitr': 'Eid al-Fitr marks the end of Ramadan, the Islamic holy month of fasting. It is celebrated with prayers, family gatherings, and charitable giving.',
      'Day of Arafah': 'The Day of Arafah falls on the 9th day of Dhu al-Hijjah. It is the day when pilgrims performing Hajj gather at the plain of Arafah. For non-pilgrims, it is recommended to fast on this day.',
      'Eid al-Adha': 'Eid al-Adha (Festival of Sacrifice) commemorates Prophet Ibrahim\'s willingness to sacrifice his son as an act of obedience to Allah. It is celebrated at the end of the Hajj pilgrimage.',
    };

    return eventDescriptions[eventName] || 'A significant day in the Islamic calendar.';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Islamic Calendar</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <IslamicCalendar onEventPress={handleEventPress} />
      </ScrollView>
      
      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEvent?.name || 'Event Details'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.eventDateContainer}>
                <Ionicons name="calendar-outline" size={20} color="#00ACC1" style={styles.eventIcon} />
                <Text style={styles.eventDate}>
                  {selectedEvent?.day} {getMonthName(selectedEvent?.month)} 
                  {selectedEvent?.year ? ` ${selectedEvent?.year} H` : ''}
                </Text>
              </View>
              
              <Text style={styles.eventDescription}>
                {getEventDescription(selectedEvent?.name)}
              </Text>
              
              {/* Depending on the event, you might want to add specific content */}
              {selectedEvent?.name === 'Ramadan' && (
                <View style={styles.additionalContent}>
                  <Text style={styles.additionalContentTitle}>Ramadan Activities</Text>
                  <View style={styles.activityItem}>
                    <Ionicons name="book-outline" size={18} color="#43A047" style={styles.activityIcon} />
                    <Text style={styles.activityText}>Quran Reading Plan</Text>
                  </View>
                  <View style={styles.activityItem}>
                    <Ionicons name="time-outline" size={18} color="#43A047" style={styles.activityIcon} />
                    <Text style={styles.activityText}>Iftar & Suhoor Times</Text>
                  </View>
                  <View style={styles.activityItem}>
                    <Ionicons name="heart-outline" size={18} color="#43A047" style={styles.activityIcon} />
                    <Text style={styles.activityText}>Charity Opportunities</Text>
                  </View>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  setModalVisible(false);
                  // Here you could navigate to a detailed screen for this event
                }}
              >
                <Text style={styles.primaryButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to get Hijri month name
const getMonthName = (monthNumber) => {
  if (!monthNumber) return '';
  
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  return months[monthNumber - 1] || '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '60%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#718096',
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
    marginBottom: 24,
  },
  additionalContent: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
  },
  additionalContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    marginRight: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  primaryButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CalendarScreen;