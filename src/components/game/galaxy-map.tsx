"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Planet, Star, HelpCircle } from 'lucide-react'; // Example icons

// Define types for map elements
type SectorType = 'empty' | 'planet' | 'star' | 'anomaly' | 'player_colony' | 'ai_colony';

interface Sector {
  id: string;
  type: SectorType;
  x: number;
  y: number;
}

// Example Grid Data (replace with dynamic data fetching/generation later)
const generateGridData = (size = 10): Sector[][] => {
  const grid: Sector[][] = [];
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      const id = `${x}-${y}`;
      let type: SectorType = 'empty';
      const rand = Math.random();
      if (rand < 0.1) type = 'star';
      else if (rand < 0.25) type = 'planet';
      else if (rand < 0.3) type = 'anomaly';
      // Placeholder for colonies
      // if (x === 2 && y === 2) type = 'player_colony';
      // if (x === size - 3 && y === size - 3) type = 'ai_colony';
      grid[y][x] = { id, type, x, y };
    }
  }
  // Ensure at least one player and one AI colony for basic testing
  if (size >= 5) {
     grid[1][1].type = 'player_colony';
     grid[size-2][size-2].type = 'ai_colony';
  } else if (size > 0) {
     grid[0][0].type = 'player_colony';
  }

  return grid;
};

const GalaxyMap: React.FC = () => {
  const gridSize = 15; // Adjust grid size as needed
  const gridData = React.useMemo(() => generateGridData(gridSize), [gridSize]);
  const [selectedSector, setSelectedSector] = React.useState<Sector | null>(null);

  const handleSectorClick = (sector: Sector) => {
    console.log(`Clicked sector: ${sector.id}, Type: ${sector.type}`);
    setSelectedSector(sector);
    // TODO: Implement logic for interacting with sectors (e.g., sending scout, colonizing)
    // This might involve updating the ControlPanel state or triggering game actions.
  };

  const getSectorIcon = (type: SectorType) => {
    switch (type) {
      case 'planet':
        return <Planet className="w-4 h-4 text-blue-400" />;
      case 'star':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'anomaly':
        return <HelpCircle className="w-4 h-4 text-purple-400" />;
       case 'player_colony':
         return <div className="w-3 h-3 rounded-full bg-teal-500 border border-teal-200" title="Player Colony"></div>;
       case 'ai_colony':
         return <div className="w-3 h-3 rounded-full bg-red-500 border border-red-200" title="AI Colony"></div>;
      case 'empty':
      default:
        return null; // Or a faint dot for empty space
    }
  };

  return (
    <Card className="flex-1 overflow-hidden">
      <CardContent className="p-2 h-full overflow-auto">
        <div
          className="grid gap-0.5 aspect-square"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {gridData.flat().map((sector) => (
            <button
              key={sector.id}
              onClick={() => handleSectorClick(sector)}
              className={cn(
                'relative flex items-center justify-center aspect-square border border-muted hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:z-10 transition-colors duration-100',
                selectedSector?.id === sector.id ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border-border/50',
                'bg-card' // Use card background for sectors
              )}
              aria-label={`Sector ${sector.x}, ${sector.y}: ${sector.type}`}
            >
              {getSectorIcon(sector.type)}
               {/* Add subtle visual cue for empty space if desired */}
              {sector.type === 'empty' && <div className="w-px h-px bg-muted-foreground/30"></div>}
            </button>
          ))}
        </div>
      </CardContent>
       {/* Optional: Display selected sector info */}
       {/* {selectedSector && (
        <div className="absolute bottom-2 left-2 bg-popover p-2 rounded shadow-lg border text-sm">
          Selected: ({selectedSector.x}, {selectedSector.y}) - {selectedSector.type}
        </div>
      )} */}
    </Card>
  );
};

export default GalaxyMap;
