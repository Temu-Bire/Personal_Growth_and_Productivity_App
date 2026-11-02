import { getDatabase, getDatabaseAsync } from '../../db/client';
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
  // Sync
  static getAllTrades(): Trade[] {
    const db = getDatabase();
    return db.getAllSync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC;');
  }

  // Async
  static async getAllTradesAsync(): Promise<Trade[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC;');
  }

  // Sync
  static getRecentTrades(limit = 4): Trade[] {
    const db = getDatabase();
    return db.getAllSync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC LIMIT ?;', [limit]);
  }

  // Async
  static async getRecentTradesAsync(limit = 4): Promise<Trade[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<Trade>('SELECT * FROM trades ORDER BY date DESC, created_at DESC LIMIT ?;', [limit]);
  }

  // Sync
  static getStats() {
    const trades = this.getAllTrades();
    return calculateTradingStats(trades);
  }

  // Async
  static async getStatsAsync() {
    const trades = await this.getAllTradesAsync();
    return calculateTradingStats(trades);
  }

  // Sync
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

    return db.getFirstSync<Trade>('SELECT * FROM trades WHERE id = ?;', [id])!;
  }

  // Async
  static async createTradeAsync(trade: {
    pair: string;
    direction: 'buy' | 'sell';
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
    pnl: number;
    date: string;
    notes?: string | null;
    screenshotUri?: string | null;
  }): Promise<Trade> {
    const db = await getDatabaseAsync();
    const id = generateId('trd');
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO trades (id, pair, direction, entry_price, exit_price, lot_size, pnl, date, notes, screenshot_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

    const created = await db.getFirstAsync<Trade>('SELECT * FROM trades WHERE id = ?;', [id]);
    return created!;
  }

  // Sync
  static deleteTrade(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM trades WHERE id = ?;', [id]);
  }

  // Async
  static async deleteTradeAsync(id: string): Promise<void> {
    const db = await getDatabaseAsync();
    await db.runAsync('DELETE FROM trades WHERE id = ?;', [id]);
  }

  // Update
  static updateTrade(
    id: string,
    trade: {
      pair?: string;
      direction?: 'buy' | 'sell';
      entryPrice?: number;
      exitPrice?: number;
      lotSize?: number;
      pnl?: number;
      date?: string;
      notes?: string | null;
      screenshotUri?: string | null;
    }
  ): Trade | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Trade>('SELECT * FROM trades WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const pair = trade.pair !== undefined ? trade.pair.toUpperCase() : existing.pair;
    const direction = trade.direction !== undefined ? trade.direction : existing.direction;
    const entryPrice = trade.entryPrice !== undefined ? trade.entryPrice : existing.entry_price;
    const exitPrice = trade.exitPrice !== undefined ? trade.exitPrice : existing.exit_price;
    const lotSize = trade.lotSize !== undefined ? trade.lotSize : existing.lot_size;
    const pnl = trade.pnl !== undefined ? trade.pnl : existing.pnl;
    const date = trade.date !== undefined ? trade.date : existing.date;
    const notes = trade.notes !== undefined ? trade.notes : existing.notes;
    const screenshotUri = trade.screenshotUri !== undefined ? trade.screenshotUri : existing.screenshot_uri;

    db.runSync(
      `UPDATE trades
       SET pair = ?, direction = ?, entry_price = ?, exit_price = ?, lot_size = ?, pnl = ?, date = ?, notes = ?, screenshot_uri = ?, updated_at = ?
       WHERE id = ?;`,
      [pair, direction, entryPrice, exitPrice, lotSize, pnl, date, notes, screenshotUri, now, id]
    );

    return db.getFirstSync<Trade>('SELECT * FROM trades WHERE id = ?;', [id]);
  }

  static async updateTradeAsync(
    id: string,
    trade: {
      pair?: string;
      direction?: 'buy' | 'sell';
      entryPrice?: number;
      exitPrice?: number;
      lotSize?: number;
      pnl?: number;
      date?: string;
      notes?: string | null;
      screenshotUri?: string | null;
    }
  ): Promise<Trade | null> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<Trade>('SELECT * FROM trades WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const pair = trade.pair !== undefined ? trade.pair.toUpperCase() : existing.pair;
    const direction = trade.direction !== undefined ? trade.direction : existing.direction;
    const entryPrice = trade.entryPrice !== undefined ? trade.entryPrice : existing.entry_price;
    const exitPrice = trade.exitPrice !== undefined ? trade.exitPrice : existing.exit_price;
    const lotSize = trade.lotSize !== undefined ? trade.lotSize : existing.lot_size;
    const pnl = trade.pnl !== undefined ? trade.pnl : existing.pnl;
    const date = trade.date !== undefined ? trade.date : existing.date;
    const notes = trade.notes !== undefined ? trade.notes : existing.notes;
    const screenshotUri = trade.screenshotUri !== undefined ? trade.screenshotUri : existing.screenshot_uri;

    await db.runAsync(
      `UPDATE trades
       SET pair = ?, direction = ?, entry_price = ?, exit_price = ?, lot_size = ?, pnl = ?, date = ?, notes = ?, screenshot_uri = ?, updated_at = ?
       WHERE id = ?;`,
      [pair, direction, entryPrice, exitPrice, lotSize, pnl, date, notes, screenshotUri, now, id]
    );

    return db.getFirstAsync<Trade>('SELECT * FROM trades WHERE id = ?;', [id]);
  }
}
