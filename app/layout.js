import "./app.css";
import "./player-identity.css";
import "./responsive.css";
import "./narrative-refresh.css";
import HorrorEffects from "../components/HorrorEffects";
import PlayerIdentity from "../components/PlayerIdentity";
import ResponsiveExperience from "../components/ResponsiveExperience";
import NarrativeRefreshV3 from "../components/NarrativeRefreshV3";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款支援手機與電腦開場、讓玩家自行命名，並以精簡多變選項展開的現代恐怖網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "手機與電腦會出現不同開場；第二章後採用短篇幅、不同玩法的三選項故事。",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <PlayerIdentity>
          <ResponsiveExperience>
            <NarrativeRefreshV3>
              <HorrorEffects>{children}</HorrorEffects>
            </NarrativeRefreshV3>
          </ResponsiveExperience>
        </PlayerIdentity>
      </body>
    </html>
  );
}
