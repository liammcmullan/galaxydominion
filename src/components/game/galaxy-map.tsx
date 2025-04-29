
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Globe, Star, HelpCircle, Loader, Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff } from 'lucide-react'; // Added Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff
import type { Sector, SectorType, OreType } from '@/types/game-types'; // Import types
import { OreType as OreTypeEnum } from '@/types/game-types'; // Import enum for generation logic

// Function to generate grid data with fog of war and ores
const generateGridData = (size = 15): Sector[][] => {
  const grid: Sector[][] = [];
  const oreTypes = Object.values(OreTypeEnum);

  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      const id = `${x}-${y}`;
      let type: SectorType = 'empty';
      let oreType: OreType | null = null;
      let oreAmount: number | undefined = undefined;
      const rand = Math.random();

      if (rand < 0.1) {
          type = 'star';
      } else if (rand < 0.25) {
          type = 'planet';
          // Assign random ore type and amount to planets
          oreType = oreTypes[Math.floor(Math.random() * oreTypes.length)];
          oreAmount = Math.floor(Math.random() * 900) + 100; // 100-1000 ore
      } else if (rand < 0.3) {
          type = 'anomaly';
      }

      grid[y][x] = {
        id,
        type,
        x,
        y,
        isVisible: false, // Default to not visible
        isExplored: false, // Default to not explored
        oreType,
        oreAmount,
      };
    }
  }

  // Set player's starting position and initial visibility/exploration
  if (size >= 5) {
    const startX = 1;
    const startY = 1;
    grid[startY][startX].type = 'player_colony';
    grid[startY][startX].oreType = null; // Start colony doesn't have ore itself
    grid[startY][startX].oreAmount = undefined;

    // Make starting sector and adjacent sectors visible and explored
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const ny = startY + dy;
            const nx = startX + dx;
            if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
                grid[ny][nx].isVisible = true;
                grid[ny][nx].isExplored = true; // Reveal content of starting area
            }
        }
    }

    // Place AI colony (ensure it's not too close and initially hidden)
     let aiX, aiY;
     do {
         aiX = Math.floor(Math.random() * (size - 4)) + 2; // Avoid edges and start area
         aiY = Math.floor(Math.random() * (size - 4)) + 2;
     } while (Math.abs(aiX - startX) < size / 3 && Math.abs(aiY - startY) < size / 3); // Ensure some distance

     grid[aiY][aiX].type = 'ai_colony';
     grid[aiY][aiX].oreType = null;
     grid[aiY][aiX].oreAmount = undefined;
     // AI colony starts hidden: isVisible = false, isExplored = false

  } else if (size > 0) {
     grid[0][0].type = 'player_colony';
     grid[0][0].isVisible = true;
     grid[0][0].isExplored = true;
  }


  return grid;
};

// Helper to get icon for ore type
const getOreIcon = (oreType: OreType) => {
    switch (oreType) {
        case OreTypeEnum.Iron: return <Mountain className="w-3 h-3 text-slate-500" />;
        case OreTypeEnum.Copper: return <Diamond className="w-3 h-3 text-orange-500" />; // Using Diamond as placeholder
        case OreTypeEnum.Gold: return <Diamond className="w-3 h-3 text-yellow-500" />; // Using Diamond as placeholder
        case OreTypeEnum.Titanium: return <Mountain className="w-3 h-3 text-gray-400" />;
        case OreTypeEnum.Uranium: return <Diamond className="w-3 h-3 text-green-500" />; // Using Diamond as placeholder
        default: return null;
    }
};

const GalaxyMap: React.FC = () => {
  const gridSize = 15;
  const [gridData, setGridData] = useState<Sector[][] | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // TODO: Add state management for exploration updates

  useEffect(() => {
    setGridData(generateGridData(gridSize));
  }, [gridSize]);

  const handleSectorClick = (sector: Sector) => {
    console.log(`Clicked sector: ${sector.id}, Type: ${sector.type}, Visible: ${sector.isVisible}, Explored: ${sector.isExplored}`);
    if (sector.isVisible) {
        setSelectedSector(sector);
        // TODO: Implement logic for interacting with visible sectors
        // If it's an unexplored but visible sector, maybe initiate scan/explore?
        // If explored, show details.
        if (!sector.isExplored) {
             console.log("Sector visible but not explored. Needs scanning.");
             // Example: Update state to mark as explored (replace with actual game logic)
             // exploreSector(sector.x, sector.y);
        }
    } else {
        console.log("Sector is hidden by fog of war.");
        setSelectedSector(null); // Don't select hidden sectors
    }
  };

  // Update this function to handle visibility and exploration states
  const getSectorContent = (sector: Sector) => {
    if (!sector.isVisible) {
      return <EyeOff className="w-4 h-4 text-muted-foreground/50" />; // Fog of war icon
    }

    if (!sector.isExplored) {
        // Visible but not explored: Show basic type or a question mark
        switch (sector.type) {
            case 'planet': return <CircleDotDashed className="w-4 h-4 text-blue-400/60" />;
            case 'star': return <Star className="w-4 h-4 text-yellow-400/60" />;
            case 'anomaly': return <HelpCircle className="w-4 h-4 text-purple-400/60" />;
            case 'player_colony': return <LocateFixed className="w-4 h-4 text-teal-500" />; // Use different icon for colony itself
            case 'ai_colony': return <LocateFixed className="w-4 h-4 text-red-500" />;
            case 'empty':
            default: return <div className="w-px h-px bg-muted-foreground/30"></div>;
        }
    }

    // Explored: Show full details
    const oreIcon = sector.oreType ? getOreIcon(sector.oreType) : null;
    const mainIconSize = oreIcon ? "w-3 h-3" : "w-4 h-4"; // Make main icon smaller if ore icon is present

    switch (sector.type) {
      case 'planet':
        return (
            <div className="flex flex-col items-center justify-center">
                <Globe className={cn(mainIconSize, "text-blue-400")} />
                {oreIcon}
            </div>
        );
      case 'star':
        return <Star className={cn(mainIconSize, "text-yellow-400")} />;
      case 'anomaly':
        return <HelpCircle className={cn(mainIconSize, "text-purple-400")} />;
      case 'player_colony':
        return <LocateFixed className={cn(mainIconSize, "text-teal-500")} />; // Colony icon
      case 'ai_colony':
         return <LocateFixed className={cn(mainIconSize, "text-red-500")} />; // AI Colony icon
      case 'empty':
      default:
        return <div className="w-px h-px bg-muted-foreground/30"></div>;
    }
  };

   // Function to update exploration state (placeholder)
   const exploreSector = (x: number, y: number) => {
    setGridData(prevGrid => {
        if (!prevGrid) return null;
        const newGrid = prevGrid.map(row => [...row]); // Deep copy rows
        if (newGrid[y] && newGrid[y][x]) {
             // Mark as explored and ensure visibility
            newGrid[y][x] = { ...newGrid[y][x], isExplored: true, isVisible: true };

             // Optional: Reveal adjacent sectors basic type (isVisible = true, isExplored = false)
             for (let dy = -1; dy <= 1; dy++) {
                 for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < gridSize && nx >= 0 && nx < gridSize && !newGrid[ny][nx].isVisible) {
                         newGrid[ny][nx] = { ...newGrid[ny][nx], isVisible: true };
                    }
                 }
             }
        }
        return newGrid;
    });
};


  return (
    <Card className="flex-1 overflow-hidden bg-background/50 border-border/50"> {/* Slightly transparent background */}
      <CardContent className="p-1 md:p-2 h-full overflow-auto relative"> {/* Added relative positioning */}
        {!gridData ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Generating Galaxy...</span>
          </div>
        ) : (
          <div
            className="grid gap-0 aspect-square" // Reduced gap for tighter grid
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {gridData.flat().map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleSectorClick(sector)}
                className={cn(
                  'relative flex items-center justify-center aspect-square border border-border/30 hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring focus:z-10 transition-colors duration-100',
                  selectedSector?.id === sector.id && sector.isVisible ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : '',
                  sector.isVisible ? 'bg-card/70' : 'bg-black/60 backdrop-blur-sm', // Visible vs Fog background
                  !sector.isVisible && 'cursor-default' // Disable cursor for fog
                )}
                aria-label={
                    !sector.isVisible ? `Sector ${sector.x}, ${sector.y}: Hidden` :
                    !sector.isExplored ? `Sector ${sector.x}, ${sector.y}: Unexplored ${sector.type}` :
                    `Sector ${sector.x}, ${sector.y}: ${sector.type}` + (sector.oreType ? ` (${sector.oreType})` : '')
                }
                disabled={!sector.isVisible} // Disable button interaction for fogged sectors
              >
                {getSectorContent(sector)}
              </button>
            ))}
          </div>
        )}

        {/* Selected Sector Info Panel */}
        {selectedSector && selectedSector.isVisible && selectedSector.isExplored && (
            <div className="absolute bottom-2 left-2 bg-popover p-3 rounded-lg shadow-lg border text-sm max-w-xs z-20 pointer-events-none">
                <h4 className="font-semibold mb-1">Sector ({selectedSector.x}, {selectedSector.y})</h4>
                <p className="capitalize">Type: {selectedSector.type.replace('_', ' ')}</p>
                {selectedSector.oreType && (
                    <div className="flex items-center mt-1">
                        <span className="mr-1">Ore:</span>
                        {getOreIcon(selectedSector.oreType)}
                        <span className="ml-1">{selectedSector.oreType} ({selectedSector.oreAmount})</span>
                    </div>
                )}
                 {!selectedSector.oreType && selectedSector.type === 'planet' && (
                     <p className="text-muted-foreground italic mt-1">No significant ore deposits detected.</p>
                 )}
                {/* Add more details like buildings, ships present etc. */}
            </div>
        )}
         {selectedSector && selectedSector.isVisible && !selectedSector.isExplored && (
             <div className="absolute bottom-2 left-2 bg-popover p-3 rounded-lg shadow-lg border text-sm max-w-xs z-20 pointer-events-none">
                 <h4 className="font-semibold mb-1">Sector ({selectedSector.x}, {selectedSector.y})</h4>
                 <p className="text-muted-foreground italic">Unexplored Area</p>
                 <p className="text-xs mt-1">Requires scanning or exploration ship.</p>
             </div>
         )}
      </CardContent>
    </Card>
  );
};

export default GalaxyMap;

