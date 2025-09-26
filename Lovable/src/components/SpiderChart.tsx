import React from 'react';
import { CriteriaScore } from '@/types/potentials';

interface SpiderChartProps {
  criteriaScores: CriteriaScore[];
  size?: number;
  className?: string;
}

const SpiderChart: React.FC<SpiderChartProps> = ({ 
  criteriaScores, 
  size = 240, 
  className = "" 
}) => {
  console.log('SpiderChart received criteriaScores:', criteriaScores);
  
  if (!criteriaScores.length) {
    console.log('SpiderChart: No criteria scores provided');
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="text-muted-foreground text-sm">No criteria data available</div>
      </div>
    );
  }

  // Check if scores are valid numbers
  const validScores = criteriaScores.filter(score => 
    score.score != null && 
    typeof score.score === 'number' && 
    !isNaN(score.score)
  );
  
  if (!validScores.length) {
    console.log('SpiderChart: No valid scores found', criteriaScores);
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="text-muted-foreground text-sm">No valid score data available</div>
      </div>
    );
  }

  // Add padding for labels
  const padding = 60;
  const chartSize = size;
  const totalSize = chartSize + (padding * 2);
  const center = totalSize / 2;
  const radius = chartSize * 0.35;
  const numberOfCriteria = validScores.length;
  
  // Create points for the grid lines (5 levels from 1-5 score)
  const gridLevels = [1, 2, 3, 4, 5];
  
  // Calculate angle for each criterion
  const angleStep = (2 * Math.PI) / numberOfCriteria;
  
  // Helper function to convert score to radius (invert so 1=outer, 5=inner)
  const scoreToRadius = (score: number) => {
    return radius * (6 - score) / 5; // Invert: 1 maps to full radius, 5 maps to minimal radius
  };
  
  // Helper function to get point coordinates
  const getPoint = (angle: number, distance: number) => {
    const x = center + distance * Math.cos(angle - Math.PI / 2);
    const y = center + distance * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  // Generate grid lines
  const gridLines = gridLevels.map(level => {
    const points = Array.from({ length: numberOfCriteria }, (_, i) => {
      const angle = i * angleStep;
      const distance = scoreToRadius(level);
      return getPoint(angle, distance);
    });
    
    const pathData = points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
    
    return {
      level,
      pathData,
      opacity: level === 1 ? 0.4 : level === 5 ? 0.8 : 0.2
    };
  });

  // Generate axis lines
  const axisLines = Array.from({ length: numberOfCriteria }, (_, i) => {
    const angle = i * angleStep;
    const start = getPoint(angle, 0);
    const end = getPoint(angle, radius);
    return { start, end, angle, index: i };
  });

  // Generate data polygon
  const dataPoints = validScores.map((score, i) => {
    const angle = i * angleStep;
    const distance = scoreToRadius(score.score);
    return getPoint(angle, distance);
  });

  const dataPathData = dataPoints.map((point, i) => 
    `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  // Get color based on average score
  const avgScore = validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length;
  const getScoreColor = (score: number) => {
    if (score <= 2.5) return 'text-green-600';
    if (score <= 3.5) return 'text-yellow-600'; 
    return 'text-red-600';
  };

  return (
    <div className={`w-full max-w-[400px] mx-auto overflow-visible ${className}`}>
      <svg 
        width="100%" 
        height="400" 
        className="w-full max-w-full overflow-visible" 
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {gridLines.map((grid, i) => (
          <path
            key={`grid-${grid.level}`}
            d={grid.pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/30"
            opacity={grid.opacity}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((axis, i) => (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={axis.end.x}
            y2={axis.end.y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/40"
          />
        ))}

        {/* Data polygon */}
        <path
          d={dataPathData}
          fill="hsl(var(--primary))"
          fillOpacity="0.2"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
        ))}

        {/* Score labels on grid */}
        {gridLevels.map(level => {
          const point = getPoint(0, scoreToRadius(level));
          return (
            <text
              key={`score-${level}`}
              x={point.x + 8}
              y={point.y + 4}
              fontSize="10"
              fill="currentColor"
              className="text-muted-foreground text-xs font-medium"
            >
              {level}
            </text>
          );
        })}

        {/* Criterion labels */}
        {validScores.map((score, i) => {
          const angle = i * angleStep;
          const labelDistance = radius + 25;
          const point = getPoint(angle, labelDistance);
          
          // Adjust text anchor based on position
          let textAnchor = "middle";
          if (point.x > center + 10) textAnchor = "start";
          if (point.x < center - 10) textAnchor = "end";
          
          return (
            <g key={`label-${i}`}>
              <text
                x={point.x}
                y={point.y - 5}
                fontSize="11"
                fontWeight="500"
                fill="currentColor"
                textAnchor={textAnchor}
                className="text-foreground"
              >
                {score.criterion || 'Unknown'}
              </text>
              <text
                x={point.x}
                y={point.y + 8}
                fontSize="10"
                fill="currentColor"
                textAnchor={textAnchor}
                className={getScoreColor(score.score)}
              >
                {score.score.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Center score display */}
        <circle
          cx={center}
          cy={center}
          r="20"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        <text
          x={center}
          y={center - 3}
          fontSize="10"
          fontWeight="500"
          textAnchor="middle"
          fill="currentColor"
          className="text-muted-foreground"
        >
          AVG
        </text>
        <text
          x={center}
          y={center + 8}
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
          className={getScoreColor(avgScore)}
        >
          {avgScore.toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

export default SpiderChart;