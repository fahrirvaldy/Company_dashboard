import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a professional font if needed, or use standard ones
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FDFBF7',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#FF8c42',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#FF8c42',
    marginTop: 5,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#334155',
    flex: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    width: 100,
    textAlign: 'right',
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  chart: {
    width: '100%',
    height: 200,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94A3B8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  }
});

const MeetingPDFReport = ({ data, chartImages }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Angkasa Executive Report</Text>
        <Text style={styles.subtitle}>Weekly Review: {data.date}</Text>
      </View>

      {/* KPI Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strategic Performance Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Good News (Business)</Text>
          <Text style={[styles.value, { width: 'auto', flex: 2, textAlign: 'left', marginLeft: 20 }]}>{data.goodNewsBusiness}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Good News (Personal)</Text>
          <Text style={[styles.value, { width: 'auto', flex: 2, textAlign: 'left', marginLeft: 20 }]}>{data.goodNewsPersonal}</Text>
        </View>
      </View>

      {/* Attendance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Ledger</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {data.attendance.map((att, i) => (
            <Text key={i} style={{ fontSize: 9, color: att.present ? '#10B981' : '#EF4444' }}>
              • {att.role} {att.present ? '(Present)' : '(Absent)'}
            </Text>
          ))}
        </View>
      </View>

      {/* IDT Issues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session IDT (Issues, Discussion, Tasks)</Text>
        {data.idtIssues.map((issue, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{issue}</Text>
          </View>
        ))}
      </View>

      {/* Charts if available */}
      {chartImages?.waterfall && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Impact Analysis Visualization</Text>
          <Image src={chartImages.waterfall} style={styles.chart} />
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Generated via Angkasa Business Intelligence Engine • {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);

export default MeetingPDFReport;
