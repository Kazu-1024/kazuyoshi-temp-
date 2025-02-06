import React, { useState, useEffect } from 'react';
import Dropdown from './common/Dropdown';
import HelpCircle from '../assets/images/HelpCircle.png';
import Chevron_down from '../assets/images/Chevron_down.png';
import Plus_circle from '../assets/images/Plus_circle.png';

const CreateQuestions = () => {
  const [selectedOption, setSelectedOption] = useState(""); // 選択されたオプション
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの開閉
  const [questions, setQuestions] = useState([]); // 質問リスト

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);  // 選ばれた項目を設定
  };

  const [formData, setFormData] = useState({
    question_type: "",
    question_text: "",
    correct_answer: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    explanation: "",
  });

  // 質問文を取得する関数
  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost:8080/getquestions", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // dataがnullまたはundefinedの場合、空配列を設定
        setQuestions(data || []);
      } else {
        console.error("質問リストの取得に失敗しました");
        setQuestions([]); // データが取得できなかった場合は空配列にする
      }
    } catch (error) {
      console.error("エラー:", error);
      setQuestions([]); // エラーが発生した場合は空配列にする
    }
  };

  // 初回レンダリング時に質問リストを取得
  useEffect(() => {
    fetchQuestions();
  }, []);

  // フォームの入力を管理
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 質問を作成する関数
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sampleData = {
        question_type: formData.question_type,
        question_text: formData.question_text,
        correct_answer: formData.correct_answer,
        choices: [formData.choice1, formData.choice2, formData.choice3, formData.choice4],
        explanation: formData.explanation,
      };

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sampleData),
        credentials: 'include', // これでセッションが維持されます
      };

      const response = await fetch("http://localhost:8080/postquestions", fetchOptions);

      if (response.ok) {
        alert("質問が正常に作成されました");
        setFormData({
          question_type: "",
          question_text: "",
          correct_answer: "",
          choice1: "",
          choice2: "",
          choice3: "",
          choice4: "",
          explanation: "",
        });
        setIsDialogOpen(false);
        fetchQuestions(); // リスト更新
      } else {
        alert("質問作成に失敗しました");
      }
    } catch (error) {
      alert("質問作成中にエラーが発生しました");
      console.error("エラー:", error);
    }
  };

  return (
    <div>
      {/* ドロップダウン */}
      <Dropdown selectedOption={selectedOption} setOptionSelect={handleOptionSelect} />

      {/* 質問一覧 */}
      <div className="max-w-md shadow-2xl bg-white mx-6 mt-5 p-4 border-2 border-black rounded-xl">
        {/* 質問リストをスクロール可能に設定 */}
        <div className="max-h-96 overflow-y-auto">
          {questions && questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center border-2 border-black rounded-2xl py-2 px-4">
                  <div className="flex-grow">
                    {/* 問題文が10文字を超える場合、省略して表示 */}
                    <p className="text-center">
                      Q. {question.question_text.length > 10 ? question.question_text.substring(0, 10) + "..." : question.question_text}
                    </p>
                    <div className="border-dashed border-2 border-gray-400 my-4"></div>
                    <p className="text-center">A. {question.correct_answer}</p>
                  </div>
                  <img src={Chevron_down} alt="Chevron" className="ml-auto" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center mt-4">まだ作成された質問はありません</p>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={() => setIsDialogOpen(true)}>
            <img src={Plus_circle} className="w-10 h-10" alt="Add" />
          </button>
        </div>
      </div>

      {/* ヘルプボタン */}
      <div className="absolute bottom-16 left-2">
        <button onClick={() => alert("ヘルプボタンがクリックされました")}>
          <img src={HelpCircle} className="w-10 h-10" alt="Help" />
        </button>
      </div>

      {/* ダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">問題を作成</h2>
            <input
              type="text"
              name="question_text"
              placeholder="質問文"
              className="w-full border p-2 mb-2"
              value={formData.question_text}
              onChange={handleChange}
            />
            <input
              type="text"
              name="correct_answer"
              placeholder="正解"
              className="w-full border p-2 mb-2"
              value={formData.correct_answer}
              onChange={handleChange}
            />
            <input
              type="text"
              name="choice1"
              placeholder="選択肢1"
              className="w-full border p-2 mb-2"
              value={formData.choice1}
              onChange={handleChange}
            />
            <input
              type="text"
              name="choice2"
              placeholder="選択肢2"
              className="w-full border p-2 mb-2"
              value={formData.choice2}
              onChange={handleChange}
            />
            <input
              type="text"
              name="choice3"
              placeholder="選択肢3"
              className="w-full border p-2 mb-2"
              value={formData.choice3}
              onChange={handleChange}
            />
            <input
              type="text"
              name="choice4"
              placeholder="選択肢4"
              className="w-full border p-2 mb-2"
              value={formData.choice4}
              onChange={handleChange}
            />
            <textarea
              name="explanation"
              placeholder="説明"
              className="w-full border p-2 mb-2"
              value={formData.explanation}
              onChange={handleChange}
            ></textarea>
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

export default CreateQuestions;
