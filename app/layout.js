import "./globals.css";
import "./branching.css";
import "./effects.css";
import HorrorEffects from "../components/HorrorEffects";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款以真正樹狀故事圖記住選擇、場景與重啟次數的近身恐怖網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "每一個選擇都通往不同節點；只有連貫的故事才會重新交織。",
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
