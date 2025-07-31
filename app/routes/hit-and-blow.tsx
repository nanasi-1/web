import { useState, useEffect } from 'react';

// 色をTailwindの色クラスとして定義
const COLORS: readonly Color[] = [
  { name: '赤', bgClass: 'bg-red-500', textClass: 'text-red-500' },
  { name: '青', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
  { name: '緑', bgClass: 'bg-green-500', textClass: 'text-green-500' },
  { name: '黄', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
  { name: '紫', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
  { name: '橙', bgClass: 'bg-orange-500', textClass: 'text-orange-500' }
];

const CODE_LENGTH = 4;

interface Color {
  readonly name: string,
  readonly bgClass: `bg-${string}-${number}`,
  readonly textClass: `text-${string}-${number}`,
}

interface HistoryEntry {
  readonly guess: Color[]
  readonly hits: number
  readonly blows: number
  readonly attemptNumber: number
}

const countHitAndBlow = (secret: readonly Color[], guess: readonly Color[]) => {
  let hits = 0
  let blows = 0

  // TODO 型定義考え直す
  const codeCopy = [...secret] as any;
  const guessCopy = [...guess] as any;

  // First count hits
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== '' && guessCopy[i].name === codeCopy[i].name) {
      hits++;
      guessCopy[i] = null;
      codeCopy[i] = null;
    }
  }

  // Then count blows
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== null && guessCopy[i] !== '') {
      for (let j = 0; j < CODE_LENGTH; j++) {
        if (codeCopy[j] !== null && guessCopy[i].name === codeCopy[j].name) {
          blows++;
          codeCopy[j] = null;
          break;
        }
      }
    }
  }

  return { hits, blows }
}

const ColorSelector = ({ onSelect, onCheck, onClear, disabled, currentGuess }: {
  onSelect: (emptyIndex: number, color: Color) => void
  onCheck: () => void
  onClear: () => void
  currentGuess: readonly ("" | Color)[]
  disabled: boolean
}) => {
  return (
    <div className="w-full mb-6">
      <h2 className="font-semibold mb-1">現在の予想:</h2>
      <div className="flex justify-center gap-2 mb-4">
        {currentGuess.map((color, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center ${color ? color.bgClass : 'bg-white'}`}
          >
            {!color && <span className="text-gray-400">?</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        {COLORS.map((color) => (
          <button
            key={color.name}
            className={`w-full py-2 rounded text-white text-md font-medium ${color.bgClass}`}
            onClick={() => {
              const emptyIndex = currentGuess.indexOf('');
              if (emptyIndex !== -1) {
                onSelect(emptyIndex, color);
              }
            }}
            disabled={disabled || !currentGuess.includes('')}
          >
            {color.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          onClick={onCheck}
          disabled={disabled || currentGuess.includes('')}
        >
          チェック
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          onClick={onClear}
          disabled={disabled || currentGuess.every(c => c === '')}
        >
          クリア
        </button>
      </div>
    </div>
  )
}

const GuessHistory = ({ history }: {
  history: readonly HistoryEntry[]
}) => {
  // コンポーネント分けめんどいからこれでいいや
  const thClass = "border border-gray-300 p-2"
  const tdClass = "border border-gray-300 p-2"

  return (
    <div className="w-full">
      <h2 className="font-semibold mb-2">履歴:</h2>
      {history.length > 0 ? (
        <table className="w-full border-collapse border-blue-500">
          <thead>
            <tr className="bg-gray-200">
              <th className={`${thClass} text-left`}>No.</th>
              <th className={`${thClass} text-left`}>予想</th>
              <th className={`${thClass} text-center`}>Hit</th>
              <th className={`${thClass} text-center`}>Blow</th>
            </tr>
          </thead>
          <tbody>
            {history.toReversed().map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={tdClass}>{entry.attemptNumber}</td>
                <td className={tdClass}>
                  <div className="flex gap-1">
                    {entry.guess.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className={`w-6 h-6 rounded-full ${color.bgClass}`}
                      />
                    ))}
                  </div>
                </td>
                <td className={`${tdClass} text-center`}>{entry.hits}</td>
                <td className={`${tdClass} text-center`}>{entry.blows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 italic">まだ予想はありません</p>
      )}
    </div>
  )
}

const Won = ({ count, startTime, endTime }: {
  count: number,
  startTime: number | null
  endTime: number | null
}) => {
  const getTimeTaken = () => {
    if (!startTime || !endTime) return '0';
    return ((endTime - startTime) / 1000).toFixed(1);
  };
  return (
    <div className="bg-green-100 p-3 rounded border border-green-300">
      <p className="text-green-700 font-bold">おめでとうございます！正解です！</p>
      <p className="text-green-700">試行回数: {count}回</p>
      <p className="text-green-700">所要時間: {getTimeTaken()}秒</p>
    </div>
  )
}

const HitAndBlowGame = () => {
  const [secretCode, setSecretCode] = useState<Color[]>([]);
  const [currentGuess, setCurrentGuess] = useState<(Color | '')[]>(Array(CODE_LENGTH).fill(''));
  const [guessHistory, setGuessHistory] = useState<readonly HistoryEntry[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Generate a random secret code on component mount
  useEffect(() => {
    generateNewCode();
  }, []);

  const generateNewCode = () => {
    const newCode = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * COLORS.length);
      newCode.push(COLORS[randomIndex]);
    }
    setSecretCode(newCode);
    setCurrentGuess(Array(CODE_LENGTH).fill(''));
    setGuessHistory([]);
    setGameWon(false);
    setStartTime(Date.now());
    setEndTime(null);
  };

  const handleColorSelect = (index: number, color: Color) => {
    if (gameWon) return;

    const newGuess = [...currentGuess];
    newGuess[index] = color;
    setCurrentGuess(newGuess);
  };

  const checkGuess = () => {
    if (currentGuess.includes('')) return;
    const { hits, blows } = countHitAndBlow(secretCode, currentGuess as readonly Color[])

    const newHistoryEntry = {
      guess: [...currentGuess] as Color[],
      hits,
      blows,
      attemptNumber: guessHistory.length + 1
    } satisfies HistoryEntry;

    setGuessHistory([...guessHistory, newHistoryEntry]);
    setCurrentGuess(Array(CODE_LENGTH).fill(''));

    if (hits === CODE_LENGTH) {
      setGameWon(true);
      setEndTime(Date.now());
    }
  };

  return (
    <div className='w-screen min-h-screen flex items-center justify-center'>
      <div className="flex flex-col items-center px-4 py-5 w-full max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold mb-4">Hit & Blow</h1>

        {/* Game status */}
        <div className="w-full mb-4 text-center">
          {gameWon ? (
            <Won
              count={guessHistory.length}
              startTime={startTime}
              endTime={endTime}
            />
          ) : (
            <p>
              シンプルな<a href='https://ja.wikipedia.org/wiki/マスターマインド'>Hit & Blow</a>です。<br />
              時間制限はないのでごゆっくりお楽しみください。<br />
            </p>
          )}
        </div>

        {/* Color selector */}
        <ColorSelector
          onSelect={handleColorSelect}
          onCheck={checkGuess}
          onClear={() => setCurrentGuess(Array(CODE_LENGTH).fill(''))}
          disabled={gameWon}
          currentGuess={currentGuess}
        />

        {/* History table */}
        <GuessHistory history={guessHistory} />

        {/* New game button */}
        <button
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded font-medium"
          onClick={generateNewCode}
        >
          新しいゲームを始める
        </button>
      </div>
    </div>
  );
};

export default HitAndBlowGame;

export function meta() {
  return [
    { title: 'Hit & Blow' }
  ]
}