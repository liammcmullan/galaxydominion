
import GameLayout from "@/components/layout/game-layout";
import GalaxyMap from "@/components/game/galaxy-map";
import ControlPanel from "@/components/game/control-panel";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <GameLayout>
      {/* Control Panel (will be rendered in the sidebar by GameLayout) */}
      <ControlPanel />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Galaxy Map</h1>
          {/* Hamburger menu trigger for mobile */}
          <SidebarTrigger className="md:hidden" />
        </div>
        {/* Galaxy Map Display */}
        <GalaxyMap />
      </div>
    </GameLayout>
  );
}
