"use client";

import GameRuntime from "./GameRuntime.jsx";
import HorrorEffects from "./HorrorEffects.jsx";
import PlayerIdentity from "./PlayerIdentity.jsx";
import ResponsiveExperience from "./ResponsiveExperience.jsx";
import NarrativeRefreshV3 from "./NarrativeRefreshV3.jsx";

export default function DeploymentApp() {
  return (
    <PlayerIdentity>
      <ResponsiveExperience>
        <NarrativeRefreshV3>
          <HorrorEffects>
            <GameRuntime />
          </HorrorEffects>
        </NarrativeRefreshV3>
      </ResponsiveExperience>
    </PlayerIdentity>
  );
}
