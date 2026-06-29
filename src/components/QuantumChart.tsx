import React from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { GlassCard } from './GlassCard';

const { width: windowWidth } = Dimensions.get('window');
const CHART_HEIGHT = 140;

export interface QuantumChartProps {
  data: Array<{ day: string; amount: number; frequency: number; surcharge: number }>;
}

export const QuantumChart: React.FC<QuantumChartProps> = ({ data }) => {
  const chartWidth = windowWidth - 52;
  
  // Find max value to scale chart appropriately
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  // Generate points coordinates
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    // Scale y coordinate, leaving a 20px padding at top and bottom
    const y = CHART_HEIGHT - (d.amount / maxAmount) * (CHART_HEIGHT - 35) - 15;
    return { x, y, amount: d.amount, day: d.day };
  });

  // Construct SVG Bezier path for smooth spline curve
  let pathStr = "";
  let areaPathStr = "";

  if (points.length > 0) {
    pathStr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i+1];
      // Control points for smooth bezier curve
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    
    // For area path fill
    areaPathStr = `${pathStr} L ${points[points.length-1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.chartHeader}>
        <Text style={styles.title}>WEEKLY OUTFLOW TREND</Text>
        <Text style={styles.maxSpend}>PEAK: ₹{Math.max(...data.map(d => d.amount)).toLocaleString()}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Area Fill under spline */}
          {areaPathStr ? <Path d={areaPathStr} fill="url(#chartGrad)" /> : null}

          {/* Main Spline Line */}
          {pathStr ? <Path d={pathStr} fill="none" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.8} /> : null}

          {/* Hotspots / Dots on vertices */}
          {points.map((p, idx) => (
            <React.Fragment key={idx}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="#FFFFFF"
                opacity={p.amount > 0 ? 0.9 : 0.15}
              />
              {p.amount > 0 && (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  opacity={0.25}
                />
              )}
            </React.Fragment>
          ))}
        </Svg>
      </View>

      {/* X-Axis labels */}
      <View style={styles.labelsContainer}>
        {data.map((d, index) => (
          <Text key={index} style={styles.labelText}>{d.day.toUpperCase()}</Text>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  maxSpend: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    width: 32,
    textAlign: 'center',
  },
});
