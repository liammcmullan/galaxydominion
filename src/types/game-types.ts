
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
  cost: Partial<Record<OreType, number>>; // Cost can be multiple ore types
  icon: React.ElementType;
  level?: number;
  energyCost?: number;
  energyProduction?: number;
  requires?: string | string[]; // Research or other building requirement (can be single or multiple)
  constructionTime: number; // Time to build in milliseconds
}

export interface ShipType {
  id: string;
  name: string;
  description: string;
  cost: Partial<Record<OreType, number>>; // Cost can be multiple ore types
  icon: React.ElementType;
  requires?: string | string[]; // Building name(s) or research ID(s) required
  // Add stats like speed, cargo capacity, attack, defense later
}

export interface ResearchItem {
    id: string;
    name: string;
    description: string;
    cost: Partial<Record<OreType, number>>; // Cost can be multiple ore types
    icon: React.ElementType;
    unlocks?: string; // e.g., 'Nuclear Reactor'
    completed?: boolean;
}

// Type for tracking construction progress
export interface ConstructionProgress {
    startTime: number;
    duration: number;
}

