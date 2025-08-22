import { ArrowLeftRight, Check, CheckCircle2, FishSymbol, Trash, X } from "lucide-react";
import { useCallback, useLayoutEffect, useState } from "react";

// 列の定義データ（敵のHPマップ）
const cols = new Map<string, number | Map<string, number>>([
  ["最大ダメージ", 10],
  ["シャケ / タマヒロイ", 100],
  ["コジャケ", 40],
  ["ドスコイ", 400],
  ["バクダン", 300],
  ["ヘビ", 500],
  ["コウモリ", new Map([["本体", 1200], ["雨玉", 100]])],
  ["テッパン", new Map([["スタン", 600], ["本体", 500]])],
  ["モグラ", 1200],
  ["ダイバー", new Map([["本体", 1200], ["飛び込み失敗時", 300]])],
  ["タワー", 60],
  ["テッキュウ", 1200],
  ["ナベブタ", 500],
  ["ハシラ", 32],
  ["狂シャケ", 50],
  ["キンシャケ（ラッシュ / 霧）", 500],
  ["グリル", new Map([["本体", 2200], ["スタン", 400.1]])],
  ["キンシャケ（間欠泉）", 6500],
  ["シャケコプター", 50],
]);

const rows = new Map([
  ["シャケの体力", 1],
  ["ボールドマーカー", 45],
  ["わかばシューター", 28],
  ["シャープマーカー", 28],
  ["プロモデラーMG", 24],
  ["スプラシューター", 36],
  [".52ガロン", 52],
  ["N-ZAP85", 30],
  ["スペースシューター", 30],
  ["プライムシューター", 45],
  [".96ガロン", 85],
  ["ジェットスイーパー", 40],
  ["ノヴァブラスター", 200],
  ["ホットブラスター", 200],
  ["ロングブラスター", 250],
  ["クラッシュブラスター", 85],
  ["ラピッドブラスター", 140],
  ["Rブラスターエリート", 150],
  ["S-BLAST92", 300],
  ["L3リールガン", 40],
  ["H3リールガン", 70],
  ["ボトルガイザー", 50],
  ["カーボンローラー", 160],
  ["ワイドローラー", 160],
  ["スプラローラー", 200],
  ["ダイナモローラー", 300],
  ["ヴァリアブルローラー", 300],
  ["パブロ", 36],
  ["ホクサイ", 60],
  ["フィンセント", 150],
  ["スクイックリンα", 300],
  ["スプラチャージャー", 300],
  ["リッター4K", 600],
  ["14式竹筒銃・甲", 160],
  ["R-PEN/5H", 240],
  ["ソイチューバー", 300],
  ["バケットスロッシャー", 140],
  ["ヒッセン", 100],
  ["スクリュースロッシャー", 170],
  ["オーバーフロッシャー", 240],
  ["エクスプロッシャー", 200],
  ["モップリン", 250],
  ["スプラスピナー", 35],
  ["バレルスピナー", 35],
  ["ハイドラント", 60],
  ["クーゲルシュライバー", 35],
  ["ノーチラス47", 35],
  ["イグザミナー", 35],
  ["スパッタリー", 40],
  ["スプラマニューバー", 30],
  ["ケルビン525", 70],
  ["デュアルスイーパー", 30],
  ["クアッドホッパーブラック", 30],
  ["ガエンFF", 40],
  ["パラシェルター", 180],
  ["キャンピングシェルター", 360],
  ["スパイガジェット", 150],
  ["24式張替傘・甲", 210],
  ["トライストリンガー", 450],
  ["LACT-450", 210],
  ["フルイドV", 600],
  ["ジムワイパー", 400],
  ["ドライブワイパー", 325],
  ["デンタルワイパーミント", 450],
  ["クマサン印のブラスター", 50],
  ["クマサン印のチャージャー", 200],
  ["クマサン印のスロッシャー", 360],
  ["クマサン印のシェルター", 80],
  ["クマサン印のストリンガー", 1350],
  ["クマサン印のワイパー", 1200],
  ["クマサン印のマニューバー", 35],
  ["クマサン印のローラー", 600],
]);

const questionCount = rows.size * 23

function calcCorrect(colKey: string, rowKey: string, subKey: string | void) {
  if (colKey === '最大ダメージ') return rows.get(rowKey)

  const correct = typeof subKey === 'string'
    ? (cols.get(colKey) as Map<string, number>).get(subKey)! / rows.get(rowKey)!
    : cols.get(colKey) as number / rows.get(rowKey)!
  return Math.ceil(correct);
}

function checkCorrect(userAnswer: string | void, colKey: string, rowKey: string, subKey: string | void) {
  if (userAnswer === void 0) return false
  const answer = Number(userAnswer)
  return answer === calcCorrect(colKey, rowKey, subKey)
}

function Title({ answers }: { answers: Record<string, string> }) {
  const correctCount = Object.entries(answers).filter(([key, answer]) => {
    return checkCorrect(answer, ...key.split("-") as [string, string])
  }).length
  return (
    <div className="fixed w-full flex flex-row items-center z-30 h-15 bg-white">
      <h1 className="text-xl mx-4 top-0 left-0">
        <FishSymbol className="inline-block text-orange-500 rotate-180 mr-1" size={25}/>
        <span>サーモンラン 確定数百マス計算</span>
      </h1>
      <p className="text-sm text-gray-500">全てのシャケに対する全てのブキの確定数を百マス計算にしました。暗記などにご活用ください。</p>
      <span className="text-xl ml-3 border-2 border-green-600 rounded pr-3 pl-2 py-1 absolute right-5">
        <CheckCircle2 className="inline mr-1 text-green-600" size={22} />
        <span className="text-green-600">{correctCount}</span>
        <span className="text-gray-400 text-sm"> / {questionCount}</span>
      </span>
    </div>
  )
}

export default function App() {
  // ユーザーの入力を保持
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showAnswerMode, setShowAnswerMode] = useState(false)

  useLayoutEffect(() => {
    const answers = localStorage.getItem('salmon-squares')
    if (!answers) return
    setAnswers(JSON.parse(answers))
  }, [])

  const handleChange = useCallback((key: string, value: string) => {
    setAnswers((prev) => {
      localStorage.setItem('salmon-squares', JSON.stringify({ ...prev, [key]: value }))
      return { ...prev, [key]: value }
    });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Title answers={answers} />
      <table className="border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="p-2 bg-gray-200 sticky top-15 left-0 z-20 border-r-2 border-b-2 border-gray-300">ブキ \ シャケ</th>
            {[...cols.keys()].map((colKey) => (
              <th key={colKey} className="border-r-2 border-b-2 border-gray-300 p-2 bg-green-100 sticky top-15 left-0 z-10">
                {colKey}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="relative top-15">
          {[...rows.keys()].map((rowKey) => (
            <tr key={rowKey}>
              <td className="border-r-2 border-b-2 border-gray-300 px-3 py-1 whitespace-nowrap bg-orange-50 sticky left-0 z-10">{rowKey}</td>
              {[...cols.entries()].map(([colKey, colVal]) => {
                if (colVal instanceof Map) {
                  return (
                    <td key={colKey} className="border-r-2 border-b-2 border-gray-300 p-2 whitespace-nowrap">
                      {[...colVal.entries()].map(([subKey, num1]) => {
                        const key = `${colKey}-${rowKey}-${subKey}`;
                        return <MultiCellInput
                          key={key}
                          rowKey={rowKey} colKey={colKey} subKey={subKey}
                          userAnswer={answers[key]} handleChange={handleChange}
                          showAnswerMode={showAnswerMode}
                        />
                      })}
                    </td>
                  );
                } else {
                  const key = `${colKey}-${rowKey}`;
                  return <SingleCell key={key} rowKey={rowKey} colKey={colKey} userAnswer={answers[key]} handleChange={handleChange} showAnswerMode={showAnswerMode} />
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="relative top-15 px-10 py-10">
        <h2 className="text-xl font-bold mb-4">メニュー</h2>
        <button className="border-2 text-gray-600 rounded px-4 py-2 mr-3" onClick={() => setShowAnswerMode(prev => !prev)}>
          <ArrowLeftRight className="inline mr-1" size={20}  />
          {showAnswerMode ? "回答モードに変更" : "答えを表示モードに変更"}
        </button>
        <button 
          className="border-2 rounded px-5 py-2 text-red-500 font-bold"
          onClick={() => {
            if (!confirm("全ての回答をリセットしますか？")) return
            setAnswers({})
          }}
        >
          <Trash className="inline mr-1" size={20} />
          回答をリセット
        </button>
        <h2 className="text-xl font-bold my-4">クレジット</h2>
        <ul className="list-disc ml-4 mb-3">
          <li>シャケの体力データ：<a href="https://wikiwiki.jp/splatoon3mix/サーモンラン" target="_blank">splatoon3 - スプラトゥーン3 攻略＆検証 Wiki</a></li>
          <li>ブキのダメージデータ：<a href="https://docs.google.com/spreadsheets/d/168qO9AH610QpthtRDrh0-YAvip3fxM77xmsnqfPFf1A/edit?gid=135583451#gid=135583451" target="_blank">【サーモンランNW】ブキ関係データ</a></li>
        </ul>
        <p>データは勝手ながら上記リンクから取ってきました。</p>
      </div>
    </div>
  );
}

const SingleCell = ({ colKey, rowKey, userAnswer, handleChange, showAnswerMode }: {
  colKey: string
  rowKey: string
  userAnswer: string
  handleChange: (key: string, input: string) => void
  showAnswerMode: boolean
}) => {
  const key = `${colKey}-${rowKey}`;
  const isCorrect = checkCorrect(userAnswer, colKey, rowKey)
  return (
    <td key={colKey} className={`border-r-2 border-b-2 border-gray-300 px-3 py-1 whitespace-nowrap`}>
      { showAnswerMode ? <span>{calcCorrect(colKey, rowKey)}</span>
      : <input
        type="number"
        value={userAnswer || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className={`w-16 px-2 py-1 rounded no-spin ${isCorrect ? 'bg-green-100' : userAnswer ? 'bg-red-100' : 'bg-gray-100'}`}
        id={key} name={key} min={0}
        onFocus={(e) =>
          e.target.addEventListener(
            'wheel',
            (e) => { e.preventDefault(); },
            { passive: false }
          )}
      />
      }
      <span className="text-sm pl-1">{colKey === "最大ダメージ" ? 'ダメージ' : rowKey === 'シャケの体力' ? 'HP' : '確'}</span>
      <span className={`w-16 pl-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
        {userAnswer ? isCorrect ? <Check size={20} className="inline" /> : <X size={20} className="inline" /> : null}
      </span>
      {rowKey === 'シャケの体力' && colKey === '最大ダメージ' && <span className="text-sm text-gray-600"><br />※ここは1と回答</span>}
    </td>
  );
}

const MultiCellInput = ({ colKey, rowKey, subKey, userAnswer, handleChange, showAnswerMode }: {
  colKey: string
  rowKey: string
  subKey: string
  userAnswer: string
  handleChange: (key: string, input: string) => void
  showAnswerMode: boolean
}) => {
  const key = `${colKey}-${rowKey}-${subKey}`;
  const isCorrect = checkCorrect(userAnswer, colKey, rowKey, subKey)
  return (
    <div key={subKey} className="mb-1 flex items-center justify-end space-x-2 relative pr-3">
      <label className="text-xs block" htmlFor={key}>{subKey}</label>
      { showAnswerMode ? <span>{calcCorrect(colKey, rowKey, subKey)}</span> : <input
        type="number"
        value={userAnswer || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className={`w-16 rounded px-2 py-1 no-spin ${isCorrect ? 'bg-green-100' : userAnswer ? 'bg-red-100' : 'bg-gray-100'}`}
        id={key} name={key} min={0}
        onFocus={(e) =>
          e.target.addEventListener(
            'wheel',
            (e) => { e.preventDefault(); },
            { passive: false }
          )}
      />}
      <span className="text-sm">{rowKey === 'シャケの体力' ? 'HP' : '確'}</span>
      <span className={`absolute right-0 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
        {userAnswer ? isCorrect ? <Check size={20} className="inline" /> : <X size={20} className="inline" /> : null}
      </span>
    </div>
  );
}

export function meta() {
  return [
    { title: '確定数百マス計算【サーモンラン】' }
  ]
}