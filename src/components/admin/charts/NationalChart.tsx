'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { name: 'Lun', controls: 1120, infractions: 180, revenus: 8.2 },
  { name: 'Mar', controls: 1340, infractions: 220, revenus: 9.5 },
  { name: 'Mer', controls: 1180, infractions: 195, revenus: 8.8 },
  { name: 'Jeu', controls: 1450, infractions: 245, revenus: 11.2 },
  { name: 'Ven', controls: 1380, infractions: 210, revenus: 9.8 },
  { name: 'Sam', controls: 890, infractions: 130, revenus: 6.5 },
  { name: 'Dim', controls: 1247, infractions: 189, revenus: 8.7 },
]

export function NationalChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '12px 16px'
            }}
            labelStyle={{ color: '#1e293b', fontWeight: 600 }}
          />
          
          <Area
            type="monotone"
            dataKey="controls"
            stroke="#f97316"
            fill="url(#gradientControls)"
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#f97316', strokeWidth: 2, fill: 'white' }}
          />
          
          <Area
            type="monotone"
            dataKey="infractions"
            stroke="#dc2626"
            fill="url(#gradientInfractions)"
            strokeWidth={3}
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#dc2626', strokeWidth: 2, fill: 'white' }}
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradientControls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradientInfractions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-slate-600 font-medium">Contrôles Nationaux</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-slate-600 font-medium">Infractions Détectées</span>
        </div>
      </div>
    </div>
  )
}