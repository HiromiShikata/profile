// ==========================================
// RenderJPCV Template
// JIS Standard Format
// ==========================================

// build時にCLIが上書きする（なければ assets/build-info.typ のデフォルトが使われる）
#import "build-info.typ": render_date
// 和暦（元号）定義は別ファイルに分離（改元時はここだけ更新）
#import "era.typ": format_wareki_year

// --- データ読み込み ---
#let resume = yaml("resume.yaml")
// セクション（未定義でも落ちないように）
#let profile = resume.at("profile", default: (:))
#let other = resume.at("other", default: (:))

// コンフィグの読み込み（デフォルト値付き）
#let conf = resume.at("config", default: (:))
// 既定値はやや小さめにして、1ページに収めやすくする
#let font-size = if "font_size" in conf { eval(conf.font_size) } else { 10pt }

// 年の表示スタイル（YAMLは西暦で入力し、表示だけ切り替える）
// 例: config.year_style: seireki | wareki
#let year-style = {
  let s = str(conf.at("year_style", default: "seireki"))
  if s == "seireki" or s == "western" or s == "gregorian" {
    "seireki"
  } else if s == "wareki" or s == "era" or s == "japanese" {
    "wareki"
  } else {
    "seireki"
  }
}

#let format-year(year, month) = {
  if year == none or year == "" {
    ""
  } else {
    let y = eval(str(year))
    let m = if month == none or month == "" { 1 } else { eval(str(month)) }
    if year-style == "seireki" {
      str(y)
    } else {
      format_wareki_year(y, m)
    }
  }
}

// --- ユーティリティ関数 ---

// 画像パスの解決: YAML上の "./" を "../" に変換する
#let resolve-path(path) = {
  if path.starts-with("./") {
    "../" + path.slice(2)
  } else {
    path
  }
}

// 日付文字列 (YYYY-MM) から (YYYY, MM) を抽出
#let parse-date(date-str) = {
  if date-str == none or date-str == "" {
    ("", "")
  } else {
    let parts = str(date-str).split("-")
    if parts.len() >= 2 {
      (format-year(parts.at(0), parts.at(1)), parts.at(1))
    } else {
      (format-year(date-str, ""), "")
    }
  }
}

// --- ページ設定 ---
#set page(
  paper: "a4",
  margin: (x: 15mm, y: 15mm),
)

// --- フォントと基本設定 ---
// Note: フォント名が環境に存在しないと Typst はエラーになります。
// まずは macOS 標準で入っていることが多いフォントに絞り、見つからない場合は Typst のデフォルトに任せます。
#set text(
  font: ("Noto Serif CJK JP", "Noto Sans CJK JP", "Hiragino Mincho ProN", "Hiragino Sans"),
  size: font-size,
  lang: "ja"
)

// --- スタイル定義 ---
#let thick-stroke = 1.5pt + black
#let thin-stroke = 0.7pt + black
#let dotted-stroke = (thickness: 0.7pt, dash: "dotted", paint: black)

// 行の高さ定義 (元のレイアウト値を維持)
#let row-kana-height = 18pt
#let row-name-height = 65pt
#let row-dob-height = 32pt
#let row-contact-height = 48pt
#let row-history-height = 26pt

// セル内のテキスト配置用ヘルパー
#let center-valign(body) = align(center + horizon, body)
#let left-valign(body) = align(left + horizon, body)
#let top-left(body) = align(top + left, body)

// 電話番号など: ハイフンで改行されないよう「非改行ハイフン」に置換
#let no-wrap-phone(value) = {
  if value == none { "" } else { str(value).replace("-", "‑") }
}

// 右端の小項目セル（※性別 / 電話 / E-mail）: ラベルは上、値は中央に揃える
#let side-field(label, value, value-size: 10pt) = {
  block(inset: (top: 3pt, bottom: 3pt, left: 3pt, right: 3pt))[
    #grid(
      columns: (1fr,),
      rows: (auto, 1fr),
      align: (top + left, center + horizon),
      text(size: 9pt)[#label],
      align(center + horizon)[#text(size: value-size)[#value]]
    )
  ]
}

// ==========================================
// ページ 1
// ==========================================

// ヘッダー
// 修正: 写真が上に突き抜けても文字と被らないよう、日付の右側に40mmの空白を確保
#block(width: 100%, inset: (bottom: 5pt))[
  #text(size: 22pt, weight: "bold", tracking: 0.5em)[履歴書]
  #h(1fr)
  #text(size: 9pt)[#(format-year(render_date.year, render_date.month))年 #render_date.month 月 #render_date.day 日 現在]
  #h(40mm)
]

// 基本情報テーブル
#table(
  columns: (80pt, 1fr, 40mm), // ラベル幅, 入力幅, 写真・サイド幅
  rows: (row-kana-height, row-name-height, row-dob-height, row-kana-height, row-contact-height, row-kana-height, row-contact-height),
  stroke: (x, y) => {
    let s-top = thin-stroke
    let s-bottom = thin-stroke
    let s-left = thin-stroke
    let s-right = thin-stroke

    // 外枠（太線）
    // HTMLのL字枠に合わせて、右外枠は y>=2（性別行以降）で描く
    if x == 0 { s-left = thick-stroke }
    if x == 2 and y >= 2 { s-right = thick-stroke }
    if y == 0 { s-top = thick-stroke }
    if y == 6 { s-bottom = thick-stroke }

    // 内部の特定の太線
    if y == 2 { s-bottom = thick-stroke } // 生年月日の下

    // ラベル列と入力列の境界（縦線）を消す（HTML準拠）
    if (y == 0 or y == 1 or y == 3 or y == 4 or y == 5 or y == 6) {
      if x == 0 { s-right = none }
      if x == 1 { s-left = none }
    }

    // 写真との境界（入力列の右側）を太く（HTML準拠）
    if (y == 0 or y == 1) {
      if x == 1 { s-right = thick-stroke }
    }

    // 性別セルの上端は写真領域の下端として太く（HTML準拠）
    if x == 2 and y == 2 { s-top = thick-stroke }

    // 点線
    if (y == 0 or y == 3 or y == 5) { s-bottom = dotted-stroke }

    (top: s-top, bottom: s-bottom, left: s-left, right: s-right)
  },
   
  // 1行目: ふりがな
  left-valign(text(size: 8pt)[ふりがな]),
  left-valign(text(size: 8pt)[ #h(1em) #profile.at("name_kana", default: "") ]),
   
  // 写真セル (rowspan: 2)
  table.cell(rowspan: 2, stroke: none)[
    #let face = profile.at("face_image_path", default: "")
    #if face != "" {
      // 枠線に被らないよう右と下に2ptのマージンを入れる
      place(bottom + right, dx: -2pt, dy: -2pt,
        image(resolve-path(face), width: 30mm, height: 40mm, fit: "cover")
      )
    } else {
      align(center + horizon)[
        #text(size: 9pt, fill: gray)[写真を貼る位置\n(縦 36mm-40mm)\n(横 24mm-30mm)]
      ]
    }
  ],

  // 2行目: 氏名
  align(left + top)[
    #text(size: 14pt)[氏 名]
  ],
  table.cell(inset: 15pt)[
    #v(10pt)
    #text(size: 18pt)[ #profile.at("name", default: "") ]
  ],

  // 3行目: 生年月日
  table.cell(colspan: 2)[
      #let (y, m, d) = if "birthday" in profile {
        let parts = str(profile.birthday).split("-")
        // ▼ ここで 0 を取り除く処理を追加
        let clean-m = if parts.at(1).starts-with("0") { parts.at(1).slice(1) } else { parts.at(1) }
        let clean-d = if parts.at(2).starts-with("0") { parts.at(2).slice(1) } else { parts.at(2) }
        (parts.at(0), clean-m, clean-d)
      } else { ("   ", "   ", "   ") }

      #align(left + horizon)[
        #let y_label = format-year(y, m)
        #h(2em) #(y_label)年 #h(2em) #m 月 #h(2em) #d 日生 
        #if "age" in profile { [（満 #h(1em) #profile.age #h(1em) 歳）] }
      ]
  ],
  side-field("※性別", profile.at("gender", default: ""), value-size: 10pt),

  // 4行目: 現住所ふりがな
  left-valign(text(size: 8pt)[ふりがな]),
  left-valign(text(size: 8pt)[ #profile.at("address_kana", default: "") ]),
  block(inset: (top: 3pt, bottom: 3pt, left: 3pt, right: 3pt))[
    #align(left + horizon)[
      #text(size: 9pt)[電話]#h(0.3em)#text(size: 9pt)[#no-wrap-phone(profile.at("phone", default: ""))]
    ]
  ],

  // 5行目: 現住所
  table.cell(
    colspan: 2, // 元々2列だった分を結合して確保
    inset: 5pt, // 余白調整（必要に応じて）
    [
      // --- 1行目: 郵便番号 ---
      #align(left)[現住所　〒#profile.at("address_zip", default: "")]
      
      // --- 改行と少しの隙間 ---
      #v(3pt) 
      
      // --- 2行目: 住所本体 ---
      #text(size: 11pt)[#profile.at("address", default: "")]
    ]
  ),
  side-field("E-mail", profile.at("email", default: ""), value-size: 8pt),

  // 6行目: 連絡先ふりがな (省略時は「同上」など)
  left-valign(text(size: 8pt)[ふりがな]),
  left-valign(text(size: 8pt)[ #h(1em) #profile.at("contact_address_kana", default: "") ]),
  block(inset: (top: 3pt, bottom: 3pt, left: 3pt, right: 3pt))[
    #align(left + horizon)[
      #text(size: 9pt)[電話]#h(0.3em)#text(size: 9pt)[#no-wrap-phone(profile.at("contact_phone", default: ""))]
    ]
  ],
// 7行目: 連絡先
  table.cell(
    colspan: 2, // 2列分を結合
    [
       // --- 1行目: 郵便番号 ---
       #align(left)[連絡先　〒#profile.at("contact_zip", default: "")]
       
       // --- 改行と隙間 ---
       #v(3pt)
       
       // --- 2行目: 住所本体 ---
       #text(size: 11pt)[#profile.at("contact_address", default: "")]
    ]
  ),
  // 3列目: E-mail
  side-field("E-mail", profile.at("contact_email", default: ""), value-size: 8pt),
)

#v(5pt)

// --- 学歴・職歴データの構築 ---
#let history-items = ()

#let education = resume.at("education", default: ())
#let work = resume.at("work", default: ())

// 学歴
#history-items.push((year: "", month: "", content: align(center)[*学歴*]))
#for item in education {
  let (y, m) = parse-date(item.date)
  history-items.push((year: y, month: m, content: item.event))
}
#history-items.push((year: "", month: "", content: align(right)[以上]))
#history-items.push((year: "", month: "", content: "")) // 空行

// 職歴
#history-items.push((year: "", month: "", content: align(center)[*職歴*]))
#for item in work {
  let (y, m) = parse-date(item.date)
  // NOTE: セル内で改行すると行高が変わってしまうため、退社理由は同一行に連結する
  let content = item.event
  if "description" in item and item.description != "" {
    // 全角空白で区切って、1行で表示
    content = [#item.event　#text(size: 0.8em, fill: gray)[#item.description]]
  }
  history-items.push((year: y, month: m, content: content))
}
#history-items.push((year: "", month: "", content: align(right)[以上]))


// --- 学歴・職歴テーブル出力関数 ---
#let history-table(rows-count, start-index, title) = {
  // 表示するデータをスライス
  let len = history-items.len()
  let items = if start-index >= len {
    ()
  } else {
    let remaining = len - start-index
    let count = calc.min(rows-count, remaining)
    history-items.slice(start-index, count: count)
  }
   
  // 足りない行数を空データで埋める
  while items.len() < rows-count {
    items.push((year: "", month: "", content: ""))
  }

  table(
    columns: (60pt, 35pt, 1fr),
    stroke: (x, y) => {
      let top = thin-stroke
      let bottom = thin-stroke
      let left = thin-stroke
      let right = thin-stroke

      // 外枠（太線）
      if x == 0 { left = thick-stroke }
      if x == 2 { right = thick-stroke }
      if y == 0 { top = thick-stroke }
      if y == rows-count { bottom = thick-stroke }

      (top: top, bottom: bottom, left: left, right: right)
    },
    rows: (row-history-height,) * (rows-count + 1),
     
    // ヘッダー
    align(center + horizon)[年],
    align(center + horizon)[月],
    align(center + horizon)[#title],

    // データ行
    ..items.map(item => (
      align(center + horizon)[#item.year],
      align(center + horizon)[#item.month],
      align(left + horizon)[#item.content]
    )).flatten()
  )
}

// 1ページ目の学歴・職歴行数
// レイアウト維持のため、15行に戻します
#let rows-p1 = 15
#history-table(rows-p1, 0, "学歴・職歴 （各別にまとめて書く）")

#align(right)[
  #text(size: 9pt)[※「性別」欄：記載は任意です。未記載とすることも可能です。]
]

// ==========================================
// ページ 2
// ==========================================
#pagebreak()
#v(0pt) // 見開きで上端を揃えるため、余計な上余白を入れない

// 2ページ目の学歴・職歴 (続き)
#let rows-p2 = 6
#history-table(rows-p2, rows-p1, "学歴・職歴 （各別にまとめて書く）")

#v(5pt)

// --- 免許・資格テーブル ---
#let qual-rows = 6
#let qualifications = resume.at("qualifications", default: ())
#let qual-items = qualifications.map(item => {
  let (y, m) = parse-date(item.date)
  (year: y, month: m, content: item.name)
})
// 空行埋め
#while qual-items.len() < qual-rows {
  qual-items.push((year: "", month: "", content: ""))
}

#table(
  columns: (60pt, 35pt, 1fr),
  stroke: (x, y) => {
    let top = thin-stroke
    let bottom = thin-stroke
    let left = thin-stroke
    let right = thin-stroke

    if x == 0 { left = thick-stroke }
    if x == 2 { right = thick-stroke }
    if y == 0 { top = thick-stroke }
    if y == qual-rows { bottom = thick-stroke }

    (top: top, bottom: bottom, left: left, right: right)
  },
  rows: (row-history-height,) * (qual-rows + 1),
   
  align(center + horizon)[年],
  align(center + horizon)[月],
  align(center + horizon)[免許・資格],

  ..qual-items.map(item => (
    align(center + horizon)[#item.year],
    align(center + horizon)[#item.month],
    align(left + horizon)[#item.content]
  )).flatten()
)

#v(5pt)

// --- 自由記述欄 ---
#let big-box(height, title, content) = {
  rect(
    width: 100%,
    height: height,
    stroke: thick-stroke,
    inset: 10pt,
  )[
    #set align(top + left)
    #text(size: 10pt)[#title] \
    #v(5pt)
    #text(size: 11pt)[#content]
  ]
}

#big-box(164pt, "志望の動機、特技、好きな学科、アピールポイントなど", other.at("motivation", default: ""))

#v(5pt)

#big-box(134pt, "本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）", other.at("hopes", default: ""))