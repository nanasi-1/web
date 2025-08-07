import { KeyRound, Lock, Code2, type LucideIcon, SquareCheck, Pin, CircleCheck, Music2, Lightbulb, Copy, GraduationCap } from "lucide-react";
import { Link } from "react-router";

export function Welcome() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col items-center justify-center pt-16 pb-16 px-4">
        <div className="text-center flex flex-col gap-y-4 text-xl leading-10">
          <h1 className="text-2xl">web/nanasi-1</h1>
          <p>
            このサイトは<a target="_blank" href="https://github.com/nanasi-1">nanasi-1</a>が作ったWebアプリ置き場です。<br />
            内容は雑多で、クイズゲームだったり便利ツールだったりします。<br />
          </p>
          <p>
            ...なんて書きましたが、大半はClaudeが作ってます。<br />
            ロジックもUIも考える必要がないので気楽にできて楽しいです。<br />
          </p>
          <p>
            もともとは自分用だったのですが、<br />
            誰かの役に立てたら嬉しいので公開することにしました。<br />
            よければ暇つぶしに見ていってください。<br />
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl mb-8 text-center">アプリ一覧</h2>
          <ul className="grid lg:grid-cols-3 gap-10">
            {apps.map(app => <AppCard {...app} />)}
          </ul>
        </div>
      </main>
    </div>
  );
}

interface MyApp {
  title: string,
  path: string,
  desc: string,
  icons: readonly LucideIcon[]
}

const apps: readonly MyApp[] = [
  { title: '暗号化ツール', path: "easy-crypto", desc: "文章を簡単に暗号化", icons: [KeyRound, Lock] },
  { title: 'Hello World Quiz', path: "hello-world-quiz", desc: "言語を当てる（複数選択）", icons: [Code2, SquareCheck] },
  { title: 'Hit & Blow', path: "hit-and-blow", desc: 'ターン数制限なし', icons: [Pin, CircleCheck] },
  { title: '音階当てゲーム', path: "guess-the-note", desc: 'あなたに絶対音感はある？', icons: [Music2, Lightbulb] },
  { title: '暗記カード', path: 'flash-card', desc: '登録不要で使える暗記アプリ', icons: [Copy, GraduationCap]}
]

function AppCard({ title, path, desc, icons }: MyApp) {
  return (
    <Link to={path} className="hover:border-none hover:scale-105 shadow-lg transition-all">
      <li className="border-2 rounded-lg text-gray-700 border-gray-500 w-64 hover:border-gray-800">
        <div className="flex gap-x-3 h-32 justify-center items-center bg-gray-100 rounded-lg text-gray-500">
          {icons.map(I => <I size={50} />)}
        </div>
        <div className="mx-5 my-4">
          <h3 className="text-lg mb-1 truncate">
            <span className="font-bold">{title}</span>
          </h3>
          <p className="text-md truncate">{desc}</p>
        </div>
      </li>
    </Link>
  )
}