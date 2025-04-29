
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Globe, Star, HelpCircle, Loader, Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff } from 'lucide-react'; // Added Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
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

      if (rand < 0.05) { // Reduced star chance
          type = 'star';
      } else if (rand < 0.25) { // Increased planet chance slightly
          type = 'planet';
          // Assign random ore type and amount to planets
          const oreRand = Math.random();
           // Skew towards more common ores (Iron, Copper)
          if (oreRand < 0.4) oreType = OreTypeEnum.Iron;
          else if (oreRand < 0.7) oreType = OreTypeEnum.Copper;
          else if (oreRand < 0.85) oreType = OreTypeEnum.Titanium;
          else if (oreRand < 0.95) oreType = OreTypeEnum.Gold;
          else oreType = OreTypeEnum.Uranium; // Rarest

          oreAmount = Math.floor(Math.random() * (oreType === OreTypeEnum.Uranium ? 300 : 900)) + 100; // Lower max for Uranium
      } else if (rand < 0.28) { // Reduced anomaly chance
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
    grid[startY][startX].oreType = OreTypeEnum.Iron; // Give starting colony some basic ore
    grid[startY][startX].oreAmount = 1000;

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
     } while (Math.abs(aiX - startX) < size / 3 && Math.abs(aiY - startY) < size / 3 || grid[aiY][aiX].type !== 'empty'); // Ensure some distance and not overlapping features

     grid[aiY][aiX].type = 'ai_colony';
     grid[aiY][aiX].oreType = OreTypeEnum.Iron; // Give AI some basic ore too
     grid[aiY][aiX].oreAmount = 800;
     // AI colony starts hidden: isVisible = false, isExplored = false

  } else if (size > 0) {
     grid[0][0].type = 'player_colony';
     grid[0][0].isVisible = true;
     grid[0][0].isExplored = true;
     grid[0][0].oreType = OreTypeEnum.Iron;
     grid[0][0].oreAmount = 1000;
  }


  return grid;
};

// Helper to get icon for ore type (used in tooltips and map)
const getOreIcon = (oreType: OreType) => {
    const className = "w-3 h-3 inline-block"; // Make icons slightly bigger for tooltip clarity
    switch (oreType) {
        case OreTypeEnum.Iron: return <Mountain className={cn(className, "text-slate-500")} />;
        case OreTypeEnum.Copper: return <Diamond className={cn(className, "text-orange-500")} />;
        case OreTypeEnum.Gold: return <Diamond className={cn(className, "text-yellow-500")} />;
        case OreTypeEnum.Titanium: return <Mountain className={cn(className, "text-gray-400")} />;
        case OreTypeEnum.Uranium: return <Diamond className={cn(className, "text-green-500")} />;
        default: return null;
    }
};

const GalaxyMap: React.FC = () => {
  const gridSize = 15;
  // Use state for grid data to allow updates
  const [gridData, setGridData] = useState<Sector[][] | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(true);


   // Function to update exploration state (placeholder) - useCallback for stability
   const exploreSector = useCallback((x: number, y: number) => {
    setGridData(prevGrid => {
        if (!prevGrid) return null;
        const newGrid = prevGrid.map((row, ry) =>
            row.map((sector, rx) => {
                if (ry === y && rx === x) {
                    // Mark current sector as explored and visible
                    return { ...sector, isExplored: true, isVisible: true };
                }
                 // Optional: Reveal adjacent sectors as visible but not explored
                if (Math.abs(rx - x) <= 1 && Math.abs(ry - y) <= 1 && !sector.isVisible) {
                     return { ...sector, isVisible: true };
                }
                return sector; // Return unchanged sector
            })
         );
        return newGrid;
    });
  }, [gridSize]); // Dependency array ensures function stability unless gridSize changes


  useEffect(() => {
    // Wrap generation in effect to prevent server/client mismatch
     setIsLoading(true);
     const generatedGrid = generateGridData(gridSize);
     setGridData(generatedGrid);
     setIsLoading(false);
    // Simulate exploring the starting area after generation
    if (generatedGrid && generatedGrid[1] && generatedGrid[1][1]?.type === 'player_colony') {
         exploreSector(1, 1); // Explore the starting colony sector
    }

  }, [gridSize, exploreSector]); // Add exploreSector to dependency array

  const handleSectorClick = (sector: Sector) => {
    console.log(`Clicked sector: ${sector.id}, Type: ${sector.type}, Visible: ${sector.isVisible}, Explored: ${sector.isExplored}`);
    if (sector.isVisible) {
        setSelectedSector(sector);
        // If it's an unexplored but visible sector, initiate scan/explore
        if (!sector.isExplored) {
             console.log("Sector visible but not explored. Exploring...");
             // Example: Update state to mark as explored
             exploreSector(sector.x, sector.y); // Call the exploration function
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

    // Visible but not explored: Show basic type or a question mark
    if (!sector.isExplored) {
        switch (sector.type) {
            case 'planet': return <CircleDotDashed className="w-4 h-4 text-blue-400/60 animate-pulse" />;
            case 'star': return <Star className="w-4 h-4 text-yellow-400/60 animate-pulse" />;
            case 'anomaly': return <HelpCircle className="w-4 h-4 text-purple-400/60 animate-pulse" />;
            case 'ai_colony': return <CircleDotDashed className="w-4 h-4 text-red-500/60 animate-pulse" />; // Show as unexplored initially
            case 'player_colony': // Player colony is always explored initially
                 return <LocateFixed className="w-4 h-4 text-teal-500" />;
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
            <div className="flex flex-col items-center justify-center relative">
                <Globe className={cn(mainIconSize, "text-blue-400")} />
                {/* Position ore icon at bottom-right or similar */}
                {oreIcon && <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">{oreIcon}</div>}
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


  return (
     <TooltipProvider delayDuration={100}>
        <Card className="flex-1 overflow-hidden bg-background/50 border-border/50"> {/* Slightly transparent background */}
        <CardContent className="p-1 md:p-2 h-full overflow-auto relative"> {/* Added relative positioning */}
            {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Generating Galaxy...</span>
            </div>
            ) : gridData ? (
            <div
                className="grid gap-0 aspect-square w-full" // Ensure full width and aspect ratio
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
                {gridData.flat().map((sector) => (
                <Tooltip key={sector.id}>
                     <TooltipTrigger asChild>
                         <button
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
                    </TooltipTrigger>
                     {/* Tooltip Content - Conditionally render based on visibility/exploration */}
                     {sector.isVisible && (
                          <TooltipContent side="top" align="center">
                            <p className="font-semibold mb-1">Sector ({sector.x}, {sector.y})</p>
                            {sector.isExplored ? (
                                <>
                                    <p className="capitalize">Type: {sector.type.replace('_', ' ')}</p>
                                    {sector.oreType && (
                                        <div className="flex items-center mt-1">
                                            <span className="mr-1">Ore:</span>
                                            {getOreIcon(sector.oreType)}
                                            <span className="ml-1">{sector.oreType} ({sector.oreAmount})</span>
                                        </div>
                                    )}
                                    {!sector.oreType && sector.type === 'planet' && (
                                        <p className="text-muted-foreground italic text-xs mt-1">No significant ore detected.</p>
                                    )}
                                     {/* Add more explored details later */}
                                </>
                            ) : (
                                <>
                                    <p className="capitalize">Type: {sector.type.replace('_', ' ')} (Unexplored)</p>
                                    <p className="text-xs text-muted-foreground italic mt-1">Click to explore/scan.</p>
                                </>
                            )}
                          </TooltipContent>
                     )}
                </Tooltip>
                ))}
            </div>
            ) : (
                <div className="flex items-center justify-center h-full text-destructive">
                    Error generating galaxy map.
                </div>
            )}

            {/* Selected Sector Info Panel - Keep or remove based on preference, tooltips provide similar info */}
            {selectedSector && selectedSector.isVisible && selectedSector.isExplored && (
                <div className="absolute bottom-2 left-2 bg-popover p-3 rounded-lg shadow-lg border text-sm max-w-xs z-20 pointer-events-none">
                    <h4 className="font-semibold mb-1">Selected: Sector ({selectedSector.x}, {selectedSector.y})</h4>
                    <p className="capitalize">Type: {selectedSector.type.replace('_', ' ')}</p>
                    {selectedSector.oreType && (
                        <div className="flex items-center mt-1">
                            <span className="mr-1">Ore:</span>
                            {getOreIcon(selectedSector.oreType)}
                            <span className="ml-1">{selectedSector.oreType} ({selectedSector.oreAmount})</span>
                        </div>
                    )}
                    {!selectedSector.oreType && selectedSector.type === 'planet' && (
                        <p className="text-muted-foreground italic text-xs mt-1">No significant ore deposits detected.</p>
                    )}
                    {/* Add more details like buildings, ships present etc. */}
                </div>
            )}
            {selectedSector && selectedSector.isVisible && !selectedSector.isExplored && (
                <div className="absolute bottom-2 left-2 bg-popover p-3 rounded-lg shadow-lg border text-sm max-w-xs z-20 pointer-events-none">
                    <h4 className="font-semibold mb-1">Selected: Sector ({selectedSector.x}, {selectedSector.y})</h4>
                    <p className="text-muted-foreground italic">Unexplored Area</p>
                    <p className="text-xs mt-1">Requires scanning or exploration ship.</p>
                </div>
            )}
        </CardContent>
        </Card>
     </TooltipProvider>
  );
};

export default GalaxyMap;
