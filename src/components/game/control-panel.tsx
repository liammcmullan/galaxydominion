
"use client";

import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress'; // Import Progress
import { Package, Rocket, FlaskConical, Users, Sun, Atom, ShieldCheck, Target, Warehouse, Banknote, Library, HeartPulse, Ship, Factory, Mountain, Diamond, Zap } from 'lucide-react'; // Added Zap icon
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"; // Import useToast
import type { Building, ShipType, ResearchItem, Resources, OreType, ConstructionProgress, BuildingCategory } from '@/types/game-types';
import { OreType as OreTypeEnum, getOreRefineryDescription } from '@/types/game-types'; // Import enum and description function

// Define Building Categories
const buildingCategories: BuildingCategory[] = ['Core', 'Production', 'Power', 'Defense', 'Utility', 'Shipyard'];

// --- Building Definitions ---
// Use baseCost, baseConstructionTime, costMultiplier, timeMultiplier etc. as defined in types
const availableBuildings: Building[] = [
  // Core
  { id: 'colony_hub', name: 'Colony Hub', category: 'Core', description: 'Central structure. Upgrading allows more buildings.', baseCost: { [OreTypeEnum.Iron]: 100 }, icon: Factory, level: 1, baseConstructionTime: 10000, maxLevel: 5, costMultiplier: 1.8, timeMultiplier: 1.6 }, // 10 seconds base
  { id: 'colony_expansion', name: 'Colony Expansion', category: 'Core', description: 'Increases population cap and worker allocation.', baseCost: { [OreTypeEnum.Iron]: 200, [OreTypeEnum.Titanium]: 20 }, icon: Users, level: 1, baseConstructionTime: 20000, maxLevel: 3, costMultiplier: 2.0, timeMultiplier: 1.8 },

  // Production (Specific Refineries) - Added baseProductionRate
  { id: 'iron_refinery', name: 'Iron Refinery', category: 'Production', description: getOreRefineryDescription(OreTypeEnum.Iron), oreTarget: OreTypeEnum.Iron, baseCost: { [OreTypeEnum.Iron]: 50, [OreTypeEnum.Copper]: 10 }, icon: Package, level: 1, baseEnergyCost: 5, baseConstructionTime: 6000, maxLevel: 5, costMultiplier: 1.5, timeMultiplier: 1.4, baseProductionRate: 1 },
  { id: 'copper_refinery', name: 'Copper Refinery', category: 'Production', description: getOreRefineryDescription(OreTypeEnum.Copper), oreTarget: OreTypeEnum.Copper, baseCost: { [OreTypeEnum.Iron]: 60, [OreTypeEnum.Copper]: 25 }, icon: Package, level: 1, baseEnergyCost: 6, baseConstructionTime: 7000, maxLevel: 5, costMultiplier: 1.6, timeMultiplier: 1.4, baseProductionRate: 0.8 },
  { id: 'gold_refinery', name: 'Gold Refinery', category: 'Production', description: getOreRefineryDescription(OreTypeEnum.Gold), oreTarget: OreTypeEnum.Gold, baseCost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 40, [OreTypeEnum.Gold]: 5 }, icon: Package, level: 1, baseEnergyCost: 8, baseConstructionTime: 12000, maxLevel: 5, costMultiplier: 1.8, timeMultiplier: 1.5, baseProductionRate: 0.2 },
  { id: 'titanium_refinery', name: 'Titanium Refinery', category: 'Production', description: getOreRefineryDescription(OreTypeEnum.Titanium), oreTarget: OreTypeEnum.Titanium, baseCost: { [OreTypeEnum.Iron]: 150, [OreTypeEnum.Titanium]: 30 }, icon: Package, level: 1, baseEnergyCost: 10, baseConstructionTime: 15000, maxLevel: 5, costMultiplier: 1.7, timeMultiplier: 1.5, baseProductionRate: 0.5 },
  { id: 'uranium_refinery', name: 'Uranium Refinery', category: 'Production', description: getOreRefineryDescription(OreTypeEnum.Uranium), oreTarget: OreTypeEnum.Uranium, baseCost: { [OreTypeEnum.Titanium]: 100, [OreTypeEnum.Uranium]: 10 }, icon: Package, level: 1, baseEnergyCost: 12, requires: 'Research: Nuclear Power', baseConstructionTime: 25000, maxLevel: 5, costMultiplier: 2.0, timeMultiplier: 1.6, baseProductionRate: 0.1 },

  // Power
  { id: 'solar_plant', name: 'Solar Plant', category: 'Power', description: 'Low output, cheap, low maintenance.', baseCost: { [OreTypeEnum.Iron]: 80, [OreTypeEnum.Copper]: 20 }, icon: Sun, level: 1, baseEnergyProduction: 20, baseConstructionTime: 7000, maxLevel: 5, costMultiplier: 1.4, timeMultiplier: 1.3 },
  { id: 'nuclear_reactor', name: 'Nuclear Reactor', category: 'Power', description: 'High output, expensive, potential risks.', baseCost: { [OreTypeEnum.Iron]: 400, [OreTypeEnum.Titanium]: 100, [OreTypeEnum.Uranium]: 10 }, icon: Atom, level: 1, requires: 'Research: Nuclear Power', baseEnergyProduction: 100, baseConstructionTime: 45000, maxLevel: 3, costMultiplier: 2.5, timeMultiplier: 2.0 },

  // Defense
  { id: 'laser_turret', name: 'Laser Turret', category: 'Defense', description: 'Basic planetary defense.', baseCost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 40 }, icon: Target, level: 1, baseEnergyCost: 20, baseConstructionTime: 9000, maxLevel: 5, costMultiplier: 1.6, timeMultiplier: 1.4 },
  { id: 'missile_battery', name: 'Missile Battery', category: 'Defense', description: 'Long-range planetary defense.', baseCost: { [OreTypeEnum.Iron]: 180, [OreTypeEnum.Titanium]: 30 }, icon: Target, level: 1, baseEnergyCost: 25, baseConstructionTime: 18000, maxLevel: 5, costMultiplier: 1.7, timeMultiplier: 1.5 },
  { id: 'shield_generator', name: 'Shield Generator', category: 'Defense', description: 'Protects the colony from orbital bombardment.', baseCost: { [OreTypeEnum.Iron]: 300, [OreTypeEnum.Gold]: 50, [OreTypeEnum.Titanium]: 75 }, icon: ShieldCheck, level: 1, baseEnergyCost: 50, baseConstructionTime: 30000, maxLevel: 3, costMultiplier: 2.2, timeMultiplier: 1.8 },

  // Utility
  { id: 'trade_port', name: 'Trade Port', category: 'Utility', description: 'Allows trade of ore for resources. Unlocks Cargo Ships.', baseCost: { [OreTypeEnum.Iron]: 75, [OreTypeEnum.Gold]: 10 }, icon: Banknote, level: 1, baseConstructionTime: 8000 }, // Assuming no upgrades for now
  { id: 'research_lab', name: 'Research Lab', category: 'Utility', description: 'Unlocks tech trees and advanced upgrades. Upgrading speeds up research.', baseCost: { [OreTypeEnum.Iron]: 150, [OreTypeEnum.Copper]: 50 }, icon: Library, level: 1, baseEnergyCost: 10, baseConstructionTime: 15000, maxLevel: 3, costMultiplier: 1.9, timeMultiplier: 1.7 },
  { id: 'medical_lab', name: 'Medical Lab', category: 'Utility', description: 'Improves worker efficiency and reduces downtime.', baseCost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 30 }, icon: HeartPulse, level: 1, baseEnergyCost: 8, baseConstructionTime: 12000, maxLevel: 3, costMultiplier: 1.7, timeMultiplier: 1.5 },

  // Shipyard
  { id: 'ship_facility', name: 'Ship Facility', category: 'Shipyard', description: 'Builds and upgrades ships. Upgrading increases build speed and unlocks advanced ships.', baseCost: { [OreTypeEnum.Iron]: 250, [OreTypeEnum.Titanium]: 50 }, icon: Ship, level: 1, baseEnergyCost: 15, baseConstructionTime: 25000, maxLevel: 3, costMultiplier: 2.0, timeMultiplier: 1.8 },
];


// --- Ship Definitions ---
const availableShips: ShipType[] = [
  { id: 'scout', name: 'Scout', description: 'Fast exploration vessel, reveals nearby sectors.', cost: { [OreTypeEnum.Iron]: 30, [OreTypeEnum.Copper]: 10 }, icon: Rocket },
  { id: 'cargo', name: 'Cargo Ship', description: 'Transports resources between colonies or stations.', cost: { [OreTypeEnum.Iron]: 80, [OreTypeEnum.Titanium]: 15 }, icon: Warehouse, requires: 'Trade Port' }, // Requires Trade Port
  { id: 'fighter', name: 'Fighter', description: 'Basic combat ship for defense and offense.', cost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 25, [OreTypeEnum.Titanium]: 10 }, icon: Rocket },
];

// --- Research Definitions ---
const availableResearch: ResearchItem[] = [
    { id: 'adv_engines', name: 'Advanced Engines', description: 'Increase ship speed and travel range.', baseCost: { [OreTypeEnum.Copper]: 50, [OreTypeEnum.Titanium]: 20 }, icon: FlaskConical, baseResearchTime: 30000, maxLevel: 3, costMultiplier: 1.8, timeMultiplier: 1.6 },
    { id: 'laser_tech', name: 'Laser Technology', description: 'Improve laser weapon damage and efficiency.', baseCost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Gold]: 15 }, icon: FlaskConical, baseResearchTime: 45000, maxLevel: 5, costMultiplier: 1.7, timeMultiplier: 1.5 },
    { id: 'nuclear_power', name: 'Nuclear Power', description: 'Unlocks Nuclear Reactors and Uranium Refineries.', baseCost: { [OreTypeEnum.Titanium]: 150, [OreTypeEnum.Uranium]: 30 }, icon: FlaskConical, unlocks: 'Nuclear Reactor, Uranium Refinery', baseResearchTime: 60000, maxLevel: 1 }, // Single level unlock
    { id: 'adv_shielding', name: 'Advanced Shielding', description: 'Improve ship and planetary shield strength.', baseCost: { [OreTypeEnum.Titanium]: 100, [OreTypeEnum.Gold]: 40 }, icon: FlaskConical, baseResearchTime: 50000, maxLevel: 3, costMultiplier: 1.9, timeMultiplier: 1.7 },
];

// --- Utility Functions ---

// Calculate cost for a specific level
const calculateCost = (baseCost: Partial<Record<OreType, number>>, level: number, multiplier: number = 1): Partial<Record<OreType, number>> => {
  const cost: Partial<Record<OreType, number>> = {};
  for (const ore in baseCost) {
    cost[ore as OreType] = Math.floor((baseCost[ore as OreType] ?? 0) * Math.pow(multiplier, level - 1));
  }
  return cost;
};

// Calculate construction time for a specific level
const calculateTime = (baseTime: number, level: number, multiplier: number = 1): number => {
  return Math.floor(baseTime * Math.pow(multiplier, level - 1));
};

// Calculate energy production/cost for a specific level
const calculateEnergy = (baseEnergy: number | undefined, level: number, multiplier: number = 1): number => {
    if (baseEnergy === undefined) return 0;
    // Apply a slightly different multiplier for energy if needed, or use a dedicated one. Defaulting to costMultiplier for now.
    const energyMultiplier = multiplier; // Or use building.energyMultiplier if defined differently
    return Math.floor(baseEnergy * Math.pow(energyMultiplier, level - 1));
};

// Calculate production rate for a specific level (e.g., for refineries)
const calculateProductionRate = (baseRate: number | undefined, level: number, multiplier: number = 1): number => {
    if (baseRate === undefined) return 0;
    // Using costMultiplier for rate increase, adjust if needed
    const rateMultiplier = multiplier;
    return parseFloat((baseRate * Math.pow(rateMultiplier, level - 1)).toFixed(2)); // Limit decimals
};


// Helper to format resource costs with icons
const formatCostWithIcons = (cost: Partial<Record<OreType, number>>): React.ReactNode => {
    // Sort ore types for consistent display order (optional but nice)
    const sortedOres = Object.keys(cost).sort() as OreType[];

    return sortedOres.map((ore) => {
        const amount = cost[ore];
        if (amount === undefined || amount <= 0) return null; // Don't display if cost is 0 or undefined
        return (
            <span key={ore} className="inline-flex items-center mr-2 whitespace-nowrap">
                {getOreIcon(ore as OreType)}
                <span className="ml-0.5">{amount}</span>
            </span>
        );
    }).filter(Boolean); // Remove null entries
};


// Helper to check if player has enough resources
const hasEnoughResources = (cost: Partial<Record<OreType, number>>, currentResources: Resources): boolean => {
    return Object.entries(cost).every(([ore, amount]) => {
        return (currentResources[ore as OreType] ?? 0) >= amount;
    });
};

// Helper to get ore icon
const getOreIcon = (oreType: OreType) => {
    const className = "w-3 h-3 inline-block";
    switch (oreType) {
        case OreTypeEnum.Iron: return <Mountain className={cn(className, "text-slate-500")} />;
        case OreTypeEnum.Copper: return <Diamond className={cn(className, "text-orange-500")} />;
        case OreTypeEnum.Gold: return <Diamond className={cn(className, "text-yellow-500")} />;
        case OreTypeEnum.Titanium: return <Mountain className={cn(className, "text-gray-400")} />;
        case OreTypeEnum.Uranium: return <Diamond className={cn(className, "text-green-500")} />;
        default: return null;
    }
};

// Helper to format elapsed time
const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


// --- Component State and Logic ---

const ControlPanel: React.FC = () => {
  const { toast } = useToast();
  const [gameTime, setGameTime] = useState(0); // Game time in seconds
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Placeholder state for resources
  const [resources, setResources] = useState<Resources>({
    [OreTypeEnum.Iron]: 1000,
    [OreTypeEnum.Copper]: 500,
    [OreTypeEnum.Gold]: 100,
    [OreTypeEnum.Titanium]: 1000, // Updated starting Titanium
    [OreTypeEnum.Uranium]: 10,
    Energy: { production: 0, consumption: 0, balance: 0 },
  });

  // State to track constructions in progress { buildingId: { startTime, duration, targetLevel } }
  const [constructing, setConstructing] = useState<Record<string, ConstructionProgress>>({});
  const [constructionProgress, setConstructionProgress] = useState<Record<string, number>>({});
  // State to track built buildings (IDs) - Initialize with Colony Hub Lvl 1
  const [builtBuildings, setBuiltBuildings] = useState<Set<string>>(new Set(['colony_hub']));
  // State to track building levels { buildingId: level }
  const [buildingLevels, setBuildingLevels] = useState<Record<string, number>>({ 'colony_hub': 1 }); // Start with Hub Lvl 1
   // State for completed research { researchId: level }
  const [completedResearch, setCompletedResearch] = useState<Record<string, number>>({}); // Track completed research levels

   // Group buildings by category
   const groupedBuildings = useMemo(() => {
       const groups: Record<BuildingCategory, Building[]> = {
           Core: [], Production: [], Power: [], Defense: [], Utility: [], Shipyard: []
       };
       availableBuildings.forEach(building => {
           if (groups[building.category]) {
               groups[building.category].push(building);
           } else {
               console.warn(`Building ${building.name} has unknown category: ${building.category}`);
               groups['Utility'].push(building); // Add to Utility if unknown
           }
       });
       return groups;
   }, []); // Static dependency

  // Recalculate energy balance based on current building levels
   const recalculateEnergyBalance = useCallback(() => {
       let production = 0;
       let consumption = 0;

       builtBuildings.forEach(id => {
           const buildingDef = availableBuildings.find(b => b.id === id);
           const level = buildingLevels[id] ?? 1;
           if (buildingDef) {
               // Check if the building is currently constructing - skip its energy cost/prod if so
               if (constructing[id]) return;

               // Use the dedicated energyMultiplier if available, otherwise fallback to costMultiplier or 1
               const energyMult = buildingDef.energyMultiplier ?? buildingDef.costMultiplier ?? 1;
               production += calculateEnergy(buildingDef.baseEnergyProduction, level, energyMult);
               consumption += calculateEnergy(buildingDef.baseEnergyCost, level, energyMult);
           }
       });

       setResources(prev => ({
           ...prev,
           Energy: { production, consumption, balance: production - consumption }
       }));
   }, [builtBuildings, buildingLevels, constructing]); // Add constructing as dependency

  // Effect to recalculate energy when buildings, levels, or construction status change
  useEffect(() => {
      recalculateEnergyBalance();
  }, [recalculateEnergyBalance]); // Use the memoized callback

  // Main Game Loop Timer (runs every second)
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime) / 1000; // Time difference in seconds

      setGameTime(prev => prev + deltaTime);
      setLastUpdateTime(now);

      // --- Resource Generation ---
      const energyBalance = resources.Energy?.balance ?? 0;
      const efficiency = energyBalance >= 0 ? 1 : Math.max(0, 1 + (energyBalance / (resources.Energy?.consumption ?? 1))); // Crude efficiency model

      const generatedResources: Partial<Resources> = {};
      builtBuildings.forEach(id => {
         const buildingDef = availableBuildings.find(b => b.id === id);
         const level = buildingLevels[id] ?? 1;
         // Only generate if it's a Production building, has a target ore, has a base rate, and is not constructing
         if (buildingDef?.category === 'Production' && buildingDef.oreTarget && buildingDef.baseProductionRate && !constructing[id]) {
            const productionRate = calculateProductionRate(buildingDef.baseProductionRate, level, buildingDef.costMultiplier ?? 1);
            const generatedAmount = productionRate * efficiency * deltaTime; // Apply efficiency and delta time
            const oreType = buildingDef.oreTarget;
            generatedResources[oreType] = (generatedResources[oreType] ?? 0) + generatedAmount;
         }
      });

      // Update resources state
      if (Object.keys(generatedResources).length > 0) {
         setResources(prev => {
             const newResources = { ...prev };
             for (const ore in generatedResources) {
                 newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) + generatedResources[ore as OreType]!;
             }
             return newResources;
         });
      }

      // --- Construction Progress Update ---
       const nowForProgress = Date.now(); // Use consistent time for progress check
       const newProgress: Record<string, number> = {};
       let changed = false;
       for (const buildingId in constructing) {
         const progressData = constructing[buildingId];
         if (progressData) {
           const elapsed = nowForProgress - progressData.startTime;
           const progress = Math.min(100, (elapsed / progressData.duration) * 100);
           if (constructionProgress[buildingId] !== progress) {
             newProgress[buildingId] = progress;
             changed = true;
           } else {
             newProgress[buildingId] = constructionProgress[buildingId]; // Keep existing progress if no change
           }
         }
       }
       // Only update state if any progress actually changed
       if (changed) {
          setConstructionProgress(prev => ({ ...prev, ...newProgress })); // Merge updates
       }


    }, 1000); // Run every 1000ms (1 second)

    return () => clearInterval(gameLoop); // Cleanup on unmount
  }, [lastUpdateTime, resources.Energy, builtBuildings, buildingLevels, constructing, constructionProgress]); // Include dependencies


  // Hook to force re-render (use sparingly)
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Helper to check if building requirements are met (also used for ships)
   const areRequirementsMet = useCallback((requires?: string | string[]): boolean => {
    if (!requires) return true;
    const requirements = Array.isArray(requires) ? requires : [requires];
    return requirements.every(req => {
        if (req.startsWith('Research:')) {
            const researchName = req.substring(9).trim();
            const researchDef = availableResearch.find(r => r.name === researchName);
            return researchDef ? (completedResearch[researchDef.id] ?? 0) >= 1 : false; // Check if research level >= 1
        } else {
            const requiredBuilding = availableBuildings.find(b => b.name === req);
            return requiredBuilding ? builtBuildings.has(requiredBuilding.id) : false;
        }
    });
   }, [builtBuildings, completedResearch]);

  // --- Build/Upgrade Logic ---
  const handleBuildOrUpgrade = (building: Building) => {
    const currentLevel = buildingLevels[building.id] ?? 0;
    const targetLevel = currentLevel + 1;
    const isBuilding = currentLevel === 0; // True if we are building level 1
    const maxLevel = building.maxLevel ?? 1; // Default max level is 1 if not specified

    if (targetLevel > maxLevel) {
        toast({ title: "Max Level Reached", description: `${building.name} is already at its maximum level (${maxLevel}).` });
        return;
    }

     if (constructing[building.id]) {
        const existingConstruction = constructing[building.id];
        toast({
            title: "Already In Progress",
            description: `${building.name} is currently being ${existingConstruction.targetLevel === 1 ? 'constructed' : 'upgraded'} to Level ${existingConstruction.targetLevel}.`,
            variant: "default" // Use default variant
        });
        return;
    }


    if (!areRequirementsMet(building.requires)) {
        toast({ title: "Requirements Not Met", description: `Cannot build or upgrade ${building.name}. Check requirements.`, variant: "destructive" });
        return;
    }

    // Calculate cost and time for the TARGET level
    const costForNextLevel = calculateCost(building.baseCost, targetLevel, building.costMultiplier);
    const timeForNextLevel = calculateTime(building.baseConstructionTime, targetLevel, building.timeMultiplier);

    if (!hasEnoughResources(costForNextLevel, resources)) {
      toast({
        title: "Insufficient Resources",
        description: `Not enough resources to ${isBuilding ? 'build' : 'upgrade'} ${building.name} to Level ${targetLevel}.`,
        variant: "destructive",
      });
      return;
    }

    // Deduct resources immediately
    setResources(prev => {
      const newResources = { ...prev };
      Object.entries(costForNextLevel).forEach(([ore, amount]) => {
        newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
      });
      return newResources;
    });

    // Start construction/upgrade tracking
    const startTime = Date.now();
    const constructionData: ConstructionProgress = { startTime, duration: timeForNextLevel, targetLevel };
    setConstructing(prev => ({ ...prev, [building.id]: constructionData }));
    setConstructionProgress(prev => ({ ...prev, [building.id]: 0 })); // Initialize progress

    toast({
      title: `${isBuilding ? 'Construction' : 'Upgrade'} Started`,
      description: `${isBuilding ? 'Building' : 'Upgrading'} ${building.name} to Level ${targetLevel}...`,
    });

    // --- Construction Timer ---
    setTimeout(() => {
       // Add building to built set if it was the first build
        if (isBuilding) {
            setBuiltBuildings(prev => new Set(prev).add(building.id));
        }
        // Update building level
        setBuildingLevels(prev => ({ ...prev, [building.id]: targetLevel }));

       // Remove from constructing state and progress AFTER level update
       // Energy balance recalculation will happen automatically via useEffect
       setConstructing(prev => {
           const newState = { ...prev };
           delete newState[building.id];
           return newState;
       });
        setConstructionProgress(prev => {
           const newState = { ...prev };
           delete newState[building.id];
           return newState;
       });

      toast({
        title: `${isBuilding ? 'Construction' : 'Upgrade'} Complete`,
        description: `${building.name} reached Level ${targetLevel}.`,
        variant: "default",
      });

      forceUpdate(); // Force re-render to ensure UI updates correctly

    }, timeForNextLevel); // Use calculated time for the target level
  };

  // --- Ship Building Logic ---
  const handleBuildShip = (ship: ShipType) => {
    // Check common ship requirement first: Ship Facility
    if (!builtBuildings.has('ship_facility')) {
      toast({ title: "Ship Facility Required", description: `Cannot build ${ship.name}. Build a Ship Facility first.`, variant: "destructive" });
      return;
    }

    if (!hasEnoughResources(ship.cost, resources)) {
        toast({ title: "Insufficient Resources", description: `Cannot build ${ship.name}.`, variant: "destructive" });
        return;
    }
    // Check specific ship requirements (e.g., Trade Port for Cargo Ship)
    if (!areRequirementsMet(ship.requires)) {
         toast({ title: "Requirements Not Met", description: `Cannot build ${ship.name}. Check requirements.`, variant: "destructive" });
         return;
    }

    setResources(prev => {
        const newResources = { ...prev };
        Object.entries(ship.cost).forEach(([ore, amount]) => {
            newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
        });
        console.log(`Building ${ship.name}... (State updated)`);
         toast({ title: "Ship Construction Started", description: `Building ${ship.name}...` });
        // TODO: Add to shipyard queue, implement build time based on Ship Facility level
        return newResources;
    });

  };

   // --- Research Logic ---
   const handleResearch = (research: ResearchItem) => {
     if (!builtBuildings.has('research_lab')) {
         toast({ title: "Research Lab Required", description: `Cannot research ${research.name}. Build a Research Lab first.`, variant: "destructive" });
         return;
     }

     const currentLevel = completedResearch[research.id] ?? 0;
     const targetLevel = currentLevel + 1;
     const maxLevel = research.maxLevel ?? 1;

     if (targetLevel > maxLevel) {
         toast({ title: "Max Research Level Reached", description: `${research.name} is already at its maximum level (${maxLevel}).` });
         return;
     }

     // TODO: Add research queue state check
     // if (researchQueue.isFull || researchQueue.isResearching(research.id)) { ... }

     const costForNextLevel = calculateCost(research.baseCost, targetLevel, research.costMultiplier);
     const timeForNextLevel = calculateTime(research.baseResearchTime, targetLevel, research.timeMultiplier);
     // TODO: Factor in Research Lab level bonus for time reduction

     if (!hasEnoughResources(costForNextLevel, resources)) {
         toast({ title: "Insufficient Resources", description: `Cannot research ${research.name} Level ${targetLevel}.`, variant: "destructive" });
         return;
     }

     // Deduct resources
     setResources(prev => {
         const newResources = { ...prev };
         Object.entries(costForNextLevel).forEach(([ore, amount]) => {
             newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
         });
         return newResources;
     });

     toast({ title: "Research Started", description: `Researching ${research.name} Level ${targetLevel}...` });
     console.log(`Researching ${research.name} Level ${targetLevel}... Time: ${timeForNextLevel / 1000}s`);

     // TODO: Add to actual research queue with timer
     // researchQueue.add({ researchId: research.id, targetLevel, duration: timeForNextLevel });

     // Placeholder for immediate completion for testing
     setTimeout(() => {
         setCompletedResearch(prev => ({ ...prev, [research.id]: targetLevel }));
         toast({ title: "Research Complete", description: `${research.name} reached Level ${targetLevel}.` });
         forceUpdate(); // Force UI update
          console.log("Research complete:", research.name, "Level", targetLevel);
     }, timeForNextLevel); // Use calculated time
   };


  return (
      <>
      <SidebarHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Commander Panel</h2>
         <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarSeparator />
       <SidebarContent>
        {/* Resource Display */}
        <SidebarGroup>
           <SidebarGroupLabel>Resources</SidebarGroupLabel>
           <SidebarGroupContent className="space-y-1 px-2 text-sm">
                 {Object.values(OreTypeEnum).map(ore => (
                      <div className="flex justify-between items-center" key={ore}>
                         <span>{getOreIcon(ore)}{ore}:</span>
                         <span>{Math.floor(resources[ore] ?? 0).toLocaleString()}</span> {/* Format number */}
                      </div>
                 ))}
                 {resources.Energy && (
                    <div className="flex justify-between items-center pt-1 border-t border-border/50 mt-1">
                        <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-yellow-400" />Energy:</span>
                        <span className={cn(resources.Energy.balance >= 0 ? 'text-[hsl(var(--chart-1))]' : 'text-destructive')}>
                           {resources.Energy.balance >= 0 ? `+${resources.Energy.balance}` : resources.Energy.balance} <span className="text-xs text-muted-foreground">({resources.Energy.production}/{resources.Energy.consumption})</span>
                        </span>
                     </div>
                 )}
           </SidebarGroupContent>
        </SidebarGroup>
         <SidebarSeparator />

         <TooltipProvider delayDuration={100}>
            <Tabs defaultValue="buildings" className="flex-1 flex flex-col h-full">
            <SidebarGroup className="p-0">
                <TabsList className="grid w-full grid-cols-4 h-auto rounded-none bg-transparent p-2 gap-1">
                    <TabsTrigger value="buildings" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-xs p-1.5 h-auto">Buildings</TabsTrigger>
                    <TabsTrigger value="shipyard" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-xs p-1.5 h-auto">Shipyard</TabsTrigger>
                    <TabsTrigger value="research" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-xs p-1.5 h-auto">Research</TabsTrigger>
                    <TabsTrigger value="colony" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-xs p-1.5 h-auto">Colony</TabsTrigger>
                </TabsList>
            </SidebarGroup>

            <ScrollArea className="flex-1 px-2 pb-2">
                {/* Buildings Tab */}
                <TabsContent value="buildings" className="mt-0 space-y-4">
                  {buildingCategories.map(category => (
                    groupedBuildings[category]?.length > 0 && (
                      <SidebarGroup key={category} className="space-y-1">
                        <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground px-0">{category}</SidebarGroupLabel>
                        <SidebarGroupContent className="p-0">
                          <SidebarMenu className="p-0 gap-1">
                              {groupedBuildings[category].map((buildingDef) => {
                                  const currentLevel = buildingLevels[buildingDef.id] ?? 0;
                                  const isBuilt = currentLevel > 0;
                                  const isConstructing = !!constructing[buildingDef.id];
                                  const constructionData = constructing[buildingDef.id];
                                  const progress = constructionProgress[buildingDef.id] ?? 0;
                                  const targetLevel = constructionData?.targetLevel ?? currentLevel + 1;
                                  const maxLevel = buildingDef.maxLevel ?? 1;
                                  const isMaxLevel = currentLevel >= maxLevel;

                                  const requirementsMet = areRequirementsMet(buildingDef.requires);
                                  const costForNextLevel = calculateCost(buildingDef.baseCost, targetLevel, buildingDef.costMultiplier);
                                  const timeForNextLevel = calculateTime(buildingDef.baseConstructionTime, targetLevel, buildingDef.timeMultiplier);
                                  const energyCostNextLevel = calculateEnergy(buildingDef.baseEnergyCost, targetLevel, buildingDef.energyMultiplier ?? buildingDef.costMultiplier);
                                  const energyProdNextLevel = calculateEnergy(buildingDef.baseEnergyProduction, targetLevel, buildingDef.energyMultiplier ?? buildingDef.costMultiplier);
                                  const prodRateNextLevel = calculateProductionRate(buildingDef.baseProductionRate, targetLevel, buildingDef.costMultiplier ?? 1); // Use costMultiplier for prod rate increase

                                  const hasResourcesForNext = hasEnoughResources(costForNextLevel, resources);

                                  // Disable logic:
                                  // - If constructing this building
                                  // - If max level reached
                                  // - If requirements not met (for initial build or upgrade)
                                  // - If not enough resources for the next level
                                  // Allow interaction if constructing (to view tooltip)
                                  const isDisabledForAction = isConstructing || isMaxLevel || !requirementsMet || !hasResourcesForNext;

                                  const buttonText = isConstructing
                                      ? `Building Lvl ${constructionData.targetLevel}`
                                      : isBuilt
                                          ? (isMaxLevel ? "Max Level" : `Upgrade (Lvl ${targetLevel})`)
                                          : "Build (Lvl 1)";

                                  const currentEnergyCost = calculateEnergy(buildingDef.baseEnergyCost, currentLevel, buildingDef.energyMultiplier ?? buildingDef.costMultiplier);
                                  const currentEnergyProd = calculateEnergy(buildingDef.baseEnergyProduction, currentLevel, buildingDef.energyMultiplier ?? buildingDef.costMultiplier);
                                  const currentProdRate = calculateProductionRate(buildingDef.baseProductionRate, currentLevel, buildingDef.costMultiplier ?? 1);

                                  return (
                                      <SidebarMenuItem key={buildingDef.id} className="p-0">
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Card className={cn(
                                                        "w-full bg-card/50 hover:bg-card/70 transition-colors relative overflow-hidden",
                                                        isBuilt && !isConstructing && "border-primary/50 bg-primary/10",
                                                        isConstructing && "border-accent/50 bg-accent/10 animate-pulse" // Visual cue for construction
                                                     )}>
                                                      {/* Progress Bar Overlay */}
                                                      {isConstructing && (
                                                          <Progress
                                                              value={progress}
                                                              className="absolute top-0 left-0 w-full h-full rounded-none opacity-30 bg-transparent [&>div]:bg-accent" // Use accent for progress
                                                              aria-label={`Construction progress: ${Math.round(progress)}%`}
                                                          />
                                                      )}
                                                      <CardContent className="p-2 flex items-center justify-between gap-2 relative z-10">
                                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                                              <buildingDef.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                                              <div className="flex-1 min-w-0">
                                                                  <p className="text-sm font-medium truncate">{buildingDef.name} {currentLevel > 0 ? `(Lvl ${currentLevel})` : ''}</p>
                                                                  <div className="text-xs text-muted-foreground truncate flex items-center flex-wrap">
                                                                     {/* Show cost for NEXT level */}
                                                                      {!isMaxLevel && <span className="mr-1">Cost:</span>}
                                                                      {!isMaxLevel && formatCostWithIcons(costForNextLevel)}
                                                                       {isMaxLevel && <span className="text-xs text-primary">Max Level</span>}
                                                                  </div>
                                                                  {/* Show current energy impact */}
                                                                   {currentEnergyCost > 0 || currentEnergyProd > 0 ? (
                                                                      <p className="text-xs text-muted-foreground truncate">
                                                                          Energy: {currentEnergyProd > 0 ? <span className="text-[hsl(var(--chart-1))]">{`+${currentEnergyProd}`}</span> : (currentEnergyCost > 0 ? <span className="text-destructive">{`-${currentEnergyCost}`}</span> : '0')}
                                                                      </p>
                                                                  ) : null}
                                                                   {/* Show current production rate */}
                                                                   {currentProdRate > 0 && !isConstructing && (
                                                                       <p className="text-xs text-muted-foreground truncate">
                                                                           {buildingDef.oreTarget} Prod: +{currentProdRate}/s
                                                                       </p>
                                                                   )}
                                                                  {isConstructing && (
                                                                      <p className="text-xs text-accent">Building Lvl {constructionData.targetLevel} ({Math.round(progress)}%)...</p>
                                                                  )}
                                                              </div>
                                                          </div>
                                                          <Button
                                                              size="sm"
                                                              onClick={() => handleBuildOrUpgrade(buildingDef)}
                                                              disabled={isDisabledForAction} // Use disable logic for action
                                                              className={cn(isDisabledForAction && "opacity-50 cursor-not-allowed")}
                                                              variant={isConstructing ? "outline" : "default"} // Use outline variant when constructing
                                                          >
                                                              {buttonText}
                                                          </Button>
                                                      </CardContent>
                                                  </Card>
                                              </TooltipTrigger>
                                              <TooltipContent side="right" align="start" className="max-w-xs text-xs">
                                                  <p className="font-semibold text-sm">{buildingDef.name} {currentLevel > 0 ? `(Lvl ${currentLevel})` : '(Not Built)'}</p>
                                                  <p className="text-muted-foreground mb-2">{buildingDef.description}</p>
                                                  <div className="space-y-1">
                                                        {/* Current Stats if built */}
                                                        {isBuilt && !isConstructing && (
                                                            <>
                                                                <p className="font-medium">Current Level ({currentLevel}):</p>
                                                                {currentEnergyCost > 0 && <p>Energy Cost: {currentEnergyCost}</p>}
                                                                {currentEnergyProd > 0 && <p>Energy Prod: {currentEnergyProd}</p>}
                                                                {currentProdRate > 0 && <p>{buildingDef.oreTarget} Prod Rate: {currentProdRate}/s</p>}
                                                                {/* Add other current level stats here */}
                                                            </>
                                                        )}
                                                      {/* Show stats for NEXT level if not max */}
                                                      {!isMaxLevel && (
                                                          <>
                                                              <p className="font-medium mt-1">Next Level ({targetLevel}):</p>
                                                              <p>Cost: {formatCostWithIcons(costForNextLevel)}</p>
                                                              <p>Build Time: {timeForNextLevel / 1000}s</p>
                                                              {energyCostNextLevel > 0 && <p>Energy Cost: {energyCostNextLevel}</p>}
                                                              {energyProdNextLevel > 0 && <p>Energy Prod: {energyProdNextLevel}</p>}
                                                              {prodRateNextLevel > 0 && <p>{buildingDef.oreTarget} Prod Rate: {prodRateNextLevel}/s</p>}
                                                          </>
                                                      )}
                                                       {isMaxLevel && <p className="text-primary font-medium mt-1">Maximum Level Reached</p>}
                                                      {buildingDef.requires && <p className={cn("text-amber-400 mt-1", !areRequirementsMet(buildingDef.requires) && "text-destructive/80")}>Requires: {Array.isArray(buildingDef.requires) ? buildingDef.requires.join(', ') : buildingDef.requires}</p>}
                                                  </div>
                                                  {isConstructing && (
                                                      <div className="mt-2">
                                                          <p className="text-xs text-accent">Construction in progress...</p>
                                                          <Progress value={progress} className="h-1 mt-1 bg-secondary [&>div]:bg-accent" />
                                                          {/* Optionally show remaining time */}
                                                      </div>
                                                  )}
                                                  {!isConstructing && !isMaxLevel && !hasResourcesForNext && (
                                                    <p className="text-xs text-destructive mt-2">Insufficient resources for Level {targetLevel}.</p>
                                                  )}
                                                   {!isConstructing && !requirementsMet && currentLevel === 0 && ( // Only show requirement error if not built yet
                                                     <p className="text-xs text-destructive mt-2">Requirements not met.</p>
                                                  )}
                                              </TooltipContent>
                                          </Tooltip>
                                      </SidebarMenuItem>
                                  );
                              })}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    )
                  ))}
                </TabsContent>


                {/* Shipyard Tab */}
                <TabsContent value="shipyard" className="mt-0">
                 <SidebarMenu>
                    {!builtBuildings.has('ship_facility') && (
                         <Card className="w-full bg-card/50 border-dashed border-amber-500">
                            <CardContent className="p-3 text-center text-sm text-muted-foreground">
                                Build a <span className="font-semibold text-foreground">Ship Facility</span> to construct ships.
                            </CardContent>
                        </Card>
                    )}
                    {availableShips.map((ship) => {
                         const specificRequirementsMet = areRequirementsMet(ship.requires); // Check specific reqs like Trade Port
                         const hasShipFacility = builtBuildings.has('ship_facility');
                         const enoughResources = hasEnoughResources(ship.cost, resources);
                         // Disable if Ship Facility isn't built OR specific reqs not met OR not enough resources
                         const isDisabled = !hasShipFacility || !specificRequirementsMet || !enoughResources;
                         const requirementsText = ['Ship Facility', ...(Array.isArray(ship.requires) ? ship.requires : (ship.requires ? [ship.requires] : []))].join(', ');


                         return (
                            <SidebarMenuItem key={ship.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Card className="w-full bg-card/50 hover:bg-card/70 transition-colors">
                                            <CardContent className="p-2 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <ship.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{ship.name}</p>
                                                        <div className="text-xs text-muted-foreground truncate flex items-center flex-wrap">
                                                            <span className="mr-1">Cost:</span> {formatCostWithIcons(ship.cost)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleBuildShip(ship)} disabled={isDisabled}>
                                                    Build
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" className="max-w-xs text-xs">
                                        <p className="font-semibold text-sm">{ship.name}</p>
                                        <p className="text-muted-foreground mb-2">{ship.description}</p>
                                        <div className="space-y-1">
                                            <p>Cost: {formatCostWithIcons(ship.cost)}</p>
                                            {/* TODO: Add build time for ships */}
                                             <p className={cn("text-amber-400", (!hasShipFacility || !specificRequirementsMet) && "text-destructive/80")}>Requires: {requirementsText}</p>
                                        </div>
                                        {!enoughResources && (
                                            <p className="text-xs text-destructive mt-2">Insufficient resources.</p>
                                        )}
                                        {!hasShipFacility && (
                                            <p className="text-xs text-destructive mt-2">Requires Ship Facility.</p>
                                        )}
                                         {!specificRequirementsMet && hasShipFacility && ship.requires && ( // Show specific unmet reqs only if facility exists
                                             <p className="text-xs text-destructive mt-2">Requires: {Array.isArray(ship.requires) ? ship.requires.join(', ') : ship.requires}.</p>
                                         )}
                                    </TooltipContent>
                                </Tooltip>
                            </SidebarMenuItem>
                         )
                    })}
                </SidebarMenu>
                </TabsContent>

                {/* Research Tab */}
                <TabsContent value="research" className="mt-0">
                  <SidebarMenu>
                    {!builtBuildings.has('research_lab') && (
                         <Card className="w-full bg-card/50 border-dashed border-sky-500">
                            <CardContent className="p-3 text-center text-sm text-muted-foreground">
                                Build a <span className="font-semibold text-foreground">Research Lab</span> to start research.
                            </CardContent>
                        </Card>
                    )}
                    {availableResearch.map((item) => {
                        const currentLevel = completedResearch[item.id] ?? 0;
                        const targetLevel = currentLevel + 1;
                        const maxLevel = item.maxLevel ?? 1;
                        const isMaxLevel = currentLevel >= maxLevel;
                        const hasLab = builtBuildings.has('research_lab');
                        // TODO: Add research queue check
                        const isResearching = false; // Placeholder

                        const costForNextLevel = calculateCost(item.baseCost, targetLevel, item.costMultiplier);
                        const timeForNextLevel = calculateTime(item.baseResearchTime, targetLevel, item.timeMultiplier);
                         // TODO: Factor in lab level bonus
                        const enoughResources = hasEnoughResources(costForNextLevel, resources);

                        const isDisabled = !hasLab || isResearching || isMaxLevel || !enoughResources;

                        const buttonText = isResearching
                                        ? `Researching Lvl ${targetLevel}`
                                        : isMaxLevel
                                            ? "Max Level"
                                            : `Research (Lvl ${targetLevel})`;

                        return (
                            <SidebarMenuItem key={item.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Card className={cn(
                                                "w-full hover:bg-card/70 transition-colors",
                                                currentLevel > 0 && !isMaxLevel && "bg-[hsl(var(--chart-1))]/20 border-[hsl(var(--chart-1))]/50", // Partially researched style
                                                isMaxLevel && "bg-[hsl(var(--chart-1))]/40 border-[hsl(var(--chart-1))]", // Max level style
                                                !isMaxLevel && currentLevel === 0 && "bg-card/50", // Not started style
                                                isResearching && "border-primary/50 bg-primary/10" // Researching style (similar to building)
                                            )}>
                                            <CardContent className="p-2 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name} {currentLevel > 0 ? `(Lvl ${currentLevel})` : ''}</p>
                                                        <div className="text-xs text-muted-foreground truncate flex items-center flex-wrap">
                                                            {!isMaxLevel && <span className="mr-1">Cost:</span>}
                                                            {!isMaxLevel && formatCostWithIcons(costForNextLevel)}
                                                             {isMaxLevel && <span className="text-xs text-primary">Max Level</span>}
                                                        </div>
                                                        {isResearching && (
                                                            <p className="text-xs text-primary animate-pulse">Researching Lvl {targetLevel}...</p> // Show progress later
                                                        )}
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleResearch(item)} disabled={isDisabled}>
                                                    {buttonText}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" className="max-w-xs text-xs">
                                        <p className="font-semibold text-sm">{item.name} {currentLevel > 0 ? `(Lvl ${currentLevel})` : '(Not Researched)'}</p>
                                        <p className="text-muted-foreground mb-2">{item.description}</p>
                                        <div className="space-y-1">
                                             {/* Current Level Stats */}
                                             {currentLevel > 0 && (
                                                <>
                                                    <p className="font-medium">Current Level ({currentLevel}):</p>
                                                    {/* Add current level effects description here */}
                                                    {/* e.g., <p>Effect: +{currentLevel * 5}% speed</p> */}
                                                </>
                                             )}
                                            {!isMaxLevel && (
                                                <>
                                                   <p className="font-medium mt-1">Next Level ({targetLevel}):</p>
                                                   <p>Cost: {formatCostWithIcons(costForNextLevel)}</p>
                                                   <p>Research Time: {timeForNextLevel / 1000}s</p>
                                                   {/* Add next level effects description here */}
                                                </>
                                            )}
                                             {isMaxLevel && <p className="text-primary font-medium mt-1">Maximum Level Reached</p>}
                                            {item.unlocks && <p className="text-sky-400 mt-1">Unlocks: {item.unlocks}</p>}
                                        </div>
                                        {!hasLab && <p className="text-xs text-destructive mt-2">Requires Research Lab.</p>}
                                         {isResearching && <p className="text-xs text-primary mt-2">Research in progress...</p>}
                                        {hasLab && !enoughResources && !isMaxLevel && !isResearching && (
                                            <p className="text-xs text-destructive mt-2">Insufficient resources for Level {targetLevel}.</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
                </TabsContent>

                {/* Colony Stats Tab */}
                <TabsContent value="colony" className="mt-0">
                <Card className="bg-card/50">
                    <CardHeader>
                    <CardTitle className="text-base">Colony Status</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                    <p>Population: 100 / 150 (Placeholder)</p>
                    <p>Happiness: 85% (Placeholder)</p>
                     <h5 className="font-semibold pt-2 border-t border-border/50 mt-2">Ore Production</h5>
                      <ul className="list-disc list-inside text-xs">
                         {Object.values(OreTypeEnum).map(ore => {
                              let totalRate = 0;
                              builtBuildings.forEach(id => {
                                  const buildingDef = availableBuildings.find(b => b.id === id);
                                  const level = buildingLevels[id] ?? 1;
                                  if (buildingDef?.category === 'Production' && buildingDef.oreTarget === ore && buildingDef.baseProductionRate && !constructing[id]) {
                                      totalRate += calculateProductionRate(buildingDef.baseProductionRate, level, buildingDef.costMultiplier ?? 1);
                                  }
                              });
                              const energyBalance = resources.Energy?.balance ?? 0;
                              const efficiency = energyBalance >= 0 ? 1 : Math.max(0, 1 + (energyBalance / (resources.Energy?.consumption ?? 1)));
                              const effectiveRate = (totalRate * efficiency).toFixed(2);

                              if (totalRate > 0) {
                                return <li key={ore}>{getOreIcon(ore)}{ore}: +{effectiveRate}/s {efficiency < 1 && <span className="text-destructive">({Math.round(efficiency*100)}% eff.)</span>}</li>;
                              }
                              return null;
                         }).filter(Boolean)}
                         {Object.values(OreTypeEnum).every(ore => { /* Check if any production building exists */
                             return ![...builtBuildings].some(id => availableBuildings.find(b => b.id === id)?.oreTarget === ore);
                         }) && <li className="italic text-muted-foreground">Build refineries to produce ore.</li>}
                      </ul>

                     <h5 className="font-semibold pt-2 border-t border-border/50 mt-2">Built Structures</h5>
                     <ul className="list-disc list-inside text-xs">
                          {[...builtBuildings].sort().map(id => { // Sort alphabetically
                              const building = availableBuildings.find(b => b.id === id);
                              const level = buildingLevels[id]; // Get level from state
                              const isConstructing = constructing[id];
                              const progress = constructionProgress[id] ?? 0;
                              return building ? (
                                  <li key={id}>
                                      {building.name} {level ? `(Lvl ${level})` : ''}
                                      {isConstructing && <span className="text-accent ml-1"> (Upgrading Lvl {constructing[id].targetLevel} - {Math.round(progress)}%)</span>}
                                  </li>
                              ) : null;
                          })}
                     </ul>
                     <h5 className="font-semibold pt-2 border-t border-border/50 mt-2">Completed Research</h5>
                        <ul className="list-disc list-inside text-xs">
                            {Object.entries(completedResearch).sort(([idA], [idB]) => { // Sort research alphabetically by ID
                                const nameA = availableResearch.find(r => r.id === idA)?.name ?? idA;
                                const nameB = availableResearch.find(r => r.id === idB)?.name ?? idB;
                                return nameA.localeCompare(nameB);
                            }).map(([id, level]) => {
                                const research = availableResearch.find(r => r.id === id);
                                return research ? <li key={id}>{research.name} (Lvl {level})</li> : null;
                            })}
                            {Object.keys(completedResearch).length === 0 && <li className="italic text-muted-foreground">None</li>}
                        </ul>
                    </CardContent>
                </Card>
                </TabsContent>
            </ScrollArea>
            </Tabs>
         </TooltipProvider>
       </SidebarContent>
       <SidebarSeparator />
       <SidebarFooter>
             {/* Display formatted game time */}
             <div className="text-xs text-muted-foreground px-2">Game Time: {formatTime(gameTime)}</div>
       </SidebarFooter>
       </>
  );
};

export default ControlPanel;
