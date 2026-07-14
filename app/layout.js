import "./app.css";
import "./player-identity.css";
import HorrorEffects from "../components/HorrorEffects";
import PlayerIdentity from "../components/PlayerIdentity";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款以現代恐怖小說筆法呈現、讓玩家自行命名，並記住每次選擇與所在地的樹狀網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "寫下你的名字，再走進由具體場景、人物動作和不同選擇構成的恐怖故事。",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body><PlayerIdentity><HorrorEffects>{children}</HorrorEffects></PlayerIdentity></body>
    </html>
  );
}
