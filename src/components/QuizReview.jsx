import React, { useState } from 'react';
import Dropdown from './common/Dropdown';
import HelpCircle from '../assets/images/HelpCircle.png';
import Chevron_down from '../assets/images/Chevron_down.png';
import Plus_circle from '../assets/images/Plus_circle.png';

const CreateVocabulary = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vocabularyList, setVocabularyList] = useState([]); // 空データを使用

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
  };

  const [formData, setFormData] = useState({
    vocabulary_text: "",
    meaning: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 新しい単語データをリストに追加
    const newVocabulary = {
      vocabulary_text: formData.vocabulary_text,
      meaning: formData.meaning
    };

    // 新しい単語をリストにセット
    setVocabularyList([...vocabularyList, newVocabulary]);

    // フォームをリセットし、ダイアログを閉じる
    setFormData({
      vocabulary_text: "",
      meaning: ""
    });
    setIsDialogOpen(false);
  };

  return (
    <div>
      <Dropdown selectedOption={selectedOption} setOptionSelect={handleOptionSelect} />
      <div className="border mb-[20%] shadow-2xl">
        <div className="mx-[4%] bg-[#313131] text-white rounded-t-lg pl-[8%] h-[8%] flex items-center mt-[5%]">
          vocabulary
        </div>

        <div className="max-w-md shadow-2xl bg-white mx-[4%] p-4 border-2 border-black rounded-b-xl">
          <div className="max-h-[58dvh] overflow-y-auto">
            {vocabularyList && vocabularyList.length > 0 ? (
              vocabularyList.map((vocab, index) => (
                <div key={index} className="mb-4">
                  <div className="flex flex-col border-2 border-black rounded-lg px-[3%] py-[2%]">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <p className="text-left">{vocab.vocabulary_text}</p>
                        <p className="text-gray-600">-</p>
                        <p className="text-left text-gray-600">{vocab.meaning}</p>
                      </div>
                      <img src={Chevron_down} alt="Chevron" className="ml-auto" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center mt-4">まだ登録された復習問題はありません</p>
            )}
          </div>

          <div className="absolute bottom-16 right-2">
            <button onClick={() => setIsDialogOpen(true)}>
              <img src={Plus_circle} className="w-10 h-10" alt="Add" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 left-2">
        <button onClick={() => alert("ヘルプボタンがクリックされました")}>
          <img src={HelpCircle} className="w-10 h-10" alt="Help" />
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">単語を登録</h2>

            <input
              type="text"
              name="vocabulary_text"
              placeholder="単語"
              className="w-full border p-2 mb-2"
              value={formData.vocabulary_text}
              onChange={handleChange}
            />

            <input
              type="text"
              name="meaning"
              placeholder="意味"
              className="w-full border p-2 mb-2"
              value={formData.meaning}
              onChange={handleChange}
            />

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsDialogOpen(false)}
              >
                キャンセル
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVocabulary;
