
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Globe, Star, HelpCircle, Loader, Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff } from 'lucide-react'; // Added Diamond, Mountain, LocateFixed, CircleDotDashed, EyeOff
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import type { Sector, SectorType, OreType, OreRichness } from '@/types/game-types'; // Import types including OreRichness
import { OreType as OreTypeEnum } from '@/types/game-types'; // Import enum for generation logic

// Function to generate grid data with fog of war and ore deposits
const generateGridData = (size = 15): Sector[][] => {
  const grid: Sector[][] = [];
  const allOreTypes = Object.values(OreTypeEnum);

  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      const id = `${x}-${y}`;
      let type: SectorType = 'empty';
      const oreDeposits: Sector['oreDeposits'] = {}; // Initialize empty deposits
      const rand = Math.random();

      if (rand < 0.04) { // Reduced star chance
          type = 'star';
      } else if (rand < 0.28) { // Planet chance
          type = 'planet';
          // Assign ore deposits to planets
          const primaryOreRoll = Math.random();
          let primaryOre: OreType;
          let primaryRichness: OreRichness = 'rich';
          let primaryAmount: number;

          // Determine primary ore type (making rare ores rarer)
          if (primaryOreRoll < 0.35) primaryOre = OreTypeEnum.Iron;
          else if (primaryOreRoll < 0.65) primaryOre = OreTypeEnum.Copper;
          else if (primaryOreRoll < 0.80) primaryOre = OreTypeEnum.Titanium; // Rare
          else if (primaryOreRoll < 0.92) primaryOre = OreTypeEnum.Gold;
          else primaryOre = OreTypeEnum.Uranium; // Very Rare

          // Assign amount based on richness and type
          primaryAmount = Math.floor(Math.random() * (primaryOre === OreTypeEnum.Uranium ? 1500 : 5000)) + 500; // Lower max for Uranium, base amounts
          if (primaryRichness === 'rich') primaryAmount = Math.floor(primaryAmount * (1 + Math.random() * 0.5)); // Rich planets have more

          oreDeposits[primaryOre] = { amount: primaryAmount, richness: primaryRichness };

          // Add secondary/trace ores (excluding the primary one)
          allOreTypes.filter(o => o !== primaryOre).forEach(secondaryOre => {
              const secondaryRoll = Math.random();
              let secondaryRichness: OreRichness = 'none';
              let secondaryAmount = 0;

              // Lower chance for secondary deposits, especially rare ones
              const baseChance = (secondaryOre === OreTypeEnum.Titanium || secondaryOre === OreTypeEnum.Uranium) ? 0.1 : 0.4;
              if (secondaryRoll < baseChance * 0.3) { // Poor deposit
                  secondaryRichness = 'poor';
                  secondaryAmount = Math.floor(Math.random() * (primaryAmount * 0.1)) + (primaryAmount * 0.02); // Much smaller amount
              } else if (secondaryRoll < baseChance) { // Trace deposit
                   secondaryRichness = 'trace';
                   secondaryAmount = Math.floor(Math.random() * (primaryAmount * 0.05)) + (primaryAmount * 0.01); // Even smaller amount
              }

              if (secondaryRichness !== 'none') {
                  oreDeposits[secondaryOre] = { amount: Math.max(1, secondaryAmount), richness: secondaryRichness }; // Ensure at least 1 unit
              }
          });

      } else if (rand < 0.30) { // Reduced anomaly chance
          type = 'anomaly';
      }

      grid[y][x] = {
        id,
        type,
        x,
        y,
        isVisible: false, // Default to not visible
        isExplored: false, // Default to not explored
        oreDeposits,
      };
    }
  }

  // Set player's starting position and initial visibility/exploration
  if (size >= 5) {
    const startX = 1;
    const startY = 1;
    grid[startY][startX].type = 'player_colony';
    // Ensure starting colony is rich in Iron and has some copper
    grid[startY][startX].oreDeposits = {
        [OreTypeEnum.Iron]: { amount: 8000 + Math.floor(Math.random() * 2000), richness: 'rich'},
        [OreTypeEnum.Copper]: { amount: 2000 + Math.floor(Math.random() * 1000), richness: 'poor'},
        [OreTypeEnum.Titanium]: { amount: 100 + Math.floor(Math.random() * 50), richness: 'trace'},
    };


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
     // Give AI similar starting resources but potentially different richness
     grid[aiY][aiX].oreDeposits = {
        [OreTypeEnum.Iron]: { amount: 7000 + Math.floor(Math.random() * 1500), richness: Math.random() < 0.8 ? 'rich' : 'poor' },
        [OreTypeEnum.Copper]: { amount: 1500 + Math.floor(Math.random() * 800), richness: Math.random() < 0.6 ? 'poor' : 'trace' },
     };
     // AI colony starts hidden: isVisible = false, isExplored = false

  } else if (size > 0) {
     grid[0][0].type = 'player_colony';
     grid[0][0].isVisible = true;
     grid[0][0].isExplored = true;
     grid[0][0].oreDeposits = { [OreTypeEnum.Iron]: { amount: 5000, richness: 'rich' }};
  }


  return grid;
};

// Helper to get icon for ore type
const getOreIcon = (oreType: OreType, richness: OreRichness) => {
    let className = "w-3 h-3 inline-block";
    let colorClass = "";
    let iconComponent = Mountain; // Default

    switch (oreType) {
        case OreTypeEnum.Iron: colorClass = "text-slate-500"; iconComponent = Mountain; break;
        case OreTypeEnum.Copper: colorClass = "text-orange-500"; iconComponent = Diamond; break;
        case OreTypeEnum.Gold: colorClass = "text-yellow-500"; iconComponent = Diamond; break;
        case OreTypeEnum.Titanium: colorClass = "text-gray-400"; iconComponent = Mountain; break;
        case OreTypeEnum.Uranium: colorClass = "text-green-500"; iconComponent = Diamond; break;
        default: return null;
    }

    // Adjust appearance based on richness
    if (richness === 'poor') className += " opacity-70";
    if (richness === 'trace') className += " opacity-40";

    const Icon = iconComponent;
    return <Icon className={cn(className, colorClass)} />;
};

// Helper to get the primary (richest) ore type and richness for display
const getPrimaryOreInfo = (deposits: Sector['oreDeposits']): { type: OreType; richness: OreRichness } | null => {
    let primaryOre: OreType | null = null;
    let primaryRichness: OreRichness = 'none';

    for (const ore in deposits) {
        const deposit = deposits[ore as OreType];
        if (deposit) {
            if (deposit.richness === 'rich') {
                return { type: ore as OreType, richness: 'rich' }; // Rich is always primary
            } else if (deposit.richness === 'poor' && primaryRichness !== 'rich') {
                primaryOre = ore as OreType;
                primaryRichness = 'poor';
            } else if (deposit.richness === 'trace' && primaryRichness === 'none') {
                primaryOre = ore as OreType;
                primaryRichness = 'trace';
            }
        }
    }

    return primaryOre ? { type: primaryOre, richness: primaryRichness } : null;
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
                 // Reveal adjacent sectors as visible but not explored (if not already visible)
                if (Math.abs(rx - x) <= 1 && Math.abs(ry - y) <= 1 && !sector.isVisible) {
                     return { ...sector, isVisible: true };
                }
                return sector; // Return unchanged sector
            })
         );
        // Update selected sector info if it's the one being explored
         if (selectedSector?.x === x && selectedSector?.y === y) {
              const exploredSector = newGrid[y]?.[x];
              if(exploredSector) setSelectedSector(exploredSector);
         }
        return newGrid;
    });
  }, [selectedSector]); // Dependency array includes selectedSector


  useEffect(() => {
    // Wrap generation in effect to prevent server/client mismatch
     setIsLoading(true);
     // Generate grid on component mount (client-side)
     const generatedGrid = generateGridData(gridSize);
     setGridData(generatedGrid);
     setIsLoading(false);
    // Simulate exploring the starting area after generation
    if (generatedGrid && generatedGrid[1] && generatedGrid[1][1]?.type === 'player_colony') {
         // Explore the starting colony sector (it's already visible and explored by generation logic)
         // Optionally explore neighbors if generation logic didn't do it
         // exploreSector(1, 1);
    }

  }, [gridSize]); // Run only once on mount based on gridSize

  const handleSectorClick = (sector: Sector) => {
    console.log(`Clicked sector: ${sector.id}, Type: ${sector.type}, Visible: ${sector.isVisible}, Explored: ${sector.isExplored}`);
    if (sector.isVisible) {
        setSelectedSector(sector);
        // If it's an unexplored but visible sector, initiate scan/explore
        if (!sector.isExplored) {
             console.log("Sector visible but not explored. Exploring...");
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
    const primaryOreInfo = getPrimaryOreInfo(sector.oreDeposits);
    const oreIcon = primaryOreInfo ? getOreIcon(primaryOreInfo.type, primaryOreInfo.richness) : null;
    const mainIconSize = oreIcon ? "w-3 h-3" : "w-4 h-4"; // Make main icon smaller if ore icon is present

    switch (sector.type) {
      case 'planet':
      case 'player_colony': // Also show primary ore for colonies
      case 'ai_colony':
         const baseColor = sector.type === 'player_colony' ? "text-teal-500" :
                           sector.type === 'ai_colony' ? "text-red-500" :
                           "text-blue-400"; // Planet color
         const Icon = sector.type === 'planet' ? Globe : LocateFixed;
        return (
            <div className="flex flex-col items-center justify-center relative">
                <Icon className={cn(mainIconSize, baseColor)} />
                {/* Position ore icon at bottom-right or similar */}
                {oreIcon && <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">{oreIcon}</div>}
            </div>
        );
      case 'star':
        return <Star className={cn(mainIconSize, "text-yellow-400")} />;
      case 'anomaly':
        return <HelpCircle className={cn(mainIconSize, "text-purple-400")} />;
      // case 'player_colony': // Handled above with planets
      //   return <LocateFixed className={cn(mainIconSize, "text-teal-500")} />; // Colony icon
      // case 'ai_colony': // Handled above with planets
      //    return <LocateFixed className={cn(mainIconSize, "text-red-500")} />; // AI Colony icon
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
                                `Sector ${sector.x}, ${sector.y}: ${sector.type}` + (Object.keys(sector.oreDeposits).length > 0 ? ` (Ores Present)` : '')
                            }
                            disabled={!sector.isVisible} // Disable button interaction for fogged sectors
                         >
                            {getSectorContent(sector)}
                         </button>
                    </TooltipTrigger>
                     {/* Tooltip Content - Conditionally render based on visibility/exploration */}
                     {sector.isVisible && (
                          <TooltipContent side="top" align="center" className="max-w-xs text-xs">
                            <p className="font-semibold mb-1 text-sm">Sector ({sector.x}, {sector.y})</p>
                            {sector.isExplored ? (
                                <>
                                    <p className="capitalize">Type: {sector.type.replace('_', ' ')}</p>
                                    {Object.keys(sector.oreDeposits).length > 0 && (
                                         <div className="mt-1 pt-1 border-t border-border/50">
                                            <p className="font-medium mb-0.5">Ore Deposits:</p>
                                            {Object.entries(sector.oreDeposits)
                                                .sort(([oreA], [oreB]) => oreA.localeCompare(oreB)) // Sort ores alphabetically
                                                .map(([ore, deposit]) => (
                                                <div key={ore} className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center">
                                                        {getOreIcon(ore as OreType, deposit.richness)}
                                                        <span className="ml-1">{ore}:</span>
                                                    </span>
                                                    <span>
                                                        {deposit.amount.toLocaleString()} <span className="text-muted-foreground capitalize">({deposit.richness})</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(sector.type === 'planet' || sector.type === 'player_colony' || sector.type === 'ai_colony') && Object.keys(sector.oreDeposits).length === 0 && (
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
                     {Object.keys(selectedSector.oreDeposits).length > 0 && (
                         <div className="mt-1 pt-1 border-t border-border/50">
                            <p className="font-medium mb-0.5 text-xs">Ore Deposits:</p>
                            {Object.entries(selectedSector.oreDeposits)
                                .sort(([oreA], [oreB]) => oreA.localeCompare(oreB))
                                .map(([ore, deposit]) => (
                                <div key={ore} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center">
                                        {getOreIcon(ore as OreType, deposit.richness)}
                                        <span className="ml-1">{ore}:</span>
                                    </span>
                                    <span>
                                        {deposit.amount.toLocaleString()} <span className="text-muted-foreground capitalize">({deposit.richness})</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {(selectedSector.type === 'planet' || selectedSector.type === 'player_colony' || selectedSector.type === 'ai_colony') && Object.keys(selectedSector.oreDeposits).length === 0 && (
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
