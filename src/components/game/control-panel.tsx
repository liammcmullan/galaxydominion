
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Rocket, FlaskConical, Users, Sun, Atom, ShieldCheck, Target, Warehouse, Banknote, Library, HeartPulse, Ship, Factory, Mountain, Diamond } from 'lucide-react'; // Added Mountain, Diamond
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { cn } from '@/lib/utils';
import type { Building, ShipType, ResearchItem, Resources, OreType } from '@/types/game-types'; // Import types
import { OreType as OreTypeEnum } from '@/types/game-types'; // Import enum

// Example Data (replace with actual game state/definitions)
const availableBuildings: Building[] = [
  { id: 'colony_hub', name: 'Colony Hub', description: 'Central structure. Upgrading allows more buildings.', cost: { [OreTypeEnum.Iron]: 100 }, icon: Factory, level: 1 },
  { id: 'ore_refinery', name: 'Ore Refinery', description: 'Extracts ore from the planet.', cost: { [OreTypeEnum.Iron]: 50, [OreTypeEnum.Copper]: 25 }, icon: Package, energyCost: 5 },
  { id: 'trade_port', name: 'Trade Port', description: 'Allows trade of ore for resources.', cost: { [OreTypeEnum.Iron]: 75, [OreTypeEnum.Gold]: 10 }, icon: Banknote },
  { id: 'research_lab', name: 'Research Lab', description: 'Unlocks tech trees and advanced upgrades.', cost: { [OreTypeEnum.Iron]: 150, [OreTypeEnum.Copper]: 50 }, icon: Library, energyCost: 10 },
  { id: 'medical_lab', name: 'Medical Lab', description: 'Improves worker efficiency and reduces downtime.', cost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 30 }, icon: HeartPulse, energyCost: 8 },
  { id: 'colony_expansion', name: 'Colony Expansion', description: 'Increases population cap and worker allocation.', cost: { [OreTypeEnum.Iron]: 200, [OreTypeEnum.Titanium]: 20 }, icon: Users },
  { id: 'ship_facility', name: 'Ship Facility', description: 'Builds and upgrades ships.', cost: { [OreTypeEnum.Iron]: 250, [OreTypeEnum.Titanium]: 50 }, icon: Ship, energyCost: 15 },
  { id: 'solar_plant', name: 'Solar Plant', description: 'Low output, cheap, low maintenance.', cost: { [OreTypeEnum.Iron]: 80, [OreTypeEnum.Copper]: 20 }, icon: Sun, energyProduction: 20 },
  { id: 'nuclear_reactor', name: 'Nuclear Reactor', description: 'High output, expensive, potential risks.', cost: { [OreTypeEnum.Iron]: 400, [OreTypeEnum.Titanium]: 100, [OreTypeEnum.Uranium]: 10 }, icon: Atom, requires: 'Research: Nuclear Power', energyProduction: 100 },
  { id: 'laser_turret', name: 'Laser Turret', description: 'Basic planetary defense.', cost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 40 }, icon: Target, energyCost: 20 },
   { id: 'missile_battery', name: 'Missile Battery', description: 'Long-range planetary defense.', cost: { [OreTypeEnum.Iron]: 180, [OreTypeEnum.Titanium]: 30 }, icon: Target, energyCost: 25 },
   { id: 'shield_generator', name: 'Shield Generator', description: 'Protects the colony from orbital bombardment.', cost: { [OreTypeEnum.Iron]: 300, [OreTypeEnum.Gold]: 50, [OreTypeEnum.Titanium]: 75 }, icon: ShieldCheck, energyCost: 50 },
];

const availableShips: ShipType[] = [
  { id: 'scout', name: 'Scout', description: 'Fast exploration vessel, reveals nearby sectors.', cost: { [OreTypeEnum.Iron]: 30, [OreTypeEnum.Copper]: 10 }, icon: Rocket, requires: 'Ship Facility' },
  { id: 'cargo', name: 'Cargo Ship', description: 'Transports resources between colonies or stations.', cost: { [OreTypeEnum.Iron]: 80, [OreTypeEnum.Titanium]: 15 }, icon: Warehouse, requires: 'Ship Facility' },
  { id: 'fighter', name: 'Fighter', description: 'Basic combat ship for defense and offense.', cost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Copper]: 25, [OreTypeEnum.Titanium]: 10 }, icon: Rocket, requires: 'Ship Facility' },
];

const availableResearch: ResearchItem[] = [
    { id: 'adv_engines', name: 'Advanced Engines', description: 'Increase ship speed and travel range.', cost: { [OreTypeEnum.Copper]: 50, [OreTypeEnum.Titanium]: 20 }, icon: FlaskConical },
    { id: 'laser_tech', name: 'Laser Technology', description: 'Improve laser weapon damage and efficiency.', cost: { [OreTypeEnum.Iron]: 100, [OreTypeEnum.Gold]: 15 }, icon: FlaskConical },
    { id: 'nuclear_power', name: 'Nuclear Power', description: 'Unlocks Nuclear Reactors for high energy output.', cost: { [OreTypeEnum.Titanium]: 150, [OreTypeEnum.Uranium]: 30 }, icon: FlaskConical, unlocks: 'Nuclear Reactor' },
    { id: 'adv_shielding', name: 'Advanced Shielding', description: 'Improve ship and planetary shield strength.', cost: { [OreTypeEnum.Titanium]: 100, [OreTypeEnum.Gold]: 40 }, icon: FlaskConical },
];

// Helper to format resource costs with icons
const formatCostWithIcons = (cost: Partial<Record<OreType, number>>): React.ReactNode => {
    return Object.entries(cost).map(([ore, amount], index, arr) => (
        <span key={ore} className="inline-flex items-center mr-2 whitespace-nowrap">
            {getOreIcon(ore as OreType)}
            <span className="ml-0.5">{amount}</span>
            {/* {index < arr.length - 1 && ', '} */}
        </span>
    ));
};

// Helper to check if player has enough resources
const hasEnoughResources = (cost: Partial<Record<OreType, number>>, currentResources: Resources): boolean => {
    return Object.entries(cost).every(([ore, amount]) => {
        return (currentResources[ore as OreType] ?? 0) >= amount;
    });
};

// Helper to get ore icon (adjust styling as needed)
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


const ControlPanel: React.FC = () => {
  // Placeholder state for resources (replace with actual game state context)
  const [resources, setResources] = React.useState<Resources>({
    [OreTypeEnum.Iron]: 1000,
    [OreTypeEnum.Copper]: 500,
    [OreTypeEnum.Gold]: 50,
    [OreTypeEnum.Titanium]: 20,
    [OreTypeEnum.Uranium]: 0,
    Energy: { production: 20, consumption: 0, balance: 20 }, // Start with base energy
  });

  // UseEffect to recalculate energy balance when production/consumption changes
  React.useEffect(() => {
    setResources(prev => {
        if (!prev.Energy) return prev;
        const balance = prev.Energy.production - prev.Energy.consumption;
        return { ...prev, Energy: { ...prev.Energy, balance } };
    });
  }, [resources.Energy?.production, resources.Energy?.consumption]);


  const handleBuild = (building: Building) => {
    if (hasEnoughResources(building.cost, resources)) {
      setResources(prev => {
          const newResources = { ...prev };
          // Deduct cost
          Object.entries(building.cost).forEach(([ore, amount]) => {
              newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
          });
          // Adjust energy
          if (prev.Energy) {
              const newConsumption = prev.Energy.consumption + (building.energyCost ?? 0);
              const newProduction = prev.Energy.production + (building.energyProduction ?? 0);
              newResources.Energy = { ...prev.Energy, consumption: newConsumption, production: newProduction };
          }
          // TODO: Add logic to update game state (place building, start timer, etc.)
          console.log(`Building ${building.name}... (State updated)`);
          return newResources;
      });

    } else {
      console.log(`Not enough resources to build ${building.name}`);
      // TODO: Show feedback to the user (e.g., toast notification)
    }
  };

   const handleBuildShip = (ship: ShipType) => {
    if (hasEnoughResources(ship.cost, resources)) {
        setResources(prev => {
            const newResources = { ...prev };
            Object.entries(ship.cost).forEach(([ore, amount]) => {
                newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
            });
            // Add energy cost for construction if applicable
            // TODO: Add logic to start ship construction queue
            console.log(`Building ${ship.name}... (State updated)`);
            return newResources;
        });

    } else {
      console.log(`Not enough resources to build ${ship.name}`);
       // TODO: Show feedback
    }
  };

   const handleResearch = (research: ResearchItem) => {
     if (hasEnoughResources(research.cost, resources) && !research.completed) {
        setResources(prev => {
            const newResources = { ...prev };
            Object.entries(research.cost).forEach(([ore, amount]) => {
                newResources[ore as OreType] = (newResources[ore as OreType] ?? 0) - amount;
            });
             // Mark as completed instantly for testing (replace with proper state management and timer)
             const itemIndex = availableResearch.findIndex(item => item.id === research.id);
             if (itemIndex > -1) {
                 // Note: This directly mutates the example data. In a real app, update state.
                 availableResearch[itemIndex].completed = true;
             }
             console.log(`Researching ${research.name}... (State updated)`);
             // TODO: Update research state properly, potentially start timer
             forceUpdate(); // Force re-render needed without proper state management
            return newResources;
        });


     } else if (research.completed) {
         console.log(`${research.name} already researched.`);
     } else {
       console.log(`Not enough resources to research ${research.name}`);
        // TODO: Show feedback
     }
   };

    // Hook to force re-render (use sparingly, prefer state management)
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);


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
                         <span>{resources[ore] ?? 0}</span>
                      </div>
                 ))}
                 {resources.Energy && (
                    <div className="flex justify-between">
                        <span>Energy:</span>
                        <span className={cn(resources.Energy.balance >= 0 ? 'text-[hsl(var(--chart-1))]' : 'text-destructive')}>
                           {resources.Energy.balance > 0 ? `+${resources.Energy.balance}` : resources.Energy.balance} <span className="text-xs text-muted-foreground">({resources.Energy.production}/{resources.Energy.consumption})</span>
                        </span>
                     </div>
                 )}
           </SidebarGroupContent>
        </SidebarGroup>
         <SidebarSeparator />

         <TooltipProvider delayDuration={100}> {/* Wrap Tabs with TooltipProvider */}
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
                <TabsContent value="buildings" className="mt-0">
                <SidebarMenu>
                    {availableBuildings.map((building) => (
                    <SidebarMenuItem key={building.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className="w-full bg-card/50 hover:bg-card/70 transition-colors">
                                    <CardContent className="p-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <building.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{building.name} {building.level && `(Lvl ${building.level})`}</p>
                                            {/* Short description or Cost preview */}
                                            <div className="text-xs text-muted-foreground truncate flex items-center">
                                                 <span className="mr-1">Cost:</span> {formatCostWithIcons(building.cost)}
                                            </div>
                                             {building.energyCost || building.energyProduction ? (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Energy: {building.energyProduction ? `+${building.energyProduction}` : `-${building.energyCost}`}
                                                </p>
                                             ) : null}
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleBuild(building)} disabled={!hasEnoughResources(building.cost, resources)}>
                                        Build
                                    </Button>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="start" className="max-w-xs">
                                 <p className="font-semibold">{building.name} {building.level && `(Lvl ${building.level})`}</p>
                                 <p className="text-sm text-muted-foreground mb-2">{building.description}</p>
                                 <div className="text-sm space-y-1">
                                     <p>Cost: {formatCostWithIcons(building.cost)}</p>
                                     {building.energyCost && <p>Energy Consumption: {building.energyCost}</p>}
                                     {building.energyProduction && <p>Energy Production: {building.energyProduction}</p>}
                                     {building.requires && <p className="text-amber-400">Requires: {building.requires}</p>}
                                 </div>
                            </TooltipContent>
                        </Tooltip>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                </TabsContent>

                {/* Shipyard Tab */}
                <TabsContent value="shipyard" className="mt-0">
                <SidebarMenu>
                    {availableShips.map((ship) => (
                    <SidebarMenuItem key={ship.id}>
                        <Tooltip>
                             <TooltipTrigger asChild>
                                <Card className="w-full bg-card/50 hover:bg-card/70 transition-colors">
                                    <CardContent className="p-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <ship.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{ship.name}</p>
                                                <div className="text-xs text-muted-foreground truncate flex items-center">
                                                     <span className="mr-1">Cost:</span> {formatCostWithIcons(ship.cost)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => handleBuildShip(ship)} disabled={!hasEnoughResources(ship.cost, resources)}>
                                            Build
                                        </Button>
                                    </CardContent>
                                </Card>
                             </TooltipTrigger>
                             <TooltipContent side="right" align="start" className="max-w-xs">
                                 <p className="font-semibold">{ship.name}</p>
                                 <p className="text-sm text-muted-foreground mb-2">{ship.description}</p>
                                 <div className="text-sm space-y-1">
                                      <p>Cost: {formatCostWithIcons(ship.cost)}</p>
                                      {ship.requires && <p className="text-amber-400">Requires: {ship.requires}</p>}
                                      {/* Add more ship stats here later */}
                                 </div>
                             </TooltipContent>
                        </Tooltip>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                </TabsContent>

                {/* Research Tab */}
                <TabsContent value="research" className="mt-0">
                <SidebarMenu>
                    {availableResearch.map((item) => (
                    <SidebarMenuItem key={item.id}>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className={cn("w-full hover:bg-card/70 transition-colors", item.completed ? "bg-[hsl(var(--chart-1))]/30 border-[hsl(var(--chart-1))]" : "bg-card/50")}>
                                    <CardContent className="p-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <div className="text-xs text-muted-foreground truncate flex items-center">
                                                    <span className="mr-1">Cost:</span> {formatCostWithIcons(item.cost)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => handleResearch(item)} disabled={!hasEnoughResources(item.cost, resources) || item.completed}>
                                            {item.completed ? "Done" : "Research"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                             <TooltipContent side="right" align="start" className="max-w-xs">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                   <div className="text-sm space-y-1">
                                      <p>Cost: {formatCostWithIcons(item.cost)}</p>
                                      {item.unlocks && <p className="text-sky-400">Unlocks: {item.unlocks}</p>}
                                   </div>
                                   {item.completed && <p className="text-xs text-[hsl(var(--chart-1))] mt-2">Already Researched</p>}
                             </TooltipContent>
                        </Tooltip>
                    </SidebarMenuItem>
                    ))}
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
                    <p>Ore Extraction Rate: (Details TBD)</p>
                    <p>Defenses: Active (Placeholder)</p>
                    {/* Add more detailed stats: buildings list, ships docked, etc. */}
                    </CardContent>
                </Card>
                </TabsContent>
            </ScrollArea>
            </Tabs>
         </TooltipProvider> {/* End TooltipProvider */}
       </SidebarContent>
       <SidebarSeparator />
       <SidebarFooter>
             <div className="text-xs text-muted-foreground px-2">Game Time: 00:00:00 (TBD)</div>
       </SidebarFooter>
       </>
  );
};

export default ControlPanel;

