export const CORE_STORY = [
  {
    id: "core-001",
    title: "第一夜：房間多了一個呼吸",
    subtitle: "你沒有聽錯。那個停頓，正在配合你的呼吸。",
    scene: "room",
    accent: "red",
    intro: "現在是 {{time}}。你只是隨手打開這個網站，房間裡卻有一個聲音跟著畫面亮起：吸氣、停住、吐氣。它不像從喇叭傳來，反而像隔著某個很薄的表面。當你停止呼吸時，它仍多呼吸了一次。",
    routeText: {
      nerve: "你決定先不害怕。可那個聲音似乎正等你做出這個決定。",
      insight: "你發現每次游標停住，呼吸就靠近一點。",
      empathy: "那不是獵食者的呼吸。更像有人躲著，不敢讓你知道它正在哭。",
      balanced: "你還沒有形成習慣。這讓它暫時無法預測你。"
    },
    choices: [
      { label: "把聲音當成錯覺，繼續盯著螢幕", icon: "◉", result: "你盯著文字不動。幾秒後，黑色螢幕倒影裡的你眨了眼——真正的你沒有。它似乎很滿意你選擇留下。", effects: { nerve: 1, insight: 1, empathy: 0 }, flag: "reflection_blinked" },
      { label: "關掉房內最接近你的光源", icon: "☾", result: "光熄滅的瞬間，呼吸聲消失。接著，你身後很近的位置傳來一句氣音：『這樣比較看得清楚。』", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "darkness_invited" },
      { label: "對著空氣問：你需要幫忙嗎？", icon: "◇", result: "沒有回答。網站卻自己輸入一行字：『不要對它說話，它會用我的聲音回答。』你得到第一個不確定是否可信的警告。", effects: { nerve: 0, insight: 0, empathy: 2 }, item: "無署名警告" }
    ]
  },
  {
    id: "core-002",
    title: "第二夜：門外的人沒有影子",
    subtitle: "門縫下方亮著走廊的光，但少了一樣應該存在的東西。",
    scene: "door",
    accent: "amber",
    intro: "門外傳來三下很輕的敲擊。不是敲門，更像指甲測試木板厚度。門縫下有一雙腳停著，腳尖朝向你的房間；走廊燈很亮，地面卻沒有它的影子。手機通知跳出：『不要讓它知道你看見腳。』",
    routeText: {
      nerve: "你聽出第四下敲擊其實來自門的內側。",
      insight: "腳的位置沒有移動，但門縫下的光正在變窄，像那東西正在慢慢俯身。",
      empathy: "門外傳來壓抑的啜泣，聲音與你熟悉的人非常相似。",
      balanced: "它還不知道哪種聲音最能讓你開門。"
    },
    choices: [
      { label: "從另一個房間製造聲音，引它離開", icon: "↗", result: "遠處傳來物品落地聲。門外的腳沒有移動，但你的房間外，多出另一雙朝著聲音方向的腳。它不是一個人。", effects: { nerve: 1, insight: 2, empathy: 0 }, flag: "heard_second_pair" },
      { label: "隔著門大聲命令它離開", icon: "!", result: "門外立刻安靜。幾秒後，你的衣櫃裡傳出同樣的聲音，貼著門板回應：『好。』", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "closet_answered" },
      { label: "不開門，只問它是誰", icon: "?", result: "它報出你的名字，接著報出一個只有你童年時才有人使用的稱呼。最後它問：『你把我忘在哪裡了？』", effects: { nerve: 0, insight: 0, empathy: 2 }, item: "被遺忘的稱呼" }
    ]
  },
  {
    id: "core-003",
    title: "第三夜：照片裡少了一個位置",
    subtitle: "不是少了一個人，而是照片替某個人空出了位置。",
    scene: "photo",
    accent: "blue",
    intro: "網站要求你『回想最近看過的一張合照』。你沒有上傳任何圖片，畫面卻生成一張模糊照片：熟悉的人站成一排，中間留著一個不自然的空位。空位後方的牆上，有一道細長陰影正把手搭在每個人的肩上。",
    routeText: {
      nerve: "空位像是在挑釁你走進去。",
      insight: "所有人的視線都略微偏向空位，證明拍照當時那裡其實站著東西。",
      empathy: "照片中最靠近空位的人正在努力忍住哭，只有你看得出來。",
      balanced: "照片尚未決定要把誰從原本的位置移開。"
    },
    choices: [
      { label: "點擊空位，查看被抹去的人", icon: "□", result: "空位浮出一張臉。那張臉與你很像，但年齡不對。照片下方顯示日期：明天。", effects: { nerve: 1, insight: 2, empathy: 0 }, flag: "saw_tomorrow_self" },
      { label: "撕裂照片中延伸的影子", icon: "✕", result: "畫面上的影子被切斷，現實中某處同步傳來布料撕裂聲。你的袖口出現一道不存在於幾秒前的裂痕。", effects: { nerve: 2, insight: 0, empathy: -1 }, item: "裂開的袖口" },
      { label: "逐一叫出照片裡每個人的名字", icon: "◌", result: "每念一個名字，照片就清晰一點。念到最後，空位裡傳出你的聲音：『還差一個。』", effects: { nerve: 0, insight: 0, empathy: 2 }, flag: "missing_name" }
    ]
  },
  {
    id: "core-004",
    title: "第四夜：不是所有通知都來自手機",
    subtitle: "震動停止後，你的桌面仍在輕微顫動。",
    scene: "phone",
    accent: "violet",
    intro: "手機連續震動三次，卻沒有任何通知。第四次震動來自桌面底下。你低頭前，網站先跳出一句：『不要讓視線低於桌緣。它正在學你低頭的速度。』桌下有東西用很慢的節奏，敲出你剛才選擇的編號。",
    routeText: {
      nerve: "你握緊手邊能當作武器的東西，桌下敲擊立刻停了。它知道你準備好了。",
      insight: "敲擊不是摩斯密碼，而是你截至目前的 Cookie 選擇序列。",
      empathy: "最後一下敲擊特別輕，像那東西的手指已經受傷。",
      balanced: "它還在測試哪一種節奏會讓你忍不住低頭。"
    },
    choices: [
      { label: "用前鏡頭反射桌下，不直接低頭", icon: "⌁", result: "鏡頭畫面裡只有你的雙腳；但在預覽畫面的最下方，多出一隻握著手機邊緣的手。那隻手來自螢幕裡面。", effects: { nerve: 0, insight: 2, empathy: 0 }, flag: "hand_inside_screen" },
      { label: "猛然後退，離開桌邊", icon: "←", result: "你成功拉開距離。桌子卻跟著向你移動了幾公分，沒有發出任何摩擦聲。", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "table_followed" },
      { label: "用同樣節奏敲回去", icon: "•••", result: "桌下回敲一段更長的訊息。網站替你翻譯：『我被放在你每次不敢看的地方。』", effects: { nerve: 0, insight: 1, empathy: 2 }, item: "桌下回音" }
    ]
  },
  {
    id: "core-005",
    title: "第五夜：畫面離開時，它靠近了",
    subtitle: "你切去別的分頁，這個網站仍知道你不在。",
    scene: "screen",
    accent: "green",
    intro: "當頁面曾經被切到背景時，有某些東西改變了。回來後，插畫裡原本在遠處的人影近了一些；你的選擇仍在，但其中一個按鈕上多出一道像指腹留下的霧痕。頁面標題短暫顯示：『你離開了。它沒有。』",
    routeText: {
      nerve: "你決定不再把視線移開，畫面中央的人影反而開始後退。",
      insight: "每次頁面失去焦點，它都能移動固定距離。這代表規則可以被利用。",
      empathy: "人影靠近不是為了碰你，而是一直指著你身後。",
      balanced: "它還無法判斷你離開頁面是逃跑，還是誘餌。"
    },
    choices: [
      { label: "故意反覆切換分頁，測量它的移動", icon: "⇄", result: "第七次切回時，人影消失。取而代之的是一行貼近鏡頭的字：『謝謝你把路分成七段。』", effects: { nerve: 0, insight: 3, empathy: 0 }, flag: "seven_switches" },
      { label: "保持注視，不再讓頁面失焦", icon: "◎", result: "你盯著它，它也盯著你。最後先眨眼的是插畫中的人影；眨眼後，它的臉變成你的。", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "won_stare" },
      { label: "相信它的手勢，回頭確認身後", icon: "↶", result: "身後沒有任何東西。當你轉回來，人影已站在插畫最前方，雙手捂住自己的臉，像是不願讓你看見它為何害怕。", effects: { nerve: 0, insight: 0, empathy: 3 }, flag: "trusted_warning" }
    ]
  },
  {
    id: "core-006",
    title: "第六夜：牆裡有人記得你的選擇",
    subtitle: "每一條路線，都在牆的另一面留下另一個你。",
    scene: "wall",
    accent: "red",
    intro: "牆內傳來細碎移動聲。它沒有隨機亂走，而是依序重現你一路做過的選擇：停一下、移動、敲擊，再停一下。當它完成最後一個選擇後，牆上浮出三個輪廓，分別做著你當時沒有選的另外兩個動作。",
    routeText: {
      nerve: "其中一個輪廓開始撞牆，像想取代做出目前選擇的你。",
      insight: "牆裡保存的不是幽靈，而是每個未被選取的分支。",
      empathy: "那些輪廓並不恨你。它們只是從出生起就知道自己不會被玩家看見。",
      balanced: "三個輪廓都認為自己才是被保留下來的版本。"
    },
    choices: [
      { label: "在牆上畫一扇門，讓其中一個分支出來", icon: "▯", result: "門真的向內打開。走出來的你沒有攻擊，只把一張寫滿不同選擇的紙塞進你手中，然後問：『這次換我玩嗎？』", effects: { nerve: 1, insight: 1, empathy: 1 }, item: "另一個你的選擇表" },
      { label: "封住牆縫，不讓任何分支靠近", icon: "▰", result: "聲音被封住了。幾秒後，敲擊從你胸腔內部繼續，節奏完全相同。", effects: { nerve: 2, insight: 0, empathy: -2 }, flag: "sealed_inside" },
      { label: "向牆裡道歉，承認自己只能選一條路", icon: "◇", result: "牆後安靜很久。最後，三個輪廓同時把手掌貼上牆面，留下溫度。你獲得一個不屬於目前路線的記憶。", effects: { nerve: 0, insight: 0, empathy: 3 }, item: "未選路線的記憶" }
    ]
  },
  {
    id: "core-007",
    title: "第七夜：回聲開始使用你的聲音",
    subtitle: "它不是模仿你說過的話，而是在排練你還沒說出口的句子。",
    scene: "hall",
    accent: "blue",
    intro: "遠處傳來你的聲音，說出一句你正準備在心裡默念的話。第二句更早，在你形成完整想法前就被說出。第三句只說了一半便停下，像回聲突然意識到：真正的你正在聽。",
    routeText: {
      nerve: "你故意想像一個挑釁句子，回聲卻用非常害怕的語氣說了出來。",
      insight: "它不是讀心，而是在根據你之前的選擇預測下一句。",
      empathy: "那聲音越來越像你，但每句話後都藏著另一個人的喘息。",
      balanced: "你的行為不夠一致，讓它第一次預測失敗。"
    },
    choices: [
      { label: "故意做出完全違反過往傾向的選擇", icon: "≠", result: "回聲說錯了。走廊深處傳來玻璃破裂聲，像某套用來預測你的模型被迫重算。", effects: { nerve: 1, insight: 2, empathy: 0 }, flag: "broke_prediction" },
      { label: "搶在回聲前喊出自己的名字", icon: "!", result: "你的聲音與回聲重疊。重疊的瞬間，你聽見第三個聲音在中間低語：『哪一個才是本人？』", effects: { nerve: 2, insight: 0, empathy: 0 }, flag: "three_voices" },
      { label: "讓回聲把沒說完的句子說完", icon: "…", result: "它說：『我一直在替你承受那些沒有被選的結果。』隨後，你所有未選分支的痛感短暫湧入身體。", effects: { nerve: -1, insight: 0, empathy: 3 }, item: "回聲的痛感" }
    ]
  },
  {
    id: "core-008",
    title: "第八夜：整點之後，故事不再只在網站裡",
    subtitle: "下一章尚未生成，但有東西已經提早抵達。",
    scene: "clock",
    accent: "violet",
    intro: "時鐘即將跳到下一個整點。網站底部顯示：『新的故事會在每個整點出現，直到 7 月 31 日。』然而倒數還沒結束，房間某處已先傳來下一章才應該出現的聲音。它比網站快了一分鐘。",
    routeText: {
      nerve: "你準備迎向下一章，不讓它利用未知嚇退你。",
      insight: "如果現象比更新早出現，代表故事資料只是紀錄，而不是來源。",
      empathy: "那聲音似乎很怕 7 月 31 日，因為結局意味著它將失去繼續說話的機會。",
      balanced: "你仍能在三種路線間移動，因此它無法替你預寫結局。"
    },
    choices: [
      { label: "主動走向聲音來源，不等網站更新", icon: "→", result: "你在聲音抵達前先到達那裡。黑暗中有東西愣了一下，像從未想過玩家能比劇情更快。", effects: { nerve: 3, insight: 0, empathy: 0 }, flag: "arrived_before_story" },
      { label: "記錄更新前後所有差異", icon: "⌘", result: "你捕捉到一行只存在 0.2 秒的系統訊息：『敘事來源：玩家周遭尚未被注意的細節。』", effects: { nerve: 0, insight: 3, empathy: 0 }, item: "0.2 秒訊息" },
      { label: "告訴聲音：結局前我會繼續聽", icon: "◇", result: "房間恢復安靜。網站新增一句不在程式碼裡的回覆：『那我也會盡量不靠太近。』", effects: { nerve: 0, insight: 0, empathy: 3 }, flag: "promised_to_listen" }
    ]
  }
];

export const STAT_META = {
  nerve: { label: "鎮定", icon: "◆" },
  insight: { label: "警覺", icon: "◇" },
  empathy: { label: "共感", icon: "◌" }
};

export function getDominantRoute(stats) {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  if (!entries.length || entries[0][1] === entries[1][1]) return "balanced";
  return entries[0][0];
}

export function routeLabel(route) {
  return {
    nerve: "不回頭的人",
    insight: "看見規則的人",
    empathy: "聽見回聲的人",
    balanced: "尚未被預測的人"
  }[route] || "尚未被預測的人";
}
