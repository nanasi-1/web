import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Search } from 'lucide-react';

interface Question {
  code: string,
  correctAnswers: string[]
}

interface UserAnswer {
  question: number;
  selected: string[];
  correct: string[];
  isCorrect: boolean;
}

function ProgrammingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [solvedLanguages, setSolvedLanguages] = useState(new Set());
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // 全選択肢（共通）
  const allLanguages = [
    'Assembly', 'Bash', 'C', 'C#', 'C++', 'COBOL', 'Clojure', "CoffeeScript", "D",
    'Elixir', 'Erlang', 'F#', 'Fortran', 'Go', 'Groovy', 'Haskell', 'Java', 'JavaScript',
    'Julia', 'Kotlin', 'Lisp', 'Lua', 'MATLAB', 'Nim', 'Objective-C', 'OCaml', 'Pascal',
    'Perl', 'PHP', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'Swift', 'TypeScript', 'VB.NET'
  ];

  const questions: Question[] = [
    // print
    {
      code: `print("Hello World!")`,
      correctAnswers: ['Python', 'Ruby', 'Lua', 'PHP', "Perl", "Objective-C", 'Swift']
    },
    {
      code: 'print "Hello World!"',
      correctAnswers: ["Perl", "Ruby", 'Lua']
    },
    {
      code: "print 'Hello World!'",
      correctAnswers: ['Ruby', 'Lua']
    },
    {
      code: '(print "Hello World!")',
      correctAnswers: ['Clojure', 'Lisp']
    },
    // puts
    {
      code: `puts("Hello World!")`,
      correctAnswers: ['Ruby', 'C', 'C++']
    },
    {
      code: "puts 'Hello World!'",
      correctAnswers: ['Ruby']
    },
    // console.log
    {
      code: `console.log("Hello World!");`,
      correctAnswers: ['JavaScript', 'TypeScript', 'CoffeeScript']
    },
    // echo
    {
      code: `echo "Hello World!"`,
      correctAnswers: ['Bash', 'PHP', 'Nim']
    },
    // println
    {
      code: `println("Hello World!")`,
      correctAnswers: ['Scala', 'Kotlin', 'Groovy', 'Julia']
    },
    {
      code: `println!("Hello World!");`,
      correctAnswers: ['Rust']
    },
    {
      code: `(println "Hello World!")`,
      correctAnswers: ['Clojure', 'Lisp']
    },
    // printf
    {
      code: 'printf("Hello World!\\n")',
      correctAnswers: ["C", "C++", "PHP"]
    },
    // other
    {
      code: `System.out.println("Hello World!");`,
      correctAnswers: ['Java']
    },
    {
      code: 'printfn "Hello, World!"',
      correctAnswers: ['F#']
    },
    {
      code: `cout << "Hello World!" << endl;`,
      correctAnswers: ['C++']
    },
    {
      code: `Console.WriteLine("Hello World!");`,
      correctAnswers: ['C#', 'VB.NET']
    },
    {
      code: `fmt.Println("Hello World!")`,
      correctAnswers: ['Go']

    },
    {
      code: `disp('Hello World!')`,
      correctAnswers: ['MATLAB']
    },
    {
      code: `NSLog(@"Hello World!");`,
      correctAnswers: ['Objective-C']
    },
    {
      code: `print_endline "Hello World!"`,
      correctAnswers: ['OCaml']
    },
    {
      code: `writeln('Hello World!');`,
      correctAnswers: ['Pascal']
    },
    {
      code: `writeln("Hello World!");`,
      correctAnswers: ['D']
    },
    {
      code: `IO.puts "Hello World!"`,
      correctAnswers: ['Elixir']
    },
    {
      code: `io:format("Hello World!~n").`,
      correctAnswers: ['Erlang']
    },
    {
      code: `putStrLn "Hello World!"`,
      correctAnswers: ['Haskell']
    },
    {
      code: `cat("Hello World!\\n")`,
      correctAnswers: ['R']
    },
    {
      code: `DISPLAY 'Hello World!'.`,
      correctAnswers: ['COBOL']
    },
    {
      code: `write(*,*) 'Hello World!'`,
      correctAnswers: ['Fortran']
    },
    {
      code: `(format t "Hello World!~%")`,
      correctAnswers: ['Lisp']
    },
    {
      code: `.global _start

.section .data
    msg: .ascii "Hello World!\\n"
    msg_len = . - msg

.section .text
_start:
    mov $1, %rax
    mov $1, %rdi
    mov $msg, %rsi
    mov $msg_len, %rdx
    syscall
    
    mov $60, %rax
    mov $0, %rdi
    syscall`,
      correctAnswers: ['Assembly']
    }
  ];

  // Fisher-Yates シャッフルアルゴリズム
  function shuffleArray<T>(array: T[]) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // ゲーム開始時に問題をシャッフル
  useEffect(() => {
    setShuffledQuestions(shuffleArray(questions));
  }, []);

  // 各言語が何問で正解になるかを計算
  const languageAnswerCounts: Record<string, number> = {};
  questions.forEach(q => {
    q.correctAnswers.forEach(lang => {
      languageAnswerCounts[lang] = (languageAnswerCounts[lang] || 0) + 1;
    });
  });

  // 正解済み言語の追跡を更新
  const updateSolvedLanguages = (newUserAnswers: UserAnswer[]) => {
    const languageSolveCount: Record<string, number> = {};

    newUserAnswers.forEach(answer => {
      answer.correct.forEach(lang => {
        languageSolveCount[lang] = (languageSolveCount[lang] || 0) + 1;
      });
    });

    const newSolvedLanguages = new Set();
    Object.entries(languageSolveCount).forEach(([lang, count]) => {
      if (count >= languageAnswerCounts[lang]) {
        newSolvedLanguages.add(lang);
      }
    });

    setSolvedLanguages(newSolvedLanguages);
  };

  // 各言語の既出回数を計算
  const getLanguageProgress = () => {
    const languageSolveCount: Record<string, number> = {};

    userAnswers.forEach(answer => {
      answer.correct.forEach(lang => {
        languageSolveCount[lang] = (languageSolveCount[lang] || 0) + 1;
      });
    });

    return languageSolveCount;
  };

  // 検索でフィルタリングされた選択肢を取得
  const getFilteredLanguages = () => {
    return allLanguages.filter(lang => {
      const matchesSearch = lang.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswers.includes(answer)) {
      setSelectedAnswers(selectedAnswers.filter(a => a !== answer));
    } else {
      setSelectedAnswers([...selectedAnswers, answer]);
    }
  };

  const handleSubmit = () => {
    if (gameFinished) return;

    const currentQ = shuffledQuestions[currentQuestion];
    const isCorrect =
      selectedAnswers.length === currentQ.correctAnswers.length &&
      selectedAnswers.every(answer => currentQ.correctAnswers.includes(answer));

    if (isCorrect) {
      setScore(score + 1);
    }

    const newUserAnswers = [...userAnswers, {
      question: currentQuestion,
      selected: [...selectedAnswers],
      correct: currentQ.correctAnswers,
      isCorrect
    }];

    setUserAnswers(newUserAnswers);
    updateSolvedLanguages(newUserAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
      setShowResult(false);
      setSearchTerm('');
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setScore(0);
    setGameFinished(false);
    setUserAnswers([]);
    setSearchTerm('');
    setSolvedLanguages(new Set());
    setShuffledQuestions(shuffleArray(questions));
  };

  const getScoreColor = () => {
    const percentage = (score / shuffledQuestions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (gameFinished) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">クイズ完了！</h1>
          <p className={`text-2xl font-semibold ${getScoreColor()}`}>
            スコア: {score} / {shuffledQuestions.length} ({Math.round((score / shuffledQuestions.length) * 100)}%)
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">結果詳細</h2>
          {userAnswers.map((answer, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-2">
                {answer.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="font-medium">問題 {index + 1}</span>
              </div>
              <div className="bg-gray-800 text-green-400 p-3 rounded mb-2 font-mono text-sm">
                <pre className="whitespace-pre-wrap">{shuffledQuestions[index].code}</pre>
              </div>
              <div className="text-sm">
                <p><strong>あなたの答え:</strong> {answer.selected.join(', ') || '未回答'}</p>
                <p><strong>正解:</strong> {answer.correct.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center mx-auto"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            もう一度プレイ
          </button>
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">クイズを準備中...</p>
        </div>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentQuestion];
  const filteredLanguages = getFilteredLanguages();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">プログラミング言語クイズ</h1>
          <div className="text-sm text-gray-600">
            問題 {currentQuestion + 1} / {shuffledQuestions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-gray-800 mb-4">以下のコードはどの言語で書かれていますか？</h2>
        <div className="bg-gray-800 text-green-400 p-6 rounded-lg font-mono text-lg mb-4">
          <pre className="whitespace-pre-wrap">{currentQ.code}</pre>
        </div>
        <p className='mb-4'>
          ※解答は<span className='font-semibold'>複数選択式</span>です <br />
          ※コードはボイラープレートなどの一部が<span className='font-semibold'>省かれている</span>可能性があります <br />
        </p>
      </div>

      {!showResult ? (
        <>
          {/* 検索ボックス */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="言語を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 言語選択肢リスト */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredLanguages.filter(language => {
                  const progress = getLanguageProgress();
                  const currentCount = progress[language] || 0;
                  const totalCount = languageAnswerCounts[language] || 0;
                  return !(currentCount >= totalCount && totalCount > 0);
                }).map((language) => {
                  const progress = getLanguageProgress();
                  const currentCount = progress[language] || 0;
                  const totalCount = languageAnswerCounts[language] || 0;
                  const isSelected = selectedAnswers.includes(language);

                  return (
                    <button
                      key={language}
                      onClick={() => handleAnswerSelect(language)}
                      className={`p-3 text-sm rounded border transition-all duration-200 text-left flex justify-between items-center ${isSelected
                        ? 'border-blue-600 bg-blue-100 text-blue-700 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      <span>
                        {language}
                      </span>
                      {totalCount > 0 && (
                        <span className="text-xs px-2 py-1 rounded  text-gray-600 border">
                          {currentCount} / {totalCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredLanguages.filter(language => {
                  const progress = getLanguageProgress();
                  const currentCount = progress[language] || 0;
                  const totalCount = languageAnswerCounts[language] || 0;
                  return currentCount >= totalCount && totalCount > 0;
                }).map((language) => {
                  const progress = getLanguageProgress();
                  const currentCount = progress[language] || 0;
                  const totalCount = languageAnswerCounts[language] || 0;

                  return (
                    <div
                      key={language}
                      className="p-3 text-sm rounded border border-gray-200 bg-gray-100 text-gray-400 flex justify-between items-center"
                    >
                      <span className="line-through">
                        {language} ✓
                      </span>
                      <span className="text-xs px-2 py-1 rounded  text-blue-600 border">
                        {currentCount} / {totalCount}
                      </span>
                    </div>
                  );
                })}
              </div>
              {filteredLanguages.filter(language => {
                const progress = getLanguageProgress();
                const currentCount = progress[language] || 0;
                const totalCount = languageAnswerCounts[language] || 0;
                return !(currentCount >= totalCount && totalCount > 0);
              }).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    検索結果がありません
                  </p>
                )}
            </div>
            {/* 選択済み答えの表示を下に移動 */}
            {selectedAnswers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">選択中 ({selectedAnswers.length}個):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnswers.map(answer => (
                    <button
                      key={answer}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                      onClick={() => handleAnswerSelect(answer)}
                    >
                      {answer} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              回答する
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            {userAnswers[currentQuestion].isCorrect ? (
              <div className="flex items-center justify-center text-green-600 mb-4">
                <CheckCircle className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold">正解！</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-red-600 mb-4">
                <XCircle className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold">不正解</span>
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>あなたの答え:</strong> {selectedAnswers.join(', ')}
              </p>
              <p className="text-gray-700">
                <strong>正解:</strong> {currentQ.correctAnswers.join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            {currentQuestion < shuffledQuestions.length - 1 ? '次の問題' : '結果を見る'}
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        現在のスコア: {score} / {questions.length}
      </div>
    </div>
  );
};

export default ProgrammingQuiz;

export function meta() {
  return [{
    title: "Hello World!コードから言語を当てるクイズ"
  }]
}