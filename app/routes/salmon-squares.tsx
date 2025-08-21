import { memo, useCallback, useState } from "react";

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

export default function App() {
  // ユーザーの入力を保持
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleChange = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-xl mb-4">サーモンラン 確定数百マス計算</h1>
      <table className="border-collapse border">
        <thead>
          <tr>
            <th className="border-2 border-gray-300 p-2">ブキ / シャケ</th>
            {[...cols.keys()].map((colKey) => (
              <th key={colKey} className="border-2 border-gray-300 p-2">
                {colKey}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...rows.keys()].map((rowKey) => (
            <tr key={rowKey}>
              <td className="border-2 border-gray-300 px-3 py-1 whitespace-nowrap">{rowKey}</td>
              {[...cols.entries()].map(([colKey, colVal]) => {
                if (colVal instanceof Map) {
                  return (
                    <td key={colKey} className="border-2 border-gray-300 p-2 whitespace-nowrap">
                      {[...colVal.entries()].map(([subKey, num1]) => {
                        const key = `${rowKey}-${colKey}-${subKey}`;
                        return <MultiCellInput
                          key={key}
                          rowKey={rowKey} colKey={colKey} subKey={subKey}
                          num1={num1} num2={rows.get(rowKey)!}
                          userAnswer={answers[key]} handleChange={handleChange}
                        />
                      })}
                    </td>
                  );
                } else {
                  const key = `${rowKey}-${colKey}`;
                  return <SingleCell key={key} rowKey={rowKey} colKey={colKey} num1={colVal} num2={rows.get(rowKey)!} userAnswer={answers[key]} handleChange={handleChange} />
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SingleCell = memo(({ colKey, rowKey, num1, num2, userAnswer, handleChange }: {
  colKey: string
  rowKey: string
  num1: number
  num2: number
  userAnswer: string
  handleChange: (key: string, input: string) => void
}) => {
  const key = `${rowKey}-${colKey}`;
  const correct = colKey === "最大ダメージ" ? num2 : Math.ceil(num1 / num2);;
  const isCorrect = userAnswer !== undefined && Number(userAnswer) === correct;
  return (
    <td key={colKey} className={`border-2 border-gray-300 px-3 py-1 whitespace-nowrap`}>
      <input
        type="number"
        value={userAnswer || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className={`w-16 border px-3 py-1 rounded border-gray-500 ${isCorrect ? 'bg-green-100' : userAnswer ? 'bg-red-100' : 'bg-gray-50'}`}
      />
      <span className="pl-1 text-sm">確</span>
      <span className={(isCorrect ? "text-green-600" : "text-red-600") + ' w-16 pl-2'}>
        {userAnswer ? isCorrect ? "✓" : "✗" : ''}
      </span>
    </td>
  );
})

const MultiCellInput = memo(({ colKey, rowKey, subKey, num1, num2, userAnswer, handleChange }: {
  colKey: string
  rowKey: string
  subKey: string
  num1: number
  num2: number
  userAnswer: string
  handleChange: (key: string, input: string) => void
}) => {
  const key = `${rowKey}-${colKey}-${subKey}`;
  const correct = colKey === "0" ? num2 : Math.ceil(num1 / num2);
  const isCorrect = userAnswer !== undefined && Number(userAnswer) === correct;
  return (
    <div key={subKey} className="mb-1 flex items-center justify-end space-x-2 relative pr-3">
      <label className="text-xs block">{subKey}</label>
      <input
        type="number"
        value={userAnswer || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className={`w-16 border border-gray-500 rounded px-3 py-1 ${isCorrect ? 'bg-green-100' : userAnswer ? 'bg-red-100' : 'bg-gray-50'}`}
      />
      <span className="text-sm">確</span>
      <span className={isCorrect ? "text-green-600" : "text-red-600" + ' absolute right-0'}>
        {userAnswer ? isCorrect ? "✓" : "✗" : ''}
      </span>
    </div>
  );
})