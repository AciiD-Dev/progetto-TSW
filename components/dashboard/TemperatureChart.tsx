
'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SensorReading } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface Props {
  readings: SensorReading[];
  title?: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
  type?: 'thermostat' | 'humidity';
}

export default function TemperatureChart({
  readings,
  title = 'Sensor Trend',
  subtitle = 'Last 24 hours',
  color = 'primary',
  type = 'thermostat',
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const accentColor = color === 'primary' ? '#38BDF8' : color === 'secondary' ? '#6366F1' : '#10B981';
  const glowColor   = color === 'primary' ? 'rgba(56,189,248,' : color === 'secondary' ? 'rgba(99,102,241,' : 'rgba(16,185,129,';

  // Build labels & values, inserting nulls where there are time gaps (device was off)
  const GAP_THRESHOLD_MS = 30_000; // 30 seconds — anything longer is a gap
  const labels: string[] = [];
  const values: (number | null)[] = [];

  for (let i = 0; i < readings.length; i++) {
    // Detect gap between consecutive readings
    if (i > 0) {
      const prev = new Date(readings[i - 1].recorded_at).getTime();
      const curr = new Date(readings[i].recorded_at).getTime();
      if (curr - prev > GAP_THRESHOLD_MS) {
        // Insert a null point to break the line
        labels.push('');
        values.push(null);
      }
    }
    const d = new Date(readings[i].recorded_at);
    labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    values.push(readings[i].value);
  }

  const realValues = values.filter((v): v is number => v !== null);
  
  // Dynamic bounds based on type
  let minVal = 0;
  let maxVal = 100;
  if (type === 'thermostat') {
    minVal = realValues.length ? Math.min(...realValues) - 1 : 15;
    maxVal = realValues.length ? Math.max(...realValues) + 1 : 30;
  } else if (type === 'humidity') {
    minVal = realValues.length ? Math.max(0, Math.min(...realValues) - 5) : 30;
    maxVal = realValues.length ? Math.min(100, Math.max(...realValues) + 5) : 70;
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: accentColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: accentColor,
        pointHoverBorderColor: '#0d1117',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
        spanGaps: false,
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          gradient.addColorStop(0, `${glowColor}0.15)`);
          gradient.addColorStop(0.6, `${glowColor}0.04)`);
          gradient.addColorStop(1, `${glowColor}0)`);
          return gradient;
        },
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161b26',
        borderColor: 'rgba(46,53,69,0.8)',
        borderWidth: 1,
        titleColor: '#8b90a0',
        bodyColor: '#e8eaf0',
        padding: 10,
        cornerRadius: 10,
        titleFont: { size: 11, family: 'Inter' },
        bodyFont: { size: 13, family: 'Space Grotesk', weight: 'bold' as const },
        callbacks: {
          label: (ctx: any) => ` ${(ctx.parsed?.y ?? 0).toFixed(1)} ${type === 'thermostat' ? '°C' : '%'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#8b90a0',
          font: { size: 10, family: 'Inter' },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
      },
      y: {
        min: minVal,
        max: maxVal,
        grid: {
          color: 'rgba(46,53,69,0.4)',
          lineWidth: 1,
        },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: '#8b90a0',
          font: { size: 10, family: 'Inter' },
          maxTicksLimit: 5,
          callback: (v) => `${v}${type === 'thermostat' ? '°' : '%'}`,
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-on-surface headline-font text-sm">{title}</h3>
          <p className="text-xs text-on-surface-variant/60 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      {!mounted ? (
        <div className="h-52 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 animate-spin">progress_activity</span>
        </div>
      ) : readings.length === 0 ? (
        <div className="h-52 flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">show_chart</span>
          <p className="text-sm text-on-surface-variant/40">No data available</p>
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
