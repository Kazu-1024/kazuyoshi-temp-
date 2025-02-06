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
        console.log(data);
        setQuestions(data || []);
      } else {
        console.error("質問リストの取得に失敗しました");
        setQuestions([]);
      }
    } catch (error) {
      console.error("エラー:", error);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        credentials: 'include',
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
        fetchQuestions();
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
      <div className='border mb-[20%] shadow-2xl'>
        <div className='mx-[4%] bg-[#313131] text-white rounded-t-lg pl-[8%] h-[8%] flex items-center mt-[5%]'>
          questions
        </div>

        <div className="max-w-md shadow-2xl bg-white mx-[4%] p-4 border-2 border-black rounded-b-xl">
          <div className="max-h-[58dvh] overflow-y-auto">
            {questions && questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={index} className="mb-4">
                  {/* 質問タイプと質問内容を縦並びに配置 */}
                  <div className="flex flex-col border-2 border-black rounded-lg px-[3%] py-[2%]">
                    {/* 質問タイプ */}
                    <div
                      className={`text-white px-2 pb-1  text-xs mb-2 w-fit ${question.question_type === "Long"
                          ? "bg-[#DF8181]"
                          : question.question_type === "short"
                            ? "bg-[#77D885]"
                            : "bg-gray-500"
                        }`}
                    >
                      {question.question_type}
                    </div>

                    {/* 質問内容 */}
                    <div className="flex justify-between items-center">
                      <p className="text-left">
                        Q.{" "}
                        {question.question_text.length > 10
                          ? question.question_text.substring(0, 10) + "..."
                          : question.question_text}
                      </p>
                      <img src={Chevron_down} alt="Chevron" className="ml-auto" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center mt-4">まだ作成された質問はありません</p>
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
    <h2 className="text-xl font-bold mb-4">問題を作成</h2>

    {/* プルダウンメニューで問題タイプを選択 */}
    <select
      name="question_type"
      className="w-full border p-2 mb-2"
      value={formData.question_type}
      onChange={handleChange}
    >
      <option value="" disabled>
        問題タイプを選択
      </option>
      <option value="Long">Long</option>
      <option value="short">Short</option>
      <option value="Multiple Choice">Listening</option>
    </select>

    {/* 質問文 */}
    <input
      type="text"
      name="question_text"
      placeholder="質問文"
      className="w-full border p-2 mb-2"
      value={formData.question_text}
      onChange={handleChange}
    />

    {/* 正解 */}
    <input
      type="text"
      name="correct_answer"
      placeholder="正解"
      className="w-full border p-2 mb-2"
      value={formData.correct_answer}
      onChange={handleChange}
    />

    {/* 選択肢 */}
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

    {/* 説明 */}
    <textarea
      name="explanation"
      placeholder="説明"
      className="w-full border p-2 mb-2"
      value={formData.explanation}
      onChange={handleChange}
    ></textarea>

    {/* ボタン */}
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
