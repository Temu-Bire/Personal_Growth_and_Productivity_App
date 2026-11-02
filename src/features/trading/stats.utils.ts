export interface TradeRecord {
  id: string;
  pnl: number;
  direction: string;
  pair: string;
  date: string;
}

export function calculateTradingStats(trades: TradeRecord[]) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      pnlCurve: [0, 0],
    };
  }

  let totalPnl = 0;
  let winningTrades = 0;
  let totalWinAmount = 0;
  let losingTrades = 0;
  let totalLossAmount = 0;

  let cumulativePnl = 0;
  const pnlCurve: number[] = [0];

  // Oldest to newest for curve
  const chronTrades = [...trades].reverse();

  for (const t of chronTrades) {
    const pnl = Number(t.pnl) || 0;
    totalPnl += pnl;
    cumulativePnl += pnl;
    pnlCurve.push(Number(cumulativePnl.toFixed(2)));

    if (pnl > 0) {
      winningTrades++;
      totalWinAmount += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      totalLossAmount += Math.abs(pnl);
    }
  }

  const winRate = Number(((winningTrades / trades.length) * 100).toFixed(1));
  const avgWin = winningTrades > 0 ? Number((totalWinAmount / winningTrades).toFixed(2)) : 0;
  const avgLoss = losingTrades > 0 ? Number((totalLossAmount / losingTrades).toFixed(2)) : 0;
  const profitFactor = totalLossAmount > 0 ? Number((totalWinAmount / totalLossAmount).toFixed(2)) : totalWinAmount > 0 ? 99 : 0;

  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
    totalPnl: Number(totalPnl.toFixed(2)),
    avgWin,
    avgLoss,
    profitFactor,
    pnlCurve,
  };
}
