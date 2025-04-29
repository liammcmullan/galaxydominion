# **App Name**: Ore Wars Commander

## Core Features:

- Galaxy Map: Display a 2D grid-based galaxy map with clickable sectors, showing planets, colonies, and known objects.
- Control Panels: Implement side panels for building menus, shipyard, research tree, and colony stats.
- AI Simulation: Simulate AI opponents that establish colonies, build ships, and attack player colonies.

## Style Guidelines:

- Primary color: Dark grey (#333) for a space-themed atmosphere.
- Secondary color: Light grey (#ddd) for UI elements and text.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clean, sans-serif fonts for readability.
- Simple, geometric icons for buildings, ships, and resources.
- Grid-based layout for the galaxy map and UI panels.

## Original User Request:
**Game Design Document (GDD)**

**Title:** *Galactic Dominion: Ore Wars*

**Genre:** 2D Grid-Based Real-Time Strategy (RTS)

**Platform:** Web

**Overview:**
*Galactic Dominion: Ore Wars* is a real-time strategy game set in a 2D grid-based galaxy where players compete against AI opponents to colonize planets, extract resources, and dominate the galaxy. With a focus on strategic planning, resource management, exploration, and tactical combat, players must expand their reach while balancing technological advancement and planetary defense.

---

### 1. Core Gameplay Loop
1.1 **Explore**: Use scout ships to explore the 2D grid-based galaxy map. Discover planets, anomalies, and AI enemies.

1.2 **Colonize**: Establish colonies on habitable planets.

1.3 **Build & Extract**: Construct ore refineries to mine planetary resources.

1.4 **Trade & Upgrade**: Trade ore for resources to build and upgrade facilities.

1.5 **Expand**: Increase colony size and workforce via colony expansion buildings.

1.6 **Defend & Attack**: Build planetary defenses and offensive weapons. Construct and upgrade ships to fight AI forces.

1.7 **Sustain**: Build energy structures (solar, nuclear, etc.) to power all operations.

---

### 2. Gameplay Features

#### 2.1 Colonies & Buildings
- **Colony Hub**: Central structure of any colony. Upgrading allows more buildings.
- **Ore Refinery**: Extracts ore from the planet.
- **Trade Port**: Allows trade of ore for resources.
- **Research Lab**: Unlocks tech trees and advanced upgrades.
- **Medical Lab**: Improves worker efficiency and reduces downtime.
- **Colony Expansion**: Increases population cap and worker allocation.
- **Ship Construction Facility**: Builds and upgrades ships.
- **Energy Facilities**:
  - *Solar Plant*: Low output, cheap, low maintenance.
  - *Nuclear Reactor*: High output, expensive, potential risks.

All buildings are upgradable. Higher levels unlock additional features, faster output, or access to new structures.

#### 2.2 Ships
- **Ship Types**: Scout, Cargo, Fighter, Cruiser, Science Vessel.
- **Upgradable Modules**:
  - Engines (range/speed)
  - Sensors (visibility and detection)
  - Cargo Hold (resource capacity)
  - Weapons (lasers, missiles, etc.)
  - Shields (defense)

#### 2.3 Planetary Defense & Offense
- **Defense Systems**:
  - Laser Turrets
  - Missile Batteries
  - Shield Generators

- **Offensive Systems**:
  - Orbital Cannons
  - Missile Silos

All defense/offense systems require energy and are upgradable for increased effectiveness.

#### 2.4 Space Stations
- Assist nearby ships with repairs, refueling, cargo transfer, and range extension.
- Modular design with upgrade paths.

---

### 3. User Interface & Experience
- **2D Grid Map**: Clickable sectors showing ships, colonies, and known objects.
- **Side Panels**: Building menus, shipyard, research tree, colony stats.
- **Minimap**: Shows entire galaxy with explored/unexplored regions.
- **Tooltips**: Hover information for all elements.

---

### 4. AI Behavior
- AI establishes its own colonies and refineries.
- Sends scouts to explore.
- Builds ships and defenses.
- Attacks player colonies and ships.
- Reacts dynamically to player's actions.

---

### 5. Quality of Life Features
- **Save/Load/Resume**: Full support for saving progress and resuming later.
- **Help Menu**: Explains all game mechanics and UI elements.
- **Settings Menu**: Options for audio, controls, graphics, difficulty.

---

### 6. Win/Lose Conditions
- **Win**: Dominate the galaxy by defeating all AI opponents or controlling majority sectors.
- **Lose**: All player colonies or fleet destroyed.

---

### 7. Future Features (Post-Launch Ideas)
- Multiplayer mode
- Advanced diplomacy with AI
- Alien factions and unique tech trees
- Random events (solar flares, alien infestations)
- Modding support
  