interface FlashCard {
  id: number;
  question: string;
  answer: string;
}

const STORAGE_KEY = 'flash-card'

import { useEffect, useRef, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, RotateCcw, BookOpen, Edit, ArrowLeft } from 'lucide-react';

export default function FlashcardApp() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'create', 'study'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const addCard = (newCard: FlashCard) => {
    const newCards = [...cards, newCard]
    setCards(newCards)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards))
  }

  useEffect(() => {
    const items = localStorage.getItem(STORAGE_KEY)
    if (!items) return
    setCards(JSON.parse(items))
  }, [])

  const startStudy = () => {
    if (cards.length > 0) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setCurrentScreen('study');
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (isFlipped) nextCard()
  };

  const nextCard = () => {
    if (cards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (cards.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
      setIsFlipped(false);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cards[currentCardIndex];

  // ホーム画面
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">暗記カード</h1>
          <p className="text-gray-900">問題と解答を作成して学習しよう</p>
        </div>

        {/* メニューボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => setCurrentScreen('create')}
            className="flex items-center justify-center gap-3 px-8 py-4 border-2 text-blue-500 bg-white rounded-xl hover:text-blue-600 transition-colors text-lg font-semibold shadow-md"
          >
            <Plus size={28} />
            カードを作成
          </button>

          <button
            onClick={startStudy}
            disabled={cards.length === 0}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br to-violet-500 from-blue-600 text-white rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold shadow-md"
          >
            <BookOpen size={28} />
            学習を開始
          </button>
        </div>

        {currentScreen === 'create' ? <CreateScreen
          setCurrentScreen={setCurrentScreen}
          setCards={addCard}
        /> : null}

        {/* カード一覧 */}
        {cards.length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">作成済みカード一覧</h3>
            <div className="grid gap-3 mb-8">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">問題:</div>
                      <div className="text-gray-800 mb-2 line-clamp-2">{card.question}</div>
                      <div className="text-sm text-gray-500 mb-1">解答:</div>
                      <div className="text-gray-600 line-clamp-2">{card.answer}</div>
                    </div>
                    <div className="text-sm text-gray-400 ml-4">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* 統計情報 */}
            <div className="flex gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-md min-w-30">
                <div className="text-3xl font-bold text-blue-500 mb-2">{cards.length}</div>
                <div className="text-gray-600">総カード数</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md min-w-30">
                <div className="text-3xl font-bold text-blue-500 mb-2">{cards.reduce<number>((n, card) => card.question.length + n, 0)}</div>
                <div className="text-gray-600">総文字数</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mb-16">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="text-gray-400 mb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Edit size={32} />
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-2">まだカードが作成されていません</p>
              <p className="text-gray-500">「カードを作成」ボタンから新しいカードを作成しましょう</p>
            </div>
          </div>
        )}
        <EditCardList cards={cards} setCards={setCards} />
      </div>
    </div>
  );

  // 学習画面
  const StudyScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
            戻る
          </button>
          <div className="w-24"></div> {/* スペーサー */}
        </div>

        {/* 進捗表示 */}
        <div className="flex justify-end text-sm text-gray-600 mb-1">
          <div className="text-gray-800">{currentCardIndex + 1}</div>
          <span className='mx-1'>/</span>
          <div className="">{cards.length}</div>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="bg-white rounded-full h-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* カード */}
        {currentCard && (
          <div className="mb-8">
            <div
              className="relative bg-white rounded-xl shadow-md p-10 min-h-[350px] cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-[101%]"
              onClick={flipCard}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-sm text-gray-500 mb-6 tracking-wide">
                  {isFlipped ? '解答' : '問題'} - クリックでめくる
                </div>
                <div className="text-2xl text-center leading-relaxed">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </div>
              </div>

              {/* フリップインジケーター */}
              <div className="absolute bottom-6 right-6">
                <div className={`w-4 h-4 rounded-full ${isFlipped ? 'bg-green-500' : 'bg-purple-500'} transition-colors`}></div>
              </div>
            </div>
          </div>
        )}

        {/* コントロールボタン */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            disabled={cards.length <= 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            前のカード
          </button>

          <button
            onClick={resetCards}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw size={20} />
            最初に戻る
          </button>

          <button
            onClick={nextCard}
            disabled={cards.length <= 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            次のカード
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  // 画面の切り替え
  switch (currentScreen) {
    case 'study':
      return <StudyScreen />;
    default:
      return <HomeScreen />;
  }
}

const CreateScreen = ({ setCurrentScreen, setCards }: {
  setCurrentScreen: any
  setCards: any
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const addCard = () => {
    if (question && answer) {
      const newCard = {
        id: Date.now(),
        question: question,
        answer: answer
      };
      setCards(newCard);
      setQuestion('');
      setAnswer('');
      // カード作成後はホーム画面に戻る
      setCurrentScreen('home');
    }
  };

  return (
    <div className="mb-10">
      {/* ヘッダー */}
      <h2 className="text-xl text-center font-bold text-gray-800 mb-4">新しいカードを作成</h2>

      {/* 作成フォーム */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              問題
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-2 focus:outline-blue-500 focus:border-transparent resize-none text-lg"
              rows={4}
              placeholder="問題を入力してください..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              解答
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-2 focus:outline-blue-500 focus:border-transparent resize-none text-lg"
              rows={4}
              placeholder="解答を入力してください..."
              required
            />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => {
                setQuestion('');
                setAnswer('');
                setCurrentScreen('home');
              }}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={addCard}
              disabled={!question || !answer}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              カードを作成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditCardList({ cards, setCards }: {
  cards: FlashCard[]
  setCards: (card: FlashCard[]) => void
}) {
  const tmp = useRef(JSON.stringify(cards, null, 2))
  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-lg font-bold mb-4 text-blue-600'>カードリストを直接編集</h2>
      <textarea
        name="edit-cards" id="edit-cards" placeholder='[{ id: 0, question: "ここに問題", answer: "ここに解答"}, ...]'
        className='w-full outline-2 focus:outline-blue-500 rounded-md outline-gray-200 p-4 mb-2 font-mono'
        defaultValue={tmp.current}
        rows={5}
        onBlur={e => {
          try {
            setCards(JSON.parse(e.target.value))
          } catch (_) {
            console.info(`入力された文字 ${e.target.value} はJSON形式ではありません`)
          }
        }}
      />
      <p className='text-sm'>
        カードリストはJSON形式の配列で保存されています。<br />
        カードの編集機能と削除機能の実装が面倒だったので、ここから直接編集してください（手抜き<br />
      </p>
    </div>
  )
}

export function meta() {
  return [
    { title: '暗記カード' }
  ]
}