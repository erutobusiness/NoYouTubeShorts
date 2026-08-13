# Chrome ウェブストア 掲載文

ダッシュボードの入力欄にそのまま貼れる形で置いてある。
⚠ 文字数の上限はストア側の仕様。編集したら数え直すこと。

## アイテム名（上限 45 文字）

```
NoYouTubeShorts
```

## 概要 / Summary（上限 132 文字）

```
YouTube から Shorts への導線を隠し、Shorts を開いても通常の YouTube へ戻します。隠す場所は項目ごとにオンオフできます。
```

英語版:

```
Hides Shorts from YouTube and sends Shorts URLs back to the normal site. Every part can be switched on or off individually.
```

## 詳細な説明（上限 16,000 文字）

```
YouTube から Shorts を見えなくする拡張機能です。

■ できること

・左メニューの「ショート」を隠す
・ホームの Shorts 棚を隠す
・検索結果の Shorts を隠す
・関連動画と登録チャンネルの Shorts を隠す
・Shorts を開いたら通常の YouTube へ戻す

5 つとも独立してオンオフできます。ツールバーのアイコンから切り替えると、
開いている YouTube のタブにすぐ反映されます。再読み込みは要りません。

■ 求める権限は「storage」だけです

設定値の保存にしか使いません。閲覧履歴を読む権限は求めません。
インストール時に「閲覧履歴の読み取り」という警告は出ません。

■ 集めるデータはありません

設定はブラウザの中に保存されるだけで、どこにも送信しません。
解析も広告も入っていません。

■ 仕組み

YouTube のページに CSS を当てて、Shorts への導線を隠します。
要素を削除するのではなく隠すので、ページの動作を壊しません。
Shorts の URL を開いた場合は、通常の YouTube に戻します。
YouTube 内でリンクを押した場合にも働きます。

■ 注意

YouTube の作りが変わると、隠しきれなくなることがあります。
気づいたら更新しますが、見つけたら教えてもらえると助かります。
```

英語版:

```
Removes Shorts from YouTube.

■ What it does

・Hides the Shorts entry in the left navigation
・Hides the Shorts shelf on the home feed
・Hides Shorts in search results
・Hides Shorts in the watch-page sidebar and the subscriptions feed
・Sends Shorts URLs back to the normal YouTube site

All five are independent switches. Changing one from the toolbar popup applies
to any open YouTube tab straight away — no reload needed.

■ It asks for one permission: storage

Only to remember your switches. It does not ask to read your browsing history,
so no such warning appears when you install it.

■ It collects nothing

Settings stay in your browser and are never sent anywhere. No analytics, no ads.

■ How it works

It applies CSS to the YouTube page to hide the paths that lead to Shorts.
Elements are hidden rather than deleted, so the page keeps working. Opening a
Shorts URL sends you back to the normal site, including when the link is clicked
from inside YouTube.

■ Note

When YouTube changes its markup, some entry points may reappear. Reports are
welcome.
```

## カテゴリ

```
ユーザー補助 / Accessibility
```

生産性（Productivity）でも通る。⚠ 迷うなら「ユーザー補助」を選ぶ。
「見たくないものを見ないようにする」用途はこちらの方が説明しやすい。

## 単一用途の説明（Single purpose）

ストアが必須で聞いてくる項目。1 つの目的しか持たないことを述べる。

```
YouTube 上の Shorts への導線を隠し、Shorts の URL を通常の YouTube へ
戻すこと。それ以外の機能は持ちません。
```

```
Hiding YouTube's Shorts entry points and redirecting Shorts URLs back to the
normal site. The extension does nothing else.
```

## 権限の正当化（Permission justification）

`storage`:

```
利用者が選んだ 5 つの切り替え（どこを隠すか、リダイレクトするか）を
保存するためだけに使います。
```

```
Used solely to store the five switches the user sets: which Shorts entry points
to hide, and whether to redirect Shorts URLs.
```

ホスト権限（`https://www.youtube.com/*`・`https://m.youtube.com/*`）:

```
Shorts への導線を隠す CSS を YouTube のページに適用し、Shorts の URL を
判定してリダイレクトするために必要です。他のサイトでは動作しません。
```

```
Needed to apply the hiding CSS on YouTube pages and to recognise Shorts URLs for
the redirect. The extension does not run on any other site.
```

## データ利用の申告（Privacy practices）

すべて「収集しない」で申告する。

- 個人を特定できる情報: 収集しない
- 健康情報 / 財務情報 / 認証情報: 収集しない
- 個人的な通信 / 位置情報: 収集しない
- ウェブ閲覧履歴: **収集しない**（`tabs` 権限を持たないため技術的にも取得できない）
- ユーザーの操作履歴: 収集しない
- ウェブサイトのコンテンツ: 収集しない

以下の3点にチェックを入れる。

- 販売しない
- 第三者に提供しない
- 承認された用途以外に使わない

## スクリーンショット

同じディレクトリの PNG をそのまま使える（1280×800）。

| ファイル | 内容 |
| - | - |
| `01-popup.png` | 設定画面。5 つの切り替え |
| `02-youtube-with-extension.png` | 拡張あり。Shorts が出ていない |
| `03-youtube-without-extension.png` | 拡張なし。比較用 |

⚠ **上げる前に中身を見ること。** YouTube の実ページを撮っているので、
実在のサムネイルとチャンネル名が写り込む。都合が悪いものが入っていたら
`scripts/make-screenshots.mjs` の `SEARCH` の検索語を変えて撮り直す。
