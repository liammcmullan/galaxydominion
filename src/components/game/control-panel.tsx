"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Rocket, FlaskConical, Users, Sun, Atom, ShieldCheck, Target, Warehouse, Banknote, Library, HeartPulse, Ship, Factory } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar';

// Placeholder data types (expand as needed)
interface Building {
  id: string;
  name: string;
  description: string;
  cost: number; // Example cost in ore
  icon: React.ElementType;
  level?: number;
  energyCost?: number;
}

interface ShipType {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ElementType;
  requires?: string; // e.g., Ship Construction Facility Level 2
}

interface ResearchItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: React.ElementType;
    unlocks?: string; // e.g., 'Nuclear Reactor'
    completed?: boolean;
}

// Example Data (replace with actual game state)
const availableBuildings: Building[] = [
  { id: 'colony_hub', name: 'Colony Hub', description: 'Central structure. Upgrade to unlock more buildings.', cost: 100, icon: Factory, level: 1 },
  { id: 'ore_refinery', name: 'Ore Refinery', description: 'Extracts ore.', cost: 50, icon: Package, energyCost: 5 },
  { id: 'trade_port', name: 'Trade Port', description: 'Trade ore for resources.', cost: 75, icon: Banknote },
  { id: 'research_lab', name: 'Research Lab', description: 'Unlocks tech.', cost: 150, icon: Library, energyCost: 10 },
  { id: 'medical_lab', name: 'Medical Lab', description: 'Improves worker efficiency.', cost: 120, icon: HeartPulse, energyCost: 8 },
  { id: 'colony_expansion', name: 'Colony Expansion', description: 'Increases population cap.', cost: 200, icon: Users },
  { id: 'ship_facility', name: 'Ship Facility', description: 'Builds ships.', cost: 250, icon: Ship, energyCost: 15 },
  { id: 'solar_plant', name: 'Solar Plant', description: 'Basic energy.', cost: 80, icon: Sun },
  { id: 'nuclear_reactor', name: 'Nuclear Reactor', description: 'Advanced energy.', cost: 500, icon: Atom, requires: 'Research: Nuclear Power' },
  { id: 'laser_turret', name: 'Laser Turret', description: 'Planetary defense.', cost: 100, icon: Target, energyCost: 20 },
   { id: 'missile_battery', name: 'Missile Battery', description: 'Long-range defense.', cost: 180, icon: Target, energyCost: 25 },
   { id: 'shield_generator', name: 'Shield Generator', description: 'Protects the colony.', cost: 300, icon: ShieldCheck, energyCost: 50 },
];

const availableShips: ShipType[] = [
  { id: 'scout', name: 'Scout', description: 'Fast exploration vessel.', cost: 50, icon: Rocket, requires: 'Ship Facility' },
  { id: 'cargo', name: 'Cargo Ship', description: 'Transports resources.', cost: 80, icon: Warehouse, requires: 'Ship Facility' },
  { id: 'fighter', name: 'Fighter', description: 'Basic combat ship.', cost: 120, icon: Rocket, requires: 'Ship Facility' },
  // Add more ships like Cruiser, Science Vessel later
];

const availableResearch: ResearchItem[] = [
    { id: 'adv_engines', name: 'Advanced Engines', description: 'Increase ship speed.', cost: 100, icon: FlaskConical },
    { id: 'laser_tech', name: 'Laser Technology', description: 'Improve laser weapons.', cost: 150, icon: FlaskConical },
    { id: 'nuclear_power', name: 'Nuclear Power', description: 'Unlocks Nuclear Reactors.', cost: 300, icon: FlaskConical, unlocks: 'Nuclear Reactor' },
    { id: 'shielding', name: 'Advanced Shielding', description: 'Improve shield strength.', cost: 250, icon: FlaskConical },
];

const ControlPanel: React.FC = () => {
  // Placeholder state for resources (replace with actual game state context)
  const [ore, setOre] = React.useState(1000);
  const [energyProduction, setEnergyProduction] = React.useState(10);
  const [energyConsumption, setEnergyConsumption] = React.useState(0);

  const handleBuild = (building: Building) => {
    if (ore >= building.cost) {
      setOre(ore - building.cost);
      if(building.energyCost) {
        setEnergyConsumption(prev => prev + (building.energyCost ?? 0));
      }
       if(building.name === 'Solar Plant'){ // Example: Increase production
            setEnergyProduction(prev => prev + 20);
        }
        if(building.name === 'Nuclear Reactor'){
            setEnergyProduction(prev => prev + 100);
        }
      console.log(`Building ${building.name}...`);
      // TODO: Add logic to update game state (place building, start timer, etc.)
    } else {
      console.log(`Not enough ore to build ${building.name}`);
      // TODO: Show feedback to the user (e.g., toast notification)
    }
  };

   const handleBuildShip = (ship: ShipType) => {
    if (ore >= ship.cost) {
      setOre(ore - ship.cost);
       // Assume energy cost for ship building process if needed
      console.log(`Building ${ship.name}...`);
      // TODO: Add logic to start ship construction
    } else {
      console.log(`Not enough ore to build ${ship.name}`);
    }
  };

   const handleResearch = (research: ResearchItem) => {
     if (ore >= research.cost && !research.completed) {
       setOre(ore - research.cost);
       console.log(`Researching ${research.name}...`);
       // TODO: Update research state, potentially start timer
       // For now, just mark as completed instantly for UI testing
       research.completed = true; // Needs proper state management
       // Force re-render if needed (better with state management library)
       forceUpdate();
     } else if (research.completed) {
         console.log(`${research.name} already researched.`);
     }
      else {
       console.log(`Not enough ore to research ${research.name}`);
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
                <div className="flex justify-between"><span>Ore:</span><span>{ore}</span></div>
                 <div className="flex justify-between">
                    <span>Energy:</span>
                    <span className={cn(energyProduction >= energyConsumption ? 'text-green-400' : 'text-red-400')}>
                       {energyProduction - energyConsumption} ({energyProduction} / {energyConsumption})
                    </span>
                 </div>
                {/* Add more resources like credits, population etc. */}
           </SidebarGroupContent>
        </SidebarGroup>
         <SidebarSeparator />

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
                         <Card className="w-full bg-card/50">
                             <CardContent className="p-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <building.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{building.name} {building.level && `(Lvl ${building.level})`}</p>
                                        <p className="text-xs text-muted-foreground truncate">{building.description}</p>
                                        <p className="text-xs text-muted-foreground">Cost: {building.cost} Ore {building.energyCost ? ` | Energy: -${building.energyCost}` : ''}</p>
                                         {building.requires && <p className="text-xs text-amber-400 truncate">Requires: {building.requires}</p>}
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => handleBuild(building)} disabled={ore < building.cost}>
                                     Build
                                 </Button>
                             </CardContent>
                         </Card>
                    </SidebarMenuItem>
                 ))}
               </SidebarMenu>
            </TabsContent>

            {/* Shipyard Tab */}
            <TabsContent value="shipyard" className="mt-0">
               <SidebarMenu>
                {availableShips.map((ship) => (
                    <SidebarMenuItem key={ship.id}>
                        <Card className="w-full bg-card/50">
                            <CardContent className="p-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <ship.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{ship.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{ship.description}</p>
                                        <p className="text-xs text-muted-foreground">Cost: {ship.cost} Ore</p>
                                          {ship.requires && <p className="text-xs text-amber-400 truncate">Requires: {ship.requires}</p>}
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => handleBuildShip(ship)} disabled={ore < ship.cost}>
                                    Build
                                </Button>
                            </CardContent>
                        </Card>
                    </SidebarMenuItem>
                ))}
               </SidebarMenu>
            </TabsContent>

             {/* Research Tab */}
            <TabsContent value="research" className="mt-0">
               <SidebarMenu>
                {availableResearch.map((item) => (
                    <SidebarMenuItem key={item.id}>
                         <Card className={cn("w-full", item.completed ? "bg-green-900/30 border-green-700" : "bg-card/50")}>
                            <CardContent className="p-2 flex items-center justify-between gap-2">
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                     <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                     <div className="flex-1 min-w-0">
                                         <p className="text-sm font-medium truncate">{item.name}</p>
                                         <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                         <p className="text-xs text-muted-foreground">Cost: {item.cost} Ore</p>
                                         {item.unlocks && <p className="text-xs text-sky-400 truncate">Unlocks: {item.unlocks}</p>}
                                     </div>
                                 </div>
                                  <Button size="sm" onClick={() => handleResearch(item)} disabled={ore < item.cost || item.completed}>
                                     {item.completed ? "Done" : "Research"}
                                 </Button>
                            </CardContent>
                         </Card>
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
                  <p>Population: 100 / 150</p>
                  <p>Happiness: 85%</p>
                  <p>Ore Extraction Rate: 50/min</p>
                   <p>Defenses: Active (3 Laser Turrets, 1 Missile Battery)</p>
                  {/* Add more detailed stats */}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
       </SidebarContent>
       <SidebarSeparator />
       <SidebarFooter>
            {/* Placeholder for game time or global actions */}
             <div className="text-xs text-muted-foreground px-2">Game Time: 00:05:32</div>
       </SidebarFooter>
       </>
  );
};

export default ControlPanel;
