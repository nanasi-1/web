// @ts-nocheck

import { useState, useEffect } from 'react';

const CryptoApp = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [key, setKey] = useState(null);
  const [keyBase64, setKeyBase64] = useState('');
  const [importKeyText, setImportKeyText] = useState('');
  const [showKeyImport, setShowKeyImport] = useState(false);
  const [mode, setMode] = useState('encrypt'); // encrypt または decrypt
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // アプリ読み込み時に鍵を生成
  useEffect(() => {
    generateKey();
  }, []);

  // モード切替時にテキストボックスをリセット
  useEffect(() => {
    setInputText('');
    setOutputText('');
    setError('');
  }, [mode]);

  // 鍵が変更された時にBase64エンコードされた鍵を更新
  useEffect(() => {
    if (key) {
      exportKeyToBase64();
    }
  }, [key]);

  // 共通鍵(AES)の生成
  const generateKey = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      const newKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // エクスポート可能
        ['encrypt', 'decrypt']
      );
      
      setKey(newKey);
      setMessage('新しい鍵を生成しました');
      setIsLoading(false);
    } catch (err) {
      setError('鍵の生成に失敗しました: ' + err.message);
      setIsLoading(false);
    }
  };

  // 鍵をBase64形式にエクスポート
  const exportKeyToBase64 = async () => {
    try {
      if (!key) return;
      
      // 鍵をraw形式にエクスポート
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      
      // Base64エンコード
      const keyBase64String = arrayBufferToBase64(exportedKey);
      setKeyBase64(keyBase64String);
    } catch (err) {
      setError('鍵のエクスポートに失敗しました: ' + err.message);
    }
  };

  // Base64エンコードされた鍵をインポート
  const importKeyFromBase64 = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      if (!importKeyText.trim()) {
        setError('インポートする鍵を入力してください');
        setIsLoading(false);
        return;
      }
      
      // Base64をデコード
      const keyBuffer = base64ToArrayBuffer(importKeyText.trim());
      
      // 鍵をインポート
      const importedKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // エクスポート可能
        ['encrypt', 'decrypt']
      );
      
      setKey(importedKey);
      setMessage('鍵をインポートしました');
      setShowKeyImport(false);
      setImportKeyText('');
      setIsLoading(false);
    } catch (err) {
      setError('鍵のインポートに失敗しました: ' + err.message);
      setIsLoading(false);
    }
  };

  // 文字列をUint8Arrayに変換
  const strToUint8Array = (str) => {
    return new TextEncoder().encode(str);
  };

  // Uint8Arrayを文字列に変換
  const uint8ArrayToStr = (uint8Array) => {
    return new TextDecoder().decode(uint8Array);
  };

  // Base64エンコード
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Base64デコード
  const base64ToArrayBuffer = (base64) => {
    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (e) {
      throw new Error('無効なBase64形式です');
    }
  };

  // 暗号化処理
  const encrypt = async (text) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!key) {
        throw new Error('鍵が生成されていません');
      }
      
      // IVの生成（初期化ベクトル）
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // 暗号化処理
      const textData = strToUint8Array(text);
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        textData
      );
      
      // IV + 暗号化データをBase64エンコード
      const ivBase64 = arrayBufferToBase64(iv);
      const encryptedBase64 = arrayBufferToBase64(encryptedData);
      
      // URLクエリパラメータ風のフォーマットで出力
      const result = `iv=${encodeURIComponent(ivBase64)}&data=${encodeURIComponent(encryptedBase64)}`;
      
      setIsLoading(false);
      return result;
    } catch (err) {
      setError('暗号化に失敗しました: ' + err.message);
      setIsLoading(false);
      return '';
    }
  };

  // 復号処理
  const decrypt = async (encryptedText) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!key) {
        throw new Error('鍵が生成されていません');
      }
      
      // URLクエリパラメータ風の暗号文をパース
      const params = new URLSearchParams(encryptedText);
      const iv = params.get('iv');
      const data = params.get('data');
      
      if (!iv || !data) {
        throw new Error('無効な暗号文フォーマットです');
      }
      
      // Base64をデコード
      const ivArrayBuffer = base64ToArrayBuffer(decodeURIComponent(iv));
      const encryptedArrayBuffer = base64ToArrayBuffer(decodeURIComponent(data));
      
      // 復号処理
      try {
        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: new Uint8Array(ivArrayBuffer)
          },
          key,
          encryptedArrayBuffer
        );
        
        const result = uint8ArrayToStr(new Uint8Array(decryptedData));
        
        setIsLoading(false);
        return result;
      } catch (decryptError) {
        // 復号エラーをより詳細に判別
        if (decryptError.name === 'OperationError') {
          throw new Error('復号に失敗しました。鍵が異なるか、暗号文が壊れている可能性があります');
        } else {
          throw decryptError;
        }
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return '';
    }
  };

  // 処理実行
  const processText = async () => {
    // 入力がない場合は何もしない（エラーも表示しない）
    if (!inputText.trim()) {
      return;
    }
    
    try {
      let result = '';
      if (mode === 'encrypt') {
        result = await encrypt(inputText);
      } else {
        result = await decrypt(inputText);
      }
      setOutputText(result);
    } catch (err) {
      setError(err.message);
    }
  };

  // 鍵をクリップボードにコピー
  const copyKeyToClipboard = () => {
    if (keyBase64) {
      navigator.clipboard.writeText(keyBase64)
        .then(() => {
          setMessage('鍵をクリップボードにコピーしました');
          setTimeout(() => setMessage(''), 3000);
        })
        .catch(() => {
          setError('クリップボードへのコピーに失敗しました');
        });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">暗号化</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className='mb-6 text-center flex flex-col gap-y-2'>
        <p>
          文章を簡単に<a href='https://ja.wikipedia.org/wiki/Advanced_Encryption_Standard'>AES</a>で暗号化できます。<br />
          利用には共通鍵についての簡単な知識が必要かもしれません。<br />
        </p>
        <p>
          ※<b>安全性は保証できません</b>。遊びや学習目的での使用に留めてください。
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${mode === 'encrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('encrypt')}
          >
            暗号化する
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === 'decrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('decrypt')}
          >
            復号する
          </button>
        </div>
        
        <label className="block mb-2">
          {mode === 'encrypt' ? '平文' : '暗号文'}を入力:
          <textarea
            className="w-full p-2 border rounded mt-1"
            rows="5"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encrypt' ? '暗号化したいテキストを入力' : '復号したい暗号文を入力'}
          />
        </label>
        
        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={processText}
          disabled={isLoading || !key}
        >
          {isLoading ? '処理中...' : mode === 'encrypt' ? '暗号化' : '復号'}
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">
          {mode === 'encrypt' ? '暗号文' : '平文'}:
          <textarea
            className="w-full p-2 border rounded mt-1"
            rows="5"
            value={outputText}
            readOnly
            placeholder={mode === "encrypt" ? 'ここに暗号文が表示されます' : 'ここに復号結果が表示されます' }
          />
        </label>
      </div>
      
      {/* 鍵管理セクション */}
      <div className="border-t pt-6 mt-8 border-gray-300">
        <h2 className="text-lg font-semibold mb-4">鍵管理</h2>
        
        {!showKeyImport ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <label className="block text-sm">現在の鍵:</label>
                <div className="flex mt-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-l text-sm overflow-hidden"
                    value={keyBase64}
                    readOnly
                  />
                  <button
                    className="bg-gray-200 px-3 py-2 text-sm rounded-r hover:bg-gray-300"
                    onClick={copyKeyToClipboard}
                  >
                    コピー
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                onClick={generateKey}
                disabled={isLoading}
              >
                新しい鍵を生成
              </button>
              <button
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 text-sm"
                onClick={() => setShowKeyImport(true)}
              >
                鍵をインポート
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block mb-2">
              インポートする鍵:
              <textarea
                className="w-full p-2 border rounded mt-1"
                rows="2"
                value={importKeyText}
                onChange={(e) => setImportKeyText(e.target.value)}
                placeholder="Base64エンコードされた鍵を入力"
              />
            </label>
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                onClick={importKeyFromBase64}
                disabled={isLoading}
              >
                インポート
              </button>
              <button
                className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm"
                onClick={() => {
                  setShowKeyImport(false);
                  setImportKeyText('');
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500">※鍵を保存せずに変更すると以前の暗号文は復号できなくなります</span>
        </div>
      </div>
    </div>
  );
};

export default CryptoApp;

export function meta() {
  return [
    { title: '暗号化' }
  ]
}