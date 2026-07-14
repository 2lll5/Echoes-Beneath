import "./globals.css";

export const metadata = {
  title: "Echoes Beneath｜底下的回聲",
  description: "一款會記住你選擇與重啟次數的近身恐怖網頁 RPG。",
  metadataBase: new URL("https://echoes-beneath.vercel.app"),
  openGraph: {
    title: "Echoes Beneath｜底下的回聲",
    description: "你關掉頁面之後，它仍然記得你。",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}