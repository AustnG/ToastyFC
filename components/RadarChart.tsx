
import React, { useEffect, useRef } from 'react';
import { RadarChartProps, RadarChartDataItem } from '../types';
import { PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK } from '../constants';

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 300, // Default size of the canvas
  maxValue = 100, // Max value for the stats (e.g. 0-100 scale)
  levels = 5, // Number of concentric circles/polygons for the grid
  labelFactor = 1.25, // How far out the labels are from the chart
  dotRadius = 3, // Radius of dots on data points
  strokeWidth = 2, // Width of the data polygon stroke
  showTooltip = false, // Basic tooltip functionality (can be expanded)
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = size;
    const height = size;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.75; // Main chart radius
    const angleSlice = (Math.PI * 2) / data.length;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // --- Draw Grid ---
    ctx.strokeStyle = '#E0E0E0'; // Light grey for grid lines
    ctx.lineWidth = 0.5;

    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      for (let j = 0; j < data.length; j++) {
        const x = centerX + levelRadius * Math.cos(angleSlice * j - Math.PI / 2);
        const y = centerY + levelRadius * Math.sin(angleSlice * j - Math.PI / 2);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // --- Draw Axes ---
    ctx.strokeStyle = '#BDBDBD'; // Slightly darker grey for axes
    ctx.lineWidth = 1;
    for (let i = 0; i < data.length; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const x = centerX + radius * Math.cos(angleSlice * i - Math.PI / 2);
      const y = centerY + radius * Math.sin(angleSlice * i - Math.PI / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // --- Draw Labels ---
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = THEME_BLACK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    data.forEach((item, i) => {
      const labelRadius = radius * labelFactor;
      const x = centerX + labelRadius * Math.cos(angleSlice * i - Math.PI / 2);
      const y = centerY + labelRadius * Math.sin(angleSlice * i - Math.PI / 2);
      
      ctx.fillText(item.label, x, y);
    });

    // --- Draw Data Polygon ---
    ctx.beginPath();
    data.forEach((item, i) => {
      const valueRatio = Math.max(0, Math.min(item.value, maxValue)) / maxValue; // Ensure value is within 0-maxValue
      const currentRadius = radius * valueRatio;
      const x = centerX + currentRadius * Math.cos(angleSlice * i - Math.PI / 2);
      const y = centerY + currentRadius * Math.sin(angleSlice * i - Math.PI / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = `${PRIMARY_COLOR}80`; // Primary color with some transparency
    ctx.fill();
    ctx.stroke();

    // --- Draw Dots at Data Points (Optional) ---
    if (dotRadius > 0) {
      ctx.fillStyle = ACCENT_COLOR;
      data.forEach((item, i) => {
        const valueRatio = Math.max(0, Math.min(item.value, maxValue)) / maxValue;
        const currentRadius = radius * valueRatio;
        const x = centerX + currentRadius * Math.cos(angleSlice * i - Math.PI / 2);
        const y = centerY + currentRadius * Math.sin(angleSlice * i - Math.PI / 2);
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // --- Draw Numerical Values for Each Attribute ---
    ctx.fillStyle = ACCENT_COLOR; // Use accent color for visibility
    ctx.font = 'bold 10px Arial'; // Slightly smaller, bold font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textOffset = dotRadius + 8; // Offset from the data point dot

    data.forEach((item, i) => {
      const valueRatio = Math.max(0, Math.min(item.value, maxValue)) / maxValue;
      const pointRadius = radius * valueRatio;
      const angle = angleSlice * i - Math.PI / 2;

      // Position text slightly outside the data point
      const textX = centerX + (pointRadius + textOffset) * Math.cos(angle);
      const textY = centerY + (pointRadius + textOffset) * Math.sin(angle);
      
      // Small adjustment if text is too close to axis labels for very high values
      const distanceToLabel = radius * labelFactor - (pointRadius + textOffset);
      if (distanceToLabel < 10 && item.value / maxValue > 0.8) { // If value is high and text is close to label
        // Optional: Could slightly nudge text inward, but for now, let's keep it simple.
        // Example: textX = centerX + (pointRadius + textOffset - 5) * Math.cos(angle);
        //          textY = centerY + (pointRadius + textOffset - 5) * Math.sin(angle);
      }

      ctx.fillText(item.value.toString(), textX, textY);
    });


    // Basic Tooltip (Example, needs more work for robust implementation)
    if (showTooltip && canvas) {
        canvas.onmousemove = (event) => {
            // Tooltip logic can be complex, for now, this is a placeholder.
            // To implement fully, you'd need to:
            // 1. Get mouse coordinates relative to canvas.
            // 2. Check if mouse is over a data point (requires hit detection logic).
            // 3. If over a point, draw a tooltip (e.g., a small rectangle with text).
            // 4. Clear and redraw the chart or just the tooltip area on mousemove to update/hide.
        };
        canvas.onmouseout = () => {
            // Logic to hide tooltip if it was shown
        }
    }

  }, [data, size, maxValue, levels, labelFactor, dotRadius, strokeWidth, showTooltip]);

  return (
    <div style={{ width: size, height: size, margin: '0 auto' }} role="img" aria-label={`Radar chart showing player attributes: ${data.map(d => `${d.label} ${d.value}`).join(', ')}.`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default RadarChart;
