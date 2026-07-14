import "./site.css";
import "./effects.css";
import "./novel.css";
import HorrorEffects from "../components/HorrorEffects";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款以現代恐怖小說筆法呈現、並記住每次選擇與所在地的樹狀網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "以具體場景、人物動作和自然對話展開，每一個選擇都通往不同後續。",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body><HorrorEffects>{children}</HorrorEffects></body>
    </html>
  );
}
