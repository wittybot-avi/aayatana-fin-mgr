import React, { useEffect, useState } from 'react';
import { db } from '../services/dataStore';
import { DashboardMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingDown, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const m = await db.getDashboardMetrics();
      const c = await db.getCategoryBreakdown();
      setMetrics(m);
      setCategoryData(c);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading || !metrics) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  const currency = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-500">Financial overview for Aayatana Tech</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Cash Balance" 
          value={currency(metrics.currentCashBalance)} 
          subtext="Available liquidity"
          icon={Wallet}
          colorClass="bg-indigo-600 text-indigo-600"
        />
        <MetricCard 
          title="Monthly Burn" 
          value={currency(metrics.monthlyBurn)} 
          subtext="Avg. last 3 months"
          icon={TrendingDown}
          colorClass="bg-red-500 text-red-500"
        />
        <MetricCard 
          title="Runway" 
          value={`${metrics.runwayMonths.toFixed(1)} Months`} 
          subtext="Based on current burn"
          icon={AlertCircle}
          colorClass={metrics.runwayMonths < 6 ? "bg-orange-500 text-orange-500" : "bg-emerald-500 text-emerald-500"}
        />
         <MetricCard 
          title="Last Month Outflow" 
          value={currency(metrics.totalOutflowLastMonth)} 
          subtext="Total expenses"
          icon={TrendingUp}
          colorClass="bg-blue-500 text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="font-semibold text-slate-800 mb-6">Spend by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => currency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mock Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="font-semibold text-slate-800 mb-6">Burn Rate Trend</h3>
           <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={[
                { name: 'Jun', amount: metrics.monthlyBurn * 0.9 },
                { name: 'Jul', amount: metrics.monthlyBurn * 1.1 },
                { name: 'Aug', amount: metrics.monthlyBurn * 0.95 },
                { name: 'Sep', amount: metrics.monthlyBurn * 1.05 },
                { name: 'Oct', amount: metrics.monthlyBurn },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip formatter={(value: number) => currency(value)} cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
