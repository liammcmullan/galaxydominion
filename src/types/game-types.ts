
/**
 * @fileOverview Defines shared types for the game state and elements.
 */

import type React from 'react';

// Define available ore types
export enum OreType {
    Iron = 'Iron',
    Copper = 'Copper',
    Gold = 'Gold',
    Titanium = 'Titanium',
    Uranium = 'Uranium',
}

// Define sector types
export type SectorType = 'empty' | 'planet' | 'star' | 'anomaly' | 'player_colony' | 'ai_colony';

// Define building categories
export type BuildingCategory = 'Core' | 'Production' | 'Power' | 'Defense' | 'Utility' | 'Shipyard';

// Define the structure for a sector in the galaxy map
export interface Sector {
  id: string;
  type: SectorType;
  x: number;
  y: number;
  isVisible: boolean; // Is the sector currently visible (not fog)?
  isExplored: boolean; // Has the sector's content been revealed?
  oreType?: OreType | null; // Type of ore on planets
  oreAmount?: number; // Amount of ore on planets
}

// Define the structure for resource tracking
export type Resources = {
    [key in OreType]?: number; // Track each ore type
} & {
    Energy?: { production: number; consumption: number; balance: number }; // Optional: Track energy balance
    // Add other resources like Credits, Population later
};

// Interfaces for buildable items (used in ControlPanel)

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory; // Add category property
  description: string;
  baseCost: Partial<Record<OreType, number>>; // Base cost for level 1
  costMultiplier?: number; // Multiplier per level (e.g., 1.5)
  icon: React.ElementType;
  level?: number; // Current level (used in state, base defined here is usually 1)
  maxLevel?: number; // Maximum level for this building
  baseEnergyCost?: number; // Base energy cost for level 1
  baseEnergyProduction?: number; // Base energy production for level 1
  energyMultiplier?: number; // Multiplier per level for energy cost/production
  requires?: string | string[]; // Research or other building requirement (can be single or multiple)
  baseConstructionTime: number; // Base time to build level 1 in milliseconds
  timeMultiplier?: number; // Multiplier per level (e.g., 1.5)
  oreTarget?: OreType; // Specific ore this building targets (e.g., for refineries)
}

export interface ShipType {
  id: string;
  name: string;
  description: string;
  cost: Partial<Record<OreType, number>>; // Cost can be multiple ore types
  icon: React.ElementType;
  requires?: string | string[]; // Specific building name(s) or research ID(s) required (e.g., 'Trade Port')
  // Add stats like speed, cargo capacity, attack, defense later
  // Add build time later
}

export interface ResearchItem {
    id: string;
    name: string;
    description: string;
    baseCost: Partial<Record<OreType, number>>; // Base cost for level 1
    costMultiplier?: number;
    icon: React.ElementType;
    unlocks?: string; // e.g., 'Nuclear Reactor'
    completed?: boolean; // Track completion state
    level?: number; // Current research level
    maxLevel?: number; // Max research level
    baseResearchTime: number; // Base time for level 1 in ms
    timeMultiplier?: number;
}

// Type for tracking construction progress
export interface ConstructionProgress {
    startTime: number;
    duration: number;
    targetLevel: number; // The level being constructed/upgraded to
}

// Template function for ore refinery descriptions
export const getOreRefineryDescription = (oreType: OreType) => `Extracts ${oreType} ore from the planet. Upgrading increases extraction speed.`;

