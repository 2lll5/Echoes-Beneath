import "./app.css";
import "./player-identity.css";
import "./responsive.css";
import HorrorEffects from "../components/HorrorEffects";
import PlayerIdentity from "../components/PlayerIdentity";
import ResponsiveExperience from "../components/ResponsiveExperience";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款支援手機與電腦開場、讓玩家自行命名，並記住每次選擇與所在地的現代恐怖網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "手機與電腦會出現不同開場；寫下你的名字，再走進每個選擇都不同的恐怖故事。",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <PlayerIdentity>
          <ResponsiveExperience>
            <HorrorEffects>{children}</HorrorEffects>
          </ResponsiveExperience>
        </PlayerIdentity>
      </body>
    </html>
  );
}
