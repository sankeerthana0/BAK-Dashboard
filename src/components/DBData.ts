/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Branch, OperatingCost, SQLQuery, ForecastPoint } from '../types';

// Branches data
export const MOCK_BRANCHES: Branch[] = [
  { branchId: 'B01', branchName: 'HQ North Hub', manager: 'Sarah Jenkins', type: 'HQ', region: 'North' },
  { branchId: 'B02', branchName: 'South Coast Branch', manager: 'Marcus Vance', type: 'Branch', region: 'South' },
  { branchId: 'B03', branchName: 'West Valley Outlet', manager: 'Li Wei', type: 'Branch', region: 'West' },
  { branchId: 'B04', branchName: 'East Metro Depot', manager: 'Elena Rostova', type: 'Branch', region: 'East' },
  { branchId: 'B05', branchName: 'Downtown Express', manager: 'David Kim', type: 'Branch', region: 'Central' }
];

// Helper to generate mock data spanning the last 60 days
export function generateHistoricData() {
  const transactions: Transaction[] = [];
  const operatingCosts: OperatingCost[] = [];
  const forecastData: ForecastPoint[] = [];

  const totalDays = 60;
  const now = new Date('2026-06-12'); // matching the environment date

  // Seed categories
  const categories = ['Enterprise Software', 'Hardware Licensing', 'Professional Services', 'Consulting Solutions', 'Cloud Subscriptions'];

  // Cache dates for lookup
  const dates: { dateStr: string; dateObj: Date }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({ dateStr, dateObj: d });
  }

  // Customers seeded helper
  const customerIds = Array.from({ length: 45 }, (_, idx) => `CUST-${1000 + idx}`);

  // Base random index generator
  let transactionCounter = 10000;

  // Track daily totals for HQ and branches to build charts easily
  const branchDailyTotals: Record<string, Record<string, number>> = {};
  MOCK_BRANCHES.forEach(b => {
    branchDailyTotals[b.branchId] = {};
  });

  dates.forEach(({ dateStr, dateObj }) => {
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const dayFactor = isWeekend ? 0.6 : 1.0; // business dips on weekends

    // Operating expenses for each branch on this day
    MOCK_BRANCHES.forEach(branch => {
      // Base staffing cost: HQ is more expensive
      const baseStaff = branch.type === 'HQ' ? 2400 : 800;
      const baseRent = branch.type === 'HQ' ? 1200 : 450;
      const noise = Math.sin(dateObj.getDate()) * 50;

      operatingCosts.push({
        date: dateStr,
        branchId: branch.branchId,
        staffCost: Math.round(baseStaff + (noise * 0.4)),
        rentCost: baseRent,
        otherCost: Math.round(150 + Math.abs(noise))
      });

      // Daily transactions count for this branch
      // Lower volume on weekend, random scaling factor per branch
      const baseCount = branch.type === 'HQ' ? 18 : 6;
      let count = Math.round((baseCount + Math.floor(Math.sin(dateObj.getDate() / 2) * 3)) * dayFactor);
      if (count < 2) count = 2;

      // SPECIFIC ANOMALY INJECTION:
      // East Metro Depot (B04) supply-run bottleneck between May 17 and May 21
      // Drop transactions dramatically
      const isB04Anomaly = branch.branchId === 'B04' && dateStr >= '2026-05-17' && dateStr <= '2026-05-21';
      if (isB04Anomaly) {
        count = Math.max(1, Math.round(count * 0.15)); // 85% transaction failure
      }

      // HQ North Hub supply chain lag causing an anomaly between May 20 and May 23
      const isHQAnomaly = branch.branchId === 'B01' && dateStr >= '2026-05-20' && dateStr <= '2026-05-23';
      if (isHQAnomaly) {
        count = Math.max(2, Math.round(count * 0.5)); // 50% orders reduction
      }

      let dailySum = 0;
      for (let j = 0; j < count; j++) {
        // Average order values: Enterprise scale is high
        const avgVal = branch.type === 'HQ' ? 850 : 380;
        const randSeed = Math.sin(transactionCounter) * 0.4 + 1.0; // multiplier from 0.6 to 1.4
        let orderAmount = Math.round(avgVal * randSeed);

        // East Metro anomaly reducing purchase sizes too
        if (isB04Anomaly) {
          orderAmount = Math.round(orderAmount * 0.4);
        }

        const category = categories[Math.abs(transactionCounter) % categories.length];
        const customerId = customerIds[Math.abs(transactionCounter + 7) % customerIds.length];

        transactions.push({
          orderId: `TX-${transactionCounter++}`,
          branchId: branch.branchId,
          customerId,
          orderDate: dateStr,
          amount: orderAmount,
          category
        });

        dailySum += orderAmount;
      }

      branchDailyTotals[branch.branchId][dateStr] = dailySum;
    });
  });

  // Setup Forecasting & Deviations (Total Aggregate Revenue Level)
  // Let's model a realistic baseline daily total, confidence band, and identify anomalies
  dates.forEach(({ dateStr, dateObj }) => {
    // Collect actual aggregate revenue from transactions
    const dailyTotal = transactions
      .filter(t => t.orderDate === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    // Theoretical model: smooth rolling trend with standard seasonal baseline
    // Double exponential smooth approximation
    const dayIdx = dates.findIndex(d => d.dateStr === dateStr);
    const trend = 15000 + (dayIdx * 65); // gradual digital operations growth
    const dayOfWeek = dateObj.getDay();
    const seasonality = dayOfWeek === 0 || dayOfWeek === 6 ? -3800 : 2500;
    const expected = trend + seasonality;

    // Standard deviation for aggregate operations is roughly 1200
    const margin = 1800; 
    const upperLimit = expected + margin;
    const lowerLimit = expected - margin;

    // Detect if actual falls out of margins
    let isAnom = dailyTotal > upperLimit || dailyTotal < lowerLimit;
    let desc = '';

    if (dailyTotal < lowerLimit) {
      isAnom = true;
      if (dateStr >= '2026-05-17' && dateStr <= '2026-05-23') {
        desc = 'East Metro local bottleneck paired with North HQ hub shipment delay';
      } else {
        desc = 'Significant downward operational variance detected';
      }
    } else if (dailyTotal > upperLimit) {
      isAnom = true;
      desc = 'Abnormal surge in Enterprise Solutions licensing contracts';
    }

    forecastData.push({
      date: dateStr,
      actual: dailyTotal,
      forecast: Math.round(expected),
      upperConfidence: Math.round(upperLimit),
      lowerConfidence: Math.round(lowerLimit),
      isAnomaly: isAnom,
      anomalyReason: desc || undefined
    });
  });

  return {
    transactions,
    operatingCosts,
    forecastData,
    branches: MOCK_BRANCHES
  };
}

// Instantiate mock datasets
export const { transactions: ALL_TRANSACTIONS, operatingCosts: ALL_OPERATING_COSTS, forecastData: FORECAST_DATA, branches: ALL_BRANCHES } = generateHistoricData();

// SQL Template List detailing Join, CTE, Aggregations, Window Functions
export const STATIC_SQL_QUERIES: SQLQuery[] = [
  {
    id: 'q1',
    title: 'Customer Lifetime & CAC Contribution by Region (CTE & Join)',
    description: 'Calculates overall client values and maps regional CAC contribution ratios. Joins transactions relative to customer profiles filtered by HQ versus branches.',
    code: `WITH customer_revenue AS (
  SELECT 
    customerId,
    COUNT(orderId) AS total_orders,
    SUM(amount) AS total_spent,
    MIN(orderDate) AS first_acquisition
  FROM \`orders\`
  GROUP BY customerId
),
branch_mapping AS (
  SELECT 
    b.branchId,
    b.region,
    b.type AS branch_tier,
    -- Simulating normalized CAC parameters allocated by tier
    CASE WHEN b.type = 'HQ' THEN 450 ELSE 180 END AS regional_cac_allocated
  FROM \`branches\` b
)
SELECT 
  cr.customerId,
  bm.region,
  bm.branch_tier,
  cr.total_orders,
  cr.total_spent AS customer_ltv,
  bm.regional_cac_allocated AS cac_investment,
  ROUND(cr.total_spent / bm.regional_cac_allocated, 2) AS ltv_cac_ratio
FROM customer_revenue cr
INNER JOIN \`orders\` o ON o.customerId = cr.customerId
INNER JOIN branch_mapping bm ON bm.branchId = o.branchId
GROUP BY cr.customerId, bm.region, bm.branch_tier, cr.total_orders, cr.total_spent, bm.regional_cac_allocated
ORDER BY customer_ltv DESC
LIMIT 8;`,
    targetMetrics: ['customerId', 'region', 'branch_tier', 'total_orders', 'customer_ltv', 'cac_investment', 'ltv_cac_ratio']
  },
  {
    id: 'q2',
    title: 'Branch Revenue Ranking & Cumulative Regional Share (Window Functions)',
    description: 'Uses Window Functions ROW_NUMBER() and SUM() OVER() to mathematically sequence regional metrics and output structural market shares.',
    code: `WITH branch_sales AS (
  SELECT 
    b.branchId,
    b.branchName,
    b.region,
    SUM(o.amount) AS total_revenue,
    COUNT(o.orderId) AS volume
  FROM \`branches\` b
  LEFT JOIN \`orders\` o ON o.branchId = b.branchId
  GROUP BY b.branchId, b.branchName, b.region
),
regional_sales_totals AS (
  SELECT 
    branchId,
    branchName,
    region,
    total_revenue,
    volume,
    -- Window aggregation for total sales in matching territory
    SUM(total_revenue) OVER(PARTITION BY region) AS regional_total
  FROM branch_sales
)
SELECT 
  branchName,
  region,
  total_revenue,
  volume,
  -- Window function sequencing branch positions
  ROW_NUMBER() OVER(PARTITION BY region ORDER BY total_revenue DESC) AS territorial_rank,
  ROUND((total_revenue / regional_total) * 100, 2) AS regional_revenue_percentage
FROM regional_sales_totals
ORDER BY region, territorial_rank;`,
    targetMetrics: ['branchName', 'region', 'total_revenue', 'volume', 'territorial_rank', 'regional_revenue_percentage']
  },
  {
    id: 'q3',
    title: '7-Day Rolling Revenue Average & Growth Trend (Aggregations)',
    description: 'Establishes a running 7-Day operational aggregate smoothed timeline. Combines temporal aggregates with statistical window boundaries.',
    code: `WITH daily_sales AS (
  SELECT 
    orderDate AS sales_date,
    SUM(amount) AS gross_revenue,
    COUNT(orderId) AS transactions_count
  FROM \`orders\`
  GROUP BY orderDate
)
SELECT 
  sales_date,
  gross_revenue,
  transactions_count,
  -- Moving average calculations over 7-day preceding windows
  ROUND(AVG(gross_revenue) OVER(
    ORDER BY sales_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ), 2) AS rolling_7d_avg,
  -- Lag analysis comparing current to past days
  LAG(gross_revenue, 1) OVER(ORDER BY sales_date) AS previous_day_revenue,
  ROUND(((gross_revenue - LAG(gross_revenue, 1) OVER(ORDER BY sales_date)) 
    / COALESCE(LAG(gross_revenue, 1) OVER(ORDER BY sales_date), 1)) * 100, 1) AS dev_percentage
FROM daily_sales
ORDER BY sales_date DESC
LIMIT 12;`,
    targetMetrics: ['sales_date', 'gross_revenue', 'transactions_count', 'rolling_7d_avg', 'previous_day_revenue', 'dev_percentage']
  },
  {
    id: 'q4',
    title: 'Branch Operating Margin & Profitability Audit (Cross-Join & Cost CTE)',
    description: 'Integrates daily branch costs against transaction logs, reporting exact operational cost structures and bottom-line margin percentages.',
    code: `WITH branch_costs_cte AS (
  SELECT 
    branchId,
    SUM(staffCost) AS total_staffing,
    SUM(rentCost) AS total_rent,
    SUM(otherCost) AS total_overhead,
    SUM(staffCost + rentCost + otherCost) AS running_expenses
  FROM \`operating_costs\`
  GROUP BY branchId
),
branch_revenue_cte AS (
  SELECT 
    branchId,
    SUM(amount) AS gross_sales,
    COUNT(orderId) AS total_tx
  FROM \`orders\`
  GROUP BY branchId
)
SELECT 
  b.branchName,
  b.region,
  br.gross_sales,
  bc.running_expenses,
  (br.gross_sales - bc.running_expenses) AS net_profit,
  ROUND(((br.gross_sales - bc.running_expenses) / br.gross_sales) * 100, 1) AS operating_profit_margin,
  ROUND(br.gross_sales / br.total_tx, 0) AS average_basket_value
FROM \`branches\` b
JOIN branch_revenue_cte br ON br.branchId = b.branchId
JOIN branch_costs_cte bc ON bc.branchId = b.branchId
ORDER BY net_profit DESC;`,
    targetMetrics: ['branchName', 'region', 'gross_sales', 'running_expenses', 'net_profit', 'operating_profit_margin', 'average_basket_value']
  }
];

// In-browser SQL simulator executor engine (Emulates SQL on local structures)
// It supports parsing dates, running specific mapping logic for each of our 4 queries
export function executeMockSQLQuery(queryId: string): any[] {
  switch (queryId) {
    case 'q1': {
      // Customer Lifetime & CAC Contribution by Region
      // 1. Group transactions by customer
      const custTotals: Record<string, { totalSpent: number; totalOrders: number; branchId: string }> = {};
      ALL_TRANSACTIONS.forEach(t => {
        if (!custTotals[t.customerId]) {
          custTotals[t.customerId] = { totalSpent: 0, totalOrders: 0, branchId: t.branchId };
        }
        custTotals[t.customerId].totalSpent += t.amount;
        custTotals[t.customerId].totalOrders += 1;
      });

      // 2. Join branches information and construct response row
      const results = Object.entries(custTotals).map(([customerId, info]) => {
        const branchObj = ALL_BRANCHES.find(b => b.branchId === info.branchId) || ALL_BRANCHES[0];
        const allocatedCAC = branchObj.type === 'HQ' ? 450 : 180;
        const ratio = parseFloat((info.totalSpent / allocatedCAC).toFixed(2));
        return {
          customerId,
          region: branchObj.region,
          branch_tier: branchObj.type,
          total_orders: info.totalOrders,
          customer_ltv: info.totalSpent,
          cac_investment: allocatedCAC,
          ltv_cac_ratio: ratio
        };
      });

      // Sort descending by LTV
      return results.sort((a, b) => b.customer_ltv - a.customer_ltv).slice(0, 8);
    }

    case 'q2': {
      // Branch Revenue Ranking & Cumulative Regional Share
      // Calculate revenue per branch
      const branchStats: Record<string, { totalRevenue: number; volume: number }> = {};
      ALL_BRANCHES.forEach(b => {
        branchStats[b.branchId] = { totalRevenue: 0, volume: 0 };
      });
      ALL_TRANSACTIONS.forEach(t => {
        if (branchStats[t.branchId]) {
          branchStats[t.branchId].totalRevenue += t.amount;
          branchStats[t.branchId].volume += 1;
        }
      });

      // Calculate total regional revenues for window partitions
      const regionalSum: Record<string, number> = {};
      ALL_BRANCHES.forEach(b => {
        const rev = branchStats[b.branchId]?.totalRevenue || 0;
        regionalSum[b.region] = (regionalSum[b.region] || 0) + rev;
      });

      // Compile results list
      const unsorted = ALL_BRANCHES.map(b => {
        const stats = branchStats[b.branchId] || { totalRevenue: 0, volume: 0 };
        const regionalTotal = regionalSum[b.region] || 1;
        return {
          branchName: b.branchName,
          region: b.region,
          total_revenue: stats.totalRevenue,
          volume: stats.volume,
          regional_total: regionalTotal,
          territorial_rank: 1, // calculated below
          regional_revenue_percentage: parseFloat(((stats.totalRevenue / regionalTotal) * 100).toFixed(2))
        };
      });

      // Partition sorting for window rank simulation
      const regions = Array.from(new Set(unsorted.map(u => u.region)));
      const rankedResults: any[] = [];

      regions.forEach(reg => {
        const regionBranches = unsorted
          .filter(u => u.region === reg)
          .sort((a, b) => b.total_revenue - a.total_revenue);
        
        regionBranches.forEach((item, index) => {
          item.territorial_rank = index + 1;
          rankedResults.push(item);
        });
      });

      return rankedResults.sort((a, b) => {
        if (a.region < b.region) return -1;
        if (a.region > b.region) return 1;
        return a.territorial_rank - b.territorial_rank;
      });
    }

    case 'q3': {
      // 7-day rolling revenue aggregate
      // Group by date
      const dateAggs: Record<string, { gross_revenue: number; transactions_count: number }> = {};
      // Initialize dates
      const uniqueDates = Array.from(new Set(ALL_TRANSACTIONS.map(t => t.orderDate))).sort();

      uniqueDates.forEach(d => {
        dateAggs[d] = { gross_revenue: 0, transactions_count: 0 };
      });

      ALL_TRANSACTIONS.forEach(t => {
        if (dateAggs[t.orderDate]) {
          dateAggs[t.orderDate].gross_revenue += t.amount;
          dateAggs[t.orderDate].transactions_count += 1;
        }
      });

      // Calculate rolling averages and lag discrepancies
      const dateItems = uniqueDates.map((dateStr, index) => {
        const currentAgg = dateAggs[dateStr];
        
        // Rolling average window (last 7 elements up to index)
        const start = Math.max(0, index - 6);
        let windowSum = 0;
        let count = 0;
        for (let i = start; i <= index; i++) {
          windowSum += dateAggs[uniqueDates[i]].gross_revenue;
          count++;
        }
        const rollingAvg = parseFloat((windowSum / (count || 1)).toFixed(2));

        // Lag calculations
        const prevGross = index > 0 ? dateAggs[uniqueDates[index - 1]].gross_revenue : null;
        let growthPercent = 0;
        if (prevGross !== null && prevGross > 0) {
          growthPercent = parseFloat((((currentAgg.gross_revenue - prevGross) / prevGross) * 100).toFixed(1));
        }

        return {
          sales_date: dateStr,
          gross_revenue: currentAgg.gross_revenue,
          transactions_count: currentAgg.transactions_count,
          rolling_7d_avg: rollingAvg,
          previous_day_revenue: prevGross || 0,
          dev_percentage: growthPercent
        };
      });

      return dateItems.slice().reverse().slice(0, 12); // reverse sorted showing current, limit to 12
    }

    case 'q4': {
      // Branch Margin Audit
      // Calculate costs per branch
      const costAgg: Record<string, number> = {};
      ALL_BRANCHES.forEach(b => {
        costAgg[b.branchId] = 0;
      });
      ALL_OPERATING_COSTS.forEach(c => {
        if (costAgg[c.branchId] !== undefined) {
          costAgg[c.branchId] += c.staffCost + c.rentCost + c.otherCost;
        }
      });

      // Calculate revenues & order count per branch
      const revAgg: Record<string, { total: number; count: number }> = {};
      ALL_BRANCHES.forEach(b => {
        revAgg[b.branchId] = { total: 0, count: 0 };
      });
      ALL_TRANSACTIONS.forEach(t => {
        if (revAgg[t.branchId]) {
          revAgg[t.branchId].total += t.amount;
          revAgg[t.branchId].count += 1;
        }
      });

      const results = ALL_BRANCHES.map(b => {
        const rev = revAgg[b.branchId]?.total || 0;
        const tx = revAgg[b.branchId]?.count || 1;
        const costs = costAgg[b.branchId] || 0;
        const profit = rev - costs;
        const margin = parseFloat(((profit / (rev || 1)) * 100).toFixed(1));
        const avgBasket = Math.round(rev / tx);

        return {
          branchName: b.branchName,
          region: b.region,
          gross_sales: rev,
          running_expenses: costs,
          net_profit: profit,
          operating_profit_margin: margin,
          average_basket_value: avgBasket
        };
      });

      return results.sort((a, b) => b.net_profit - a.net_profit);
    }

    default:
      return [];
  }
}
