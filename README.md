# web/nanasi-1

## About
これは[私のWebサイト](https://nanasi-1.github.io/web)です。

このサイトはnanasi-1が作ったWebアプリ置き場です。
内容は雑多で、クイズゲームだったり便利ツールだったりします。

## 技術構成
- React Router v7
- GitHub Pagesでデプロイ

単純なSPAです。

## 開発

開発サーバーの起動:
```sh
bun install
bun run dev
```

ビルド:
```sh
bun run build # react-router build が走る
```

この際、環境変数`PUBLIC_URL`を設定しておくと、そのパスをベースとしてビルドされます。

ビルドをローカルで確かめたい場合:

```sh
bun run start # vite previewが走る
```