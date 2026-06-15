# LIFT LOG

OVLD系の「カレンダーから筋トレを記録する」体験に寄せた、ローカル保存の筋トレ管理PWAです。

## 起動

```powershell
node server.js
```

ブラウザで開きます。

```text
http://localhost:4173/?v=6
```

## できること

- カレンダーの日付ごとにトレーニングを記録
- 種目数の制限なし
- 胸、背中、肩、三頭、二頭、脚で種目を絞り込み
- 種目ごとの部位、色、ウェイト/自重種目、自重負荷率を設定
- デフォルト3セット表示で、セットごとの重量と回数を記録
- 前回セットの入力補助
- データは端末内の `localStorage` に保存
- PWA用 manifest / Service Worker / アイコンを同梱

## iPhoneで使う場合

SafariでHTTPS配信されたURLを開き、「共有」から「ホーム画面に追加」するとアプリ風に起動できます。

公開URL:

```text
https://7h4ztmv78w-rgb.github.io/lift-log/
```

`http://localhost:4173` はPC自身を指す開発用URLなので、iPhoneからは開けません。同じWi-Fi前提をやめるには、GitHub PagesなどのHTTPSホスティングに置きます。

## 同じWi-Fiなしで使う場合

このリポジトリは `gh-pages` ブランチでGitHub Pagesへ公開します。

更新時は以下を実行します。

```bash
npm run build
git subtree split --prefix www -b gh-pages
git push -f origin gh-pages
```

iPhoneでは公開URLをSafariで開き、共有ボタン → `ホーム画面に追加` を選びます。

以後は同じWi-Fiにいなくても開けます。データはiPhone側のSafari/PWA内 `localStorage` に保存されます。

注意: GitHub Pagesに置いても、筋トレ記録データはサーバーへ送信しません。アプリ本体だけがHTTPSで配信され、記録は端末内に残ります。

## iOSアプリとしてビルドする場合

CapacitorのiOSプロジェクトを `ios/` に生成済みです。Windows上ではXcodeが使えないため、実機インストールやApp Store向けビルドはMacで行います。

Mac側でこのフォルダを開いたあと、以下を実行します。

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Xcodeが開いたら、Signing Teamを設定して実機へRunします。

Web側を更新したら、毎回以下でiOSプロジェクトへ反映します。

```bash
npm run cap:sync
```

## 注意

OVLDの名称、アイコン、スクリーンショット、固有UIをコピーしたものではありません。公開情報から読み取れる使い勝手に寄せた別実装です。
