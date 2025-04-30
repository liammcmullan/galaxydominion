
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

// Define richness levels for ores on a sector
export type OreRichness = 'rich' | 'poor' | 'trace' | 'none';

// Define sector types
export type SectorType = 'empty' | 'planet' | 'star' | 'anomaly' | 'player_colony' | 'ai_colony';

// Define building categories
export type BuildingCategory = 'Core' | 'Production' | 'Power' | 'Defense' | 'Utility' | 'Shipyard' | 'Storage'; // Added 'Storage'

// Define ship status
export type ShipStatus = 'idle' | 'moving' | 'mining' | 'trading' | 'docked' | 'constructing'; // Added 'constructing'

// Define the structure for a sector in the galaxy map
export interface Sector {
  id: string;
  type: SectorType;
  x: number;
  y: number;
  isVisible: boolean; // Is the sector currently visible (not fog)?
  isExplored: boolean; // Has the sector's content been revealed?
  oreDeposits: Partial<Record<OreType, { amount: number; richness: OreRichness }>>; // Ores present and their richness/amount
  // Removed oreType and oreAmount, replaced by oreDeposits
}

// Define the structure for resource tracking (current amounts)
export type Resources = Partial<Record<OreType, number>> & {
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
  // Requirements can be research OR another building (optionally with level)
  // Examples: 'Research: Nuclear Power', 'Trade Port', 'Ship Facility:Level 10'
  requires?: string | string[];
  baseConstructionTime: number; // Base time to build level 1 in milliseconds
  timeMultiplier?: number; // Multiplier per level (e.g., 1.5)
  oreTarget?: OreType; // Specific ore this building targets (e.g., for refineries or storage)
  baseProductionRate?: number; // Base production rate per second for level 1 (for Production buildings) - Represents rate on 'rich' deposit
  // Capacity related fields
  baseInitialCapacity?: Partial<Record<OreType, number>>; // Base capacity provided by level 1 (mainly for Colony Hub)
  baseCapacityIncrease?: number; // Capacity provided by level 1 (mainly for Storage tanks)
  capacityMultiplier?: number; // How capacity scales per level (defaults to costMultiplier or a standard value)
}

export interface ShipType {
  id: string; // e.g., 'scout', 'cargo'
  name: string;
  description: string;
  cost: Partial<Record<OreType, number>>; // Cost can be multiple ore types
  icon: React.ElementType;
  requires?: string | string[]; // Specific building name(s) or research ID(s) required (e.g., 'Trade Port')
  baseBuildTime: number; // Base time to build in milliseconds
  // Add stats like speed, cargo capacity, attack, defense later
  cargoCapacity?: number; // Max cargo space (units)
  speed?: number; // e.g., sectors per second
}

// Interface for individual ship instances
export interface ShipInstance {
    instanceId: string; // Unique identifier for this specific ship instance
    typeId: string; // The type of ship (e.g., 'scout', 'cargo') corresponding to ShipType.id
    name: string; // Can be default or player-assigned
    status: ShipStatus;
    location: { x: number; y: number } | 'docked'; // Current sector or 'docked' at colony
    destination?: { x: number; y: number }; // Target sector if moving
    cargo: Partial<Record<OreType, number>>; // Current cargo
    cargoCapacity: number; // Max cargo capacity
    // Add health, experience, etc. later
    buildStartTime?: number; // Timestamp when construction started
    buildDuration?: number; // Total time needed to build
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

// Type for tracking construction progress (Buildings)
export interface ConstructionProgress {
    startTime: number;
    duration: number;
    targetLevel: number; // The level being constructed/upgraded to
}

// Template function for ore refinery descriptions
export const getOreRefineryDescription = (oreType: OreType) => `Extracts ${oreType} ore from the planet. Efficiency depends on ore richness. Upgrading increases base extraction speed.`;

// Template function for storage tank descriptions
export const getOreStorageDescription = (oreType: OreType) => `Increases storage capacity for ${oreType}. Upgrading increases capacity further.`;


    