import { useState, useEffect, useRef, useLayoutEffect } from 'react';

const PitchRecognitionGame = () => {
  // 音階と対応する周波数のマッピング
  const notes = {
    'ド': 261.63, // C4
    'ド#': 277.18, // C#4
    'レ': 293.66, // D4
    'レ#': 311.13, // D#4
    'ミ': 329.63, // E4
    'ファ': 349.23, // F4
    'ファ#': 369.99, // F#4
    'ソ': 392.00, // G4
    'ソ#': 415.30, // G#4
    'ラ': 440.00, // A4
    'ラ#': 466.16, // A#4
    'シ': 493.88, // B4
    'ド(高)': 523.25 // C5
  };

  type NoteName = keyof typeof notes

  const [currentNote, setCurrentNote] = useState<NoteName | ''>('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // useRefを使用して現在のオシレーターとタイマーを追跡
  const oscillatorRef = useRef<OscillatorNode>(null);
  const timerRef = useRef<number>(null);

  // オーディオコンテキストの初期化
  useLayoutEffect(() => {
    if (gameStarted && !audioContext) {
      const context = new (window.AudioContext)();
      setAudioContext(context);
    }
    
    // クリーンアップ関数
    return () => {
      stopSound();
      clearTimeout(timerRef.current as number);
    };
  }, [gameStarted]);

  // ゲーム開始時または回答後に自動的に新しい問題を出題
  useEffect(() => {
    if (gameStarted && (currentNote === '' || hasAnswered)) {
      playNextNote();
    }
  }, [audioContext]);

  // 音を停止する関数
  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (e) {
        console.log("オシレーターはすでに停止しています");
      }
    }
    setIsPlaying(false);
  };

  // 次の音を選択して再生する関数
  const playNextNote = () => {
    if (!audioContext) return;
    console.log("play next note")
    
    // 前の音と前のタイマーを停止
    stopSound();
    clearTimeout(timerRef.current as number);
    
    // ノート配列からランダムに選択
    const noteNames = Object.keys(notes) as NoteName[];
    const randomNote = noteNames[Math.floor(Math.random() * noteNames.length)];
    setCurrentNote(randomNote);
    
    // 音を生成して再生
    playNote(randomNote);
    
    // 状態をリセット
    setUserAnswer('');
    setFeedback('');
    setHasAnswered(false);
    setIsCorrect(false);
    setTotalPlayed(prev => prev + 1);
  };

  // 指定された音階を再生する関数
  const playNote = (note: NoteName) => {
    if (!audioContext) return;
    
    // 前の音を停止
    stopSound();
    
    // 新しい音を生成して再生
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = notes[note];
    gainNode.gain.value = 0.5;
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    oscillatorRef.current = osc;
    setIsPlaying(true);
    
    // 1秒後に音を停止
    timerRef.current = setTimeout(() => {
      stopSound();
    }, 1000) as unknown as number;
  };

  // 回答を確認する関数
  const checkAnswer = () => {
    const correct = userAnswer === currentNote;
    
    if (correct) {
      setFeedback('正解！');
      setScore(prev => prev + 1);
      setIsCorrect(true);
    } else {
      setFeedback(`不正解。正解は ${currentNote} でした。`);
      setIsCorrect(false);
    }
    
    setHasAnswered(true);
  };

  // ゲームを開始する関数
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalPlayed(1);
    setFeedback('');
    setHasAnswered(false);
  };

  // 同じ音をもう一度再生する関数
  const replayNote = () => {
    if (!audioContext || !currentNote) return;
    playNote(currentNote);
  };

  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <div className="flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto bg-gray-50 rounded-lg shadow-lg">
        {!gameStarted ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">音当てゲーム</h1>
            <p className="mb-6">音が流れるので、その音階を当ててください。</p>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              ゲームを始める
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">音当てゲーム</h1>
            
            <div className="w-full mb-6">
              <div className="flex justify-between mb-2">
                <span>スコア: {score} / {totalPlayed-1}</span>
                <span>{totalPlayed > 1 ? Math.round((score / (totalPlayed-1)) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalPlayed > 1 ? (score / (totalPlayed-1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center w-full mb-6">
              <button
                onClick={replayNote}
                disabled={isPlaying}
                className={`px-4 py-2 text-white rounded focus:outline-none w-full ${
                  isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isPlaying ? '音を再生中...' : 'もう一度聴く'}
              </button>
            </div>
            
            {currentNote && (
              <div className="w-full">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">あなたの回答:</label>
                  <select
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={hasAnswered}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasAnswered ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
                  >
                    <option value="">選択してください</option>
                    {Object.keys(notes).map(note => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                
                {hasAnswered ? (
                  <button
                    onClick={playNextNote}
                    disabled={isPlaying}
                    className={`px-4 py-2 w-full text-white rounded focus:outline-none ${
                      isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    次の問題へ
                  </button>
                ) : (
                  <button
                    onClick={checkAnswer}
                    disabled={!userAnswer}
                    className={`px-4 py-2 w-full text-white rounded focus:outline-none ${
                      userAnswer ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    回答する
                  </button>
                )}
                
                {feedback && (
                  <div className={`mt-4 p-3 rounded ${
                    isCorrect 
                      ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                      : 'bg-red-100 text-red-800 border-2 border-red-300'
                  }`}>
                    <div className="flex items-center">
                      <span className={`mr-2 flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <span className="font-medium">{feedback}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PitchRecognitionGame;

export function meta() {
  return [
    { title: '音階当てゲーム' },
    { description: '絶対音感があれば解けるはず' }
  ]
}