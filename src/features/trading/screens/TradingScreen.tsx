import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LineChart } from '../../../components/charts/LineChart';
import { useTheme } from '../../../hooks/useTheme';
import { TradingRepository, Trade } from '../trading.repository';
import { formatCurrency } from '../../../utils/format';

export const TradingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'overview' | 'trades'>('overview');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<any>({
    winRate: 62.5,
    totalPnl: 245.5,
    pnlCurve: [0, 25, 13, 54, 139, 204, 219, 209, 245.5],
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState('1.0820');
  const [exitPrice, setExitPrice] = useState('1.0845');
  const [lotSize, setLotSize] = useState('1.0');
  const [pnl, setPnl] = useState('25.20');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(() => {
    const list = TradingRepository.getAllTrades();
    setTrades(list);
    const computedStats = TradingRepository.getStats();
    if (computedStats.totalTrades > 0) {
      setStats(computedStats);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCreateTrade = () => {
    if (!pair.trim()) {
      Alert.alert('Required', 'Please enter currency or asset pair.');
      return;
    }

    TradingRepository.createTrade({
      pair: pair.trim(),
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: parseFloat(exitPrice) || 0,
      lotSize: parseFloat(lotSize) || 1,
      pnl: parseFloat(pnl) || 0,
      date: new Date().toISOString().split('T')[0],
      notes,
    });

    setNotes('');
    setIsAddOpen(false);
    loadData();
  };

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.openDrawer()}
              style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Menu"
            >
              <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
              Trading Journal
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Trade"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs: Overview vs Trades */}
        <SegmentedTabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'trades', label: 'Trades' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'overview' ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {/* Stat Cards Row */}
            <View style={styles.statsRow}>
              <StatCard
                label="Win Rate"
                value={`${stats.winRate}%`}
                trend="+5%"
                trendPositive={true}
                icon="trophy-outline"
                iconColor={colors.primary}
              />
              <StatCard
                label="Total P&L"
                value={formatCurrency(stats.totalPnl)}
                trend="+12%"
                trendPositive={stats.totalPnl >= 0}
                icon="cash-outline"
                iconColor={stats.totalPnl >= 0 ? colors.primary : colors.danger}
              />
            </View>

            {/* Performance Curve Card */}
            <Card style={styles.chartCard}>
              <Text style={[styles.cardTitle, typography.h3, { color: colors.textPrimary }]}>
                Equity & P&L Curve
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 8 }]}>
                Cumulative returns over time
              </Text>
              <LineChart
                data={stats.pnlCurve && stats.pnlCurve.length > 1 ? stats.pnlCurve : [0, 25, 45, 90, 245.5]}
                height={120}
                color={colors.primary}
              />
            </Card>

            {/* Recent Trades */}
            <View style={styles.sectionHeader}>
              <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                Recent Trades
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('trades')}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  View All →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tradesList}>
              {trades.slice(0, 4).map((trade) => {
                const isWin = trade.pnl >= 0;
                return (
                  <Card key={trade.id} style={styles.tradeCard}>
                    <View style={styles.tradeRow}>
                      <View style={[styles.dirBadge, { backgroundColor: trade.direction === 'buy' ? colors.accentMint : colors.dangerSoft }]}>
                        <Text
                          style={[
                            typography.captionBold,
                            { color: trade.direction === 'buy' ? colors.primary : colors.danger },
                          ]}
                        >
                          {trade.direction.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.tradeDetails}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                          FX {trade.pair}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          Lot: {trade.lot_size} · {trade.date}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.pnlText,
                          typography.bodyBold,
                          { color: isWin ? colors.primary : colors.danger },
                        ]}
                      >
                        {formatCurrency(trade.pnl)}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          /* Full Trades List */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {trades.length === 0 ? (
              <EmptyState
                icon="trending-up-outline"
                title="No trades recorded"
                description="Log your trade setups, risk/reward, and execution performance."
                actionTitle="+ Add Trade"
                onAction={() => setIsAddOpen(true)}
              />
            ) : (
              trades.map((trade) => {
                const isWin = trade.pnl >= 0;
                return (
                  <Card key={trade.id} style={styles.tradeCard}>
                    <View style={styles.tradeRow}>
                      <View style={[styles.dirBadge, { backgroundColor: trade.direction === 'buy' ? colors.accentMint : colors.dangerSoft }]}>
                        <Text
                          style={[
                            typography.captionBold,
                            { color: trade.direction === 'buy' ? colors.primary : colors.danger },
                          ]}
                        >
                          {trade.direction.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.tradeDetails}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                          FX {trade.pair}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          Entry: {trade.entry_price} → Exit: {trade.exit_price}
                        </Text>
                        {trade.notes && (
                          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                            {trade.notes}
                          </Text>
                        )}
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.pnlText,
                            typography.h3,
                            { color: isWin ? colors.primary : colors.danger },
                          ]}
                        >
                          {formatCurrency(trade.pnl)}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          {trade.date}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Add Trade Sheet Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Log Trade"
        >
          <View style={styles.modalForm}>
            <View style={styles.dirPicker}>
              <TouchableOpacity
                onPress={() => setDirection('buy')}
                style={[
                  styles.dirBtn,
                  {
                    backgroundColor: direction === 'buy' ? colors.primary : colors.inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: direction === 'buy' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  BUY / LONG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDirection('sell')}
                style={[
                  styles.dirBtn,
                  {
                    backgroundColor: direction === 'sell' ? colors.danger : colors.inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: direction === 'sell' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  SELL / SHORT
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Pair / Symbol
            </Text>
            <TextInput
              value={pair}
              onChangeText={setPair}
              placeholder="EURUSD, XAUUSD, BTCUSD"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Entry Price
                </Text>
                <TextInput
                  value={entryPrice}
                  onChangeText={setEntryPrice}
                  keyboardType="numeric"
                  placeholder="1.0820"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Exit Price
                </Text>
                <TextInput
                  value={exitPrice}
                  onChangeText={setExitPrice}
                  keyboardType="numeric"
                  placeholder="1.0845"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Lot Size
                </Text>
                <TextInput
                  value={lotSize}
                  onChangeText={setLotSize}
                  keyboardType="numeric"
                  placeholder="1.0"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  P&L ($)
                </Text>
                <TextInput
                  value={pnl}
                  onChangeText={setPnl}
                  keyboardType="numeric"
                  placeholder="25.20"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Notes / Strategy
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Trend continuation pullback"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Save Trade"
              onPress={handleCreateTrade}
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
            />
          </View>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  chartCard: {
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: {
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tradesList: {
    gap: 10,
  },
  tradeCard: {
    padding: 14,
    marginBottom: 8,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dirBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradeDetails: {
    flex: 1,
    marginHorizontal: 10,
  },
  pnlText: {
    fontWeight: '700',
  },
  modalForm: {
    paddingTop: 8,
  },
  dirPicker: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  formLabel: {
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
});

