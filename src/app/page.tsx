import GameLayout from "@/components/layout/game-layout";
import GalaxyMap from "@/components/game/galaxy-map";
import ControlPanel from "@/components/game/control-panel";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  // Placeholder for AI Simulation logic trigger/initialization
  // const initializeAISimulation = () => { console.log("AI Simulation would start here."); };
  // React.useEffect(() => { initializeAISimulation(); }, []);

  return (
    <GameLayout>
       <ControlPanel />
      {/* Main content area for the galaxy map */}
      <div className="flex flex-col flex-1 h-full p-4">
         <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Galaxy Map</h1>
             <SidebarTrigger className="md:hidden" />
         </div>
        <GalaxyMap />
      </div>
    </GameLayout>
  );
}
