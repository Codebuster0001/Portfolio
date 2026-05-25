import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const dummyData = {
  daily: [
    { name: 'Mon', visitors: 12 },
    { name: 'Tue', visitors: 19 },
    { name: 'Wed', visitors: 15 },
    { name: 'Thu', visitors: 25 },
    { name: 'Fri', visitors: 22 },
    { name: 'Sat', visitors: 30 },
    { name: 'Sun', visitors: 45 },
  ],
  monthly: [
    { name: 'Jan', visitors: 150 },
    { name: 'Feb', visitors: 230 },
    { name: 'Mar', visitors: 180 },
    { name: 'Apr', visitors: 290 },
    { name: 'May', visitors: 320 },
    { name: 'Jun', visitors: 250 },
    { name: 'Jul', visitors: 400 },
    { name: 'Aug', visitors: 380 },
    { name: 'Sep', visitors: 500 },
    { name: 'Oct', visitors: 420 },
    { name: 'Nov', visitors: 600 },
    { name: 'Dec', visitors: 550 },
  ],
  yearly: [
    { name: '2020', visitors: 1200 },
    { name: '2021', visitors: 2500 },
    { name: '2022', visitors: 3800 },
    { name: '2023', visitors: 5200 },
    { name: '2024', visitors: 7500 },
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-300 dark:border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-zinc-400 text-xs mb-1 font-semibold">{label}</p>
        <p className="text-blue-400 font-bold">
          {payload[0].value} <span className="text-slate-400 dark:text-zinc-500 font-normal text-xs ml-1">visitors</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  const [filter, setFilter] = useState('monthly');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Visitors Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Track your portfolio traffic over time</p>
        </div>
        <div className="flex bg-slate-50 dark:bg-zinc-950 rounded-lg p-1 border border-slate-200 dark:border-white/5">
          {['daily', 'monthly', 'yearly'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 dark:text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dummyData[filter]}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="visitors" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVisitors)" 
              activeDot={{ r: 6, fill: "#a855f7", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
