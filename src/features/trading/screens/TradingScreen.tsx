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
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { TradingRepository, Trade } from '../trading.repository';
import { formatCurrency } from '../../../utils/format';

export const TradingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['trading']);

  const [activeTab, setActiveTab] = useState<'overview' | 'trades'>('overview');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<any>({
    winRate: 62.5,
    totalPnl: 245.5,
    pnlCurve: [0, 25, 13, 54, 139, 204, 219, 209, 245.5],
  });

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState('1.0820');
  const [exitPrice, setExitPrice] = useState('1.0845');
  const [lotSize, setLotSize] = useState('1.0');
  const [pnl, setPnl] = useState('25.20');
  const [notes, setNotes] = useState('');

  // Detail Modal State (Requirement 4)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPair, setEditPair] = useState('');
  const [editDirection, setEditDirection] = useState<'buy' | 'sell'>('buy');
  const [editEntry, setEditEntry] = useState('');
  const [editExit, setEditExit] = useState('');
  const [editLot, setEditLot] = useState('');
  const [editPnl, setEditPnl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadData = useCallback(() => {
    const list = TradingRepository.getAllTrades();
    setTrades(list);
    const computedStats = TradingRepository.getStats();
    if (computedStats.totalTrades > 0) {
      setStats(computedStats);
    }

    if (selectedTrade) {
      const refreshed = list.find((t) => t.id === selectedTrade.id);
      setSelectedTrade(refreshed || null);
    }
  }, [selectedTrade?.id]);

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

    const created = TradingRepository.createTrade({
      pair: pair.trim(),
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: parseFloat(exitPrice) || 0,
      lotSize: parseFloat(lotSize) || 1,
      pnl: parseFloat(pnl) || 0,
      date: new Date().toISOString().split('T')[0],
      notes,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('trading', created.id, addCustomValues);
    }

    setNotes('');
    setAddCustomValues({});
    setIsAddOpen(false);
    loadData();
  };

  const handleOpenDetail = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleOpenEdit = (trade: Trade) => {
    setEditPair(trade.pair);
    setEditDirection(trade.direction);
    setEditEntry(String(trade.entry_price));
    setEditExit(String(trade.exit_price));
    setEditLot(String(trade.lot_size));
    setEditPnl(String(trade.pnl));
    setEditNotes(trade.notes || '');
    const existing = CustomizationRepository.getFieldValues('trading', trade.id);
    setEditCustomValues(existing);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTrade || !editPair.trim()) {
      Alert.alert('Required', 'Please enter asset pair.');
      return;
    }

    TradingRepository.updateTrade(selectedTrade.id, {
      pair: editPair.trim(),
      direction: editDirection,
      entryPrice: parseFloat(editEntry) || 0,
      exitPrice: parseFloat(editExit) || 0,
      lotSize: parseFloat(editLot) || 1,
      pnl: parseFloat(editPnl) || 0,
      notes: editNotes,
    });

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('trading', selectedTrade.id, editCustomValues);
    }

    setIsEditOpen(false);
    loadData();
  };

  const handleDeleteTrade = (trade: Trade) => {
    Alert.alert(
      'Delete Trade',
      `Are you sure you want to delete this ${trade.direction.toUpperCase()} trade on ${trade.pair}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            TradingRepository.deleteTrade(trade.id);
            setSelectedTrade(null);
            setIsEditOpen(false);
            loadData();
          },
        },
      ]
    );
  };

  const recentTrades = trades.slice(0, 4);
  const sortedTrades = sortItemsByLayout(trades, pageLayout);

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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ViewModeSwitcher pageKey="trading" />
            <TouchableOpacity
              onPress={() => setIsAddOpen(true)}
              style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add Trade"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs: Overview vs Trades */}
        <SegmentedTabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'trades', label: 'Trades' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={{ marginBottom: 16 }}
        />

        {activeTab === 'overview' ? (
          /* Overview Tab */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Stat Cards */}
            <View style={styles.statCardsRow}>
              <StatCard
                label="Win Rate"
                value={`${stats.winRate || 62.5}%`}
                subtext="+5% this week"
                trend="+5%"
                trendPositive={true}
                style={{ flex: 1 }}
              />
              <StatCard
                label="Total P&L"
                value={formatCurrency(stats.totalPnl || 245.5)}
                subtext="Net profit"
                trend={stats.totalPnl >= 0 ? '+profit' : '-loss'}
                trendPositive={stats.totalPnl >= 0}
                style={{ flex: 1 }}
              />
            </View>

            {/* Performance Equity Curve */}
            <Card variant="elevated" style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, typography.h3, { color: colors.textPrimary }]}>
                  Equity Curve
                </Text>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  Cumulative P&L
                </Text>
              </View>

              <LineChart
                data={stats.pnlCurve && stats.pnlCurve.length > 1 ? stats.pnlCurve : [0, 20, 50, 45, 90, 140, 245.5]}
                width={320}
                height={120}
                color={colors.primary}
              />
            </Card>

            {/* Recent Trades Preview */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
                Recent Trades
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('trades')}>
                <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
                  View all →
                </Text>
              </TouchableOpacity>
            </View>

            {recentTrades.length === 0 ? (
              <EmptyState
                icon="trending-up-outline"
                title="No trades logged"
                description="Record executions, lot sizes, and setup rules."
                actionTitle="+ Log Trade"
                onAction={() => setIsAddOpen(true)}
              />
            ) : (
              recentTrades.map((t) => {
                const isWin = t.pnl >= 0;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.75}
                    onPress={() => handleOpenDetail(t)}
                  >
                    <Card style={styles.compactTradeCard}>
                      <View style={styles.tradeRow}>
                        <View
                          style={[
                            styles.dirBadge,
                            {
                              backgroundColor:
                                t.direction === 'buy' ? colors.accentMint : colors.dangerSoft,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              typography.captionBold,
                              { color: t.direction === 'buy' ? colors.primary : colors.danger },
                            ]}
                          >
                            {t.direction.toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.tradeDetails}>
                          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                            {t.pair}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            {t.entry_price} → {t.exit_price}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text
                            style={[
                              styles.pnlText,
                              typography.h3,
                              { color: isWin ? colors.primary : colors.danger },
                            ]}
                          >
                            {formatCurrency(t.pnl)}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textMuted }]}>
                            {t.date}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          /* All Trades Tab */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {trades.length === 0 ? (
              <EmptyState
                icon="trending-up-outline"
                title="No trades yet"
                description="Start recording your trades to calculate win rate and profit factors."
                actionTitle="+ Log First Trade"
                onAction={() => setIsAddOpen(true)}
              />
            ) : (
              sortedTrades.map((trade) => {
                const isWin = trade.pnl >= 0;
                return (
                  <TouchableOpacity
                    key={trade.id}
                    activeOpacity={0.75}
                    onPress={() => handleOpenDetail(trade)}
                  >
                    <Card style={styles.compactTradeCard}>
                      <View style={styles.tradeRow}>
                        <View
                          style={[
                            styles.dirBadge,
                            {
                              backgroundColor:
                                trade.direction === 'buy'
                                  ? colors.accentMint
                                  : colors.dangerSoft,
                            },
                          ]}
                        >
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
                            <Text
                              style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}
                              numberOfLines={1}
                            >
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

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.textMuted}
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                      <CustomFieldsBadgeRow entityType="trading" entityId={trade.id} />
                    </Card>
                  </TouchableOpacity>
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
              Pair / Symbol *
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

            <View style={styles.rowInputs}>
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

            <View style={styles.rowInputs}>
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
                  Net P&L ($)
                </Text>
                <TextInput
                  value={pnl}
                  onChangeText={setPnl}
                  keyboardType="numeric"
                  placeholder="+25.50"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Notes / Strategy Rationale
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Breakout retest on 15m timeframe"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <CustomFieldsSection
              entityType="trading"
              values={addCustomValues}
              onChange={(key, val) => setAddCustomValues((prev) => ({ ...prev, [key]: val }))}
            />

            <Button
              title="Save Trade Execution"
              onPress={handleCreateTrade}
              style={{ marginTop: 12 }}
            />
          </View>
        </BottomSheetModal>

        {/* Trade Full Detail View Modal (Requirement 4) */}
        {selectedTrade && (
          <BottomSheetModal
            visible={!!selectedTrade && !isEditOpen}
            onClose={() => setSelectedTrade(null)}
            title="Trade Details"
          >
            <View style={styles.detailContainer}>
              <View style={styles.tradeDetailTopRow}>
                <View
                  style={[
                    styles.dirBadgeLarge,
                    {
                      backgroundColor:
                        selectedTrade.direction === 'buy' ? colors.accentMint : colors.dangerSoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.h3,
                      { color: selectedTrade.direction === 'buy' ? colors.primary : colors.danger },
                    ]}
                  >
                    {selectedTrade.direction.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800' }]}>
                    {selectedTrade.pair}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Executed on {selectedTrade.date}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      typography.h2,
                      {
                        color: selectedTrade.pnl >= 0 ? colors.primary : colors.danger,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {formatCurrency(selectedTrade.pnl)}
                  </Text>
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedTrade.pnl >= 0 ? colors.primary : colors.danger },
                    ]}
                  >
                    {selectedTrade.pnl >= 0 ? 'PROFIT' : 'LOSS'}
                  </Text>
                </View>
              </View>

              <View style={[styles.tradeMetricsGrid, { borderColor: colors.border }]}>
                <View style={styles.metricCell}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Entry Price</Text>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]}>
                    {selectedTrade.entry_price}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Exit Price</Text>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]}>
                    {selectedTrade.exit_price}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Lot Size</Text>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]}>
                    {selectedTrade.lot_size}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Result</Text>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: selectedTrade.pnl >= 0 ? colors.primary : colors.danger, marginTop: 2 },
                    ]}
                  >
                    {selectedTrade.pnl >= 0 ? 'Win' : 'Loss'}
                  </Text>
                </View>
              </View>

              {selectedTrade.notes && (
                <View style={styles.tradeNotesBox}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
                    STRATEGY NOTES
                  </Text>
                  <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 22 }]}>
                    {selectedTrade.notes}
                  </Text>
                </View>
              )}

              <CustomFieldsBadgeRow
                entityType="trading"
                entityId={selectedTrade.id}
                containerStyle={{ marginTop: 12 }}
              />

              <View style={styles.detailActionButtons}>
                <Button
                  title="Edit Trade"
                  variant="primary"
                  onPress={() => handleOpenEdit(selectedTrade)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Delete"
                  variant="ghost"
                  onPress={() => handleDeleteTrade(selectedTrade)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </BottomSheetModal>
        )}

        {/* Edit Trade Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Trade"
        >
          <View style={styles.modalForm}>
            <View style={styles.dirPicker}>
              <TouchableOpacity
                onPress={() => setEditDirection('buy')}
                style={[
                  styles.dirBtn,
                  {
                    backgroundColor: editDirection === 'buy' ? colors.primary : colors.inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: editDirection === 'buy' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  BUY / LONG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditDirection('sell')}
                style={[
                  styles.dirBtn,
                  {
                    backgroundColor: editDirection === 'sell' ? colors.danger : colors.inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: editDirection === 'sell' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  SELL / SHORT
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Pair / Symbol *
            </Text>
            <TextInput
              value={editPair}
              onChangeText={setEditPair}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Entry Price
                </Text>
                <TextInput
                  value={editEntry}
                  onChangeText={setEditEntry}
                  keyboardType="numeric"
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
                  value={editExit}
                  onChangeText={setEditExit}
                  keyboardType="numeric"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Lot Size
                </Text>
                <TextInput
                  value={editLot}
                  onChangeText={setEditLot}
                  keyboardType="numeric"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Net P&L ($)
                </Text>
                <TextInput
                  value={editPnl}
                  onChangeText={setEditPnl}
                  keyboardType="numeric"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Notes
            </Text>
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <CustomFieldsSection
              entityType="trading"
              values={editCustomValues}
              onChange={(key, val) => setEditCustomValues((prev) => ({ ...prev, [key]: val }))}
            />

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEdit}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 110,
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
  },
  compactTradeCard: {
    marginBottom: 10,
    padding: 14,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dirBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 12,
  },
  dirBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tradeDetails: {
    flex: 1,
  },
  pnlText: {
    fontWeight: '800',
  },
  modalForm: {
    paddingBottom: 24,
  },
  dirPicker: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  detailContainer: {
    paddingBottom: 20,
  },
  tradeDetailTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tradeMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 16,
  },
  metricCell: {
    width: '50%',
    paddingVertical: 8,
  },
  tradeNotesBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  detailActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
