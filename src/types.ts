/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  orderId: string;
  branchId: string;
  customerId: string;
  orderDate: string;
  amount: number;
  category: string;
}

export interface Branch {
  branchId: string;
  branchName: string;
  manager: string;
  type: 'HQ' | 'Branch';
  region: string;
}

export interface OperatingCost {
  date: string;
  branchId: string;
  staffCost: number;
  rentCost: number;
  otherCost: number;
}

export interface SQLQuery {
  id: string;
  title: string;
  description: string;
  code: string;
  targetMetrics: string[];
}

export interface ForecastPoint {
  date: string;
  actual: number;
  forecast: number;
  upperConfidence: number;
  lowerConfidence: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  value: string;
  change: number; // percentage change, e.g., +4.2
  timeframe: string;
  status: 'optimal' | 'warning' | 'critical';
  details: string;
}
