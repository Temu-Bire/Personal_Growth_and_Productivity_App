import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';
import { calculateTradingStats, TradeRecord } from './stats.utils';

export interface Trade {
  id: string;
  pair: string;
  direction: 'buy' | 'sell';
  entry_price: number;
  exit_price: number;
  lot_size: number;
  pnl: number;
  date: string;
  notes: string | null;
  screenshot_uri: string | null;
  created_at: string;
  updated_at: string;
}

export class TradingRepository {
  static getAllTrades(): Trade[] {
    const db = getDatabase();
    return db.getAllSync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC');
  }

  static getRecentTrades(limit = 4): Trade[] {
    const db = getDatabase();
    return db.getAllSync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC LIMIT ?', [limit]);
  }

  static getStats() {
    const trades = this.getAllTrades();
    return calculateTradingStats(trades);
  }

  static createTrade(trade: {
    pair: string;
    direction: 'buy' | 'sell';
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
    pnl: number;
    date: string;
    notes?: string | null;
    screenshotUri?: string | null;
  }): Trade {
    const db = getDatabase();
    const id = generateId('trd');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO trades (id, pair, direction, entry_price, exit_price, lot_size, pnl, date, notes, screenshot_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        trade.pair.toUpperCase(),
        trade.direction,
        trade.entryPrice,
        trade.exitPrice,
        trade.lotSize,
        trade.pnl,
        trade.date,
        trade.notes || null,
        trade.screenshotUri || null,
        now,
        now,
      ]
    );

    return db.getFirstSync<Trade>('SELECT * FROM trades WHERE id = ?', [id])!;
  }

  static deleteTrade(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM trades WHERE id = ?', [id]);
  }
}
