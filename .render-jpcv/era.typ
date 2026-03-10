// era.typ
// 和暦（元号）定義と年のフォーマッタ
//
// ここだけ更新すれば、改元があってもテンプレ本体を触らずに対応できます。
// NOTE: 本テンプレでは学歴職歴などが YYYY-MM のため、月単位で境界判定します。

#let eras = (
  (
    name: "令和",
    start: (year: 2019, month: 5),
    base_year: 2018,
  ),
  (
    name: "平成",
    start: (year: 1989, month: 1),
    base_year: 1988,
  ),
  // 必要なら追加:
  // (
  //   name: "昭和",
  //   start: (year: 1926, month: 12),
  //   base_year: 1925,
  // ),
)

#let _at_or_default(v, d) = if v == none { d } else { v }

#let _cmp_ym(a, b) = {
  // a,b: (year, month)
  if a.year > b.year { 1 }
  else if a.year < b.year { -1 }
  else if a.month > b.month { 1 }
  else if a.month < b.month { -1 }
  else { 0 }
}

#let format_wareki_year(year, month) = {
  if year == none or year == "" {
    ""
  } else {
    let y = eval(str(year))
    let m = eval(str(_at_or_default(month, 1)))
    let ym = (year: y, month: m)

    // eras は新しい順に並べる
    for era in eras {
      if _cmp_ym(ym, era.start) >= 0 {
        return era.name + str(y - era.base_year)
      }
    }

    // 定義より前は西暦のまま
    str(y)
  }
}
