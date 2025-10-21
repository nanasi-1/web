// @ts-nocheck

import { useEffect, useLayoutEffect, useState } from 'react';
import { Plus, Edit2, Trash2, User, ArrowRight, Settings } from 'lucide-react';

export default function RelationshipManager() {
  const [people, setPeople] = useState([]);
  const [relationships, setRelationships] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showFieldsEditor, setShowFieldsEditor] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [selectedRelationTarget, setSelectedRelationTarget] = useState('');

  // データをlocalStorageから読み込む
  useLayoutEffect(() => {
    const savedPeople = localStorage.getItem('rm_people') ?? [];
    const savedRelationships = localStorage.getItem('rm_relationships') ?? {};
    const savedCustomFields = localStorage.getItem('rm_customFields') ?? ['年齢', '職業', '出身地'];

    setPeople(JSON.parse(savedPeople));
    setRelationships(JSON.parse(savedRelationships));
    setCustomFields(JSON.parse(savedCustomFields));
  }, []);

  // データをlocalStorageに保存する
  useEffect(() => {
    if (people.length === 0) return
    localStorage.setItem('rm_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    if (Object.keys(relationships).length === 0) return
    localStorage.setItem('rm_relationships', JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    if (customFields.length === 0) return
    localStorage.setItem('rm_customFields', JSON.stringify(customFields));
  }, [customFields]);

  const [formData, setFormData] = useState({
    name: '',
    customFieldValues: {},
    notes: '',
    relationships: {}
  });

  const handleAddPerson = () => {
    if (!formData.name.trim()) return;

    const newPerson = {
      id: editingPerson?.id || Date.now(),
      name: formData.name,
      customFieldValues: { ...formData.customFieldValues },
      notes: formData.notes
    };

    if (editingPerson) {
      setPeople(people.map(p => p.id === editingPerson.id ? newPerson : p));
      setRelationships(prev => ({
        ...prev,
        [editingPerson.id]: formData.relationships
      }));
      setEditingPerson(null);
    } else {
      setPeople([...people, newPerson]);
      setRelationships(prev => ({
        ...prev,
        [newPerson.id]: formData.relationships
      }));
    }

    setFormData({ name: '', customFieldValues: {}, notes: '', relationships: {} });
    setShowPersonForm(false);
  };

  const handleDeletePerson = (id) => {
    setPeople(people.filter(p => p.id !== id));
    const newRelationships = { ...relationships };
    delete newRelationships[id];
    Object.keys(newRelationships).forEach(key => {
      if (newRelationships[key][id]) {
        delete newRelationships[key][id];
      }
    });
    setRelationships(newRelationships);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      customFieldValues: person.customFieldValues,
      notes: person.notes,
      relationships: relationships[person.id] || {}
    });
    setShowPersonForm(true);
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim() && !customFields.includes(newFieldName.trim())) {
      setCustomFields([...customFields, newFieldName.trim()]);
      setNewFieldName('');
    }
  };

  const handleDeleteCustomField = (field) => {
    if (confirm(`「${field}」を削除しますか？すべての人物からこの項目のデータが削除されます。`)) {
      setCustomFields(customFields.filter(f => f !== field));
      setPeople(people.map(person => {
        const newValues = { ...person.customFieldValues };
        delete newValues[field];
        return { ...person, customFieldValues: newValues };
      }));
    }
  };

  const handleRenameCustomField = (oldName) => {
    const newName = prompt(`「${oldName}」の新しい名前を入力してください：`, oldName);
    if (newName && newName.trim() && newName !== oldName) {
      const trimmedName = newName.trim();
      if (customFields.includes(trimmedName)) {
        alert('その名前は既に存在します。');
        return;
      }
      setCustomFields(customFields.map(f => f === oldName ? trimmedName : f));
      setPeople(people.map(person => {
        const newValues = { ...person.customFieldValues };
        if (newValues[oldName]) {
          newValues[trimmedName] = newValues[oldName];
          delete newValues[oldName];
        }
        return { ...person, customFieldValues: newValues };
      }));
    }
  };

  const moveFieldUp = (index) => {
    if (index > 0) {
      const newFields = [...customFields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setCustomFields(newFields);
    }
  };

  const moveFieldDown = (index) => {
    if (index < customFields.length - 1) {
      const newFields = [...customFields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setCustomFields(newFields);
    }
  };

  const updateRelationship = (toId, note) => {
    setFormData(prev => ({
      ...prev,
      relationships: {
        ...prev.relationships,
        [toId]: note
      }
    }));
  };

  const deleteRelationship = (toId) => {
    const newRelationships = { ...formData.relationships };
    delete newRelationships[toId];
    setFormData(prev => ({
      ...prev,
      relationships: newRelationships
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">人間関係メモ</h1>
          <p className="text-gray-600">
            人物情報と相互関係をメモできます。<br />
            頭の中を整理したいときや、思い出を振り返りたいときなどにお使いください。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">人物一覧</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFieldsEditor(!showFieldsEditor)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Settings size={20} />
                項目編集
              </button>
              <button
                onClick={() => {
                  setEditingPerson(null);
                  setFormData({ name: '', customFieldValues: {}, notes: '', relationships: {} });
                  setShowPersonForm(!showPersonForm);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
                人物を追加
              </button>
            </div>
          </div>

          {showFieldsEditor && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-green-200">
              <h3 className="text-xl font-bold mb-4">カスタム項目の編集</h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">新しい項目を追加</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="項目名を入力"
                  />
                  <button
                    onClick={handleAddCustomField}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    追加
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">既存の項目</label>
                {customFields.map((field, index) => (
                  <div key={field} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveFieldUp(index)}
                        disabled={index === 0}
                        className={`px-2 py-1 text-xs rounded ${index === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveFieldDown(index)}
                        disabled={index === customFields.length - 1}
                        className={`px-2 py-1 text-xs rounded ${index === customFields.length - 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                      >
                        ↓
                      </button>
                    </div>
                    <span className="flex-1 font-medium text-gray-800">{field}</span>
                    <button
                      onClick={() => handleRenameCustomField(field)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      名前変更
                    </button>
                    <button
                      onClick={() => handleDeleteCustomField(field)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
                {customFields.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    カスタム項目がありません。上から追加してください。
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowFieldsEditor(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          {showPersonForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold mb-4">{editingPerson ? '人物を編集' : '新しい人物'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">名前 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="名前を入力"
                  />
                </div>

                {customFields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{field}</label>
                    <textarea
                      value={formData.customFieldValues[field] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        customFieldValues: { ...formData.customFieldValues, [field]: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows="2"
                      placeholder={`${field}を入力`}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">自由記述</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="メモや備考を入力"
                  />
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    関係性メモ（{formData.name || 'この人'}から見た関係）
                  </label>

                  <select
                    value={selectedRelationTarget}
                    onChange={(e) => setSelectedRelationTarget(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">相手を選択してください</option>
                    {people
                      .filter(p => !editingPerson || p.id !== editingPerson.id)
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                  </select>

                  {selectedRelationTarget && (
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-indigo-600" />
                        <span className="font-semibold text-gray-700">{formData.name || '(本人)'}</span>
                        <ArrowRight size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {people.find(p => p.id === parseInt(selectedRelationTarget))?.name}
                        </span>
                      </div>
                      <textarea
                        value={formData.relationships[selectedRelationTarget] || ''}
                        onChange={(e) => updateRelationship(selectedRelationTarget, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                        rows="3"
                        placeholder="関係性を入力（例：高校の同級生、元上司）"
                      />
                      {formData.relationships[selectedRelationTarget] && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => deleteRelationship(selectedRelationTarget)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                          >
                            この関係を削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>


                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleAddPerson}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    {editingPerson ? '更新' : '追加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPersonForm(false);
                      setEditingPerson(null);
                      setFormData({ name: '', customFieldValues: {}, notes: '', relationships: {} });
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {people.map(person => {
              const personRelationships = relationships[person.id] || {};
              const relationshipCount = Object.keys(personRelationships).filter(k => personRelationships[k]).length;

              return (
                <div key={person.id} className="bg-white rounded-lg p-5 border border-gray-200 transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl text-gray-800">{person.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPerson(person)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {customFields.map(field => {
                      const value = person.customFieldValues[field];
                      if (!value) return null;
                      const hasLineBreak = value.includes('\n');

                      return (
                        <div key={field} className="text-sm">
                          <span className="font-semibold text-gray-600">{field}:</span>
                          {hasLineBreak ? (
                            <div className="ml-2 text-gray-800 whitespace-pre-wrap">{value}</div>
                          ) : (
                            <span className="ml-2 text-gray-800">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {person.notes && (
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded border border-green-400 mb-3 whitespace-pre-wrap">
                      {person.notes}
                    </p>
                  )}

                  {relationshipCount > 0 && (
                    <div className="bg-indigo-50 p-3 rounded border border-indigo-300">
                      <div className="text-xs font-semibold text-indigo-700 mb-2">関係性 ({relationshipCount}件)</div>
                      <div className="space-y-2">
                        {Object.entries(personRelationships)
                          .filter(([_, note]) => note)
                          .map(([toId, note]) => {
                            const toPerson = people.find(p => p.id === parseInt(toId));
                            return toPerson ? (
                              <div key={toId} className="text-sm text-gray-700">
                                <div className="flex items-center gap-1 mb-1">
                                  <ArrowRight size={14} className="text-indigo-500 flex-shrink-0" />
                                  <span className="font-medium">{toPerson.name}:</span>
                                </div>
                                <div className="ml-5 whitespace-pre-wrap">{note}</div>
                              </div>
                            ) : null;
                          })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {people.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              まだ人物が登録されていません。「人物を追加」ボタンから登録してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}