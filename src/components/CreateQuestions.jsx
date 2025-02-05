import React, { useState } from 'react';
import Dropdown from './common/Dropdown';
import HelpCircle from '../assets/images/HelpCircle.png';
import Chevron_down from '../assets/images/Chevron_down.png';
import Plus_circle from '../assets/images/Plus_circle.png';

const CreateQuestions = () => {
  const [selectedOption, setSelectedOption] = useState("");  // 選択した項目
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState([]); // 問題のリストを保持する状態
  const [formData, setFormData] = useState({
    question_text: "",
    correct_answer: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    explanation: ""
  });

  // 問題のリストを取得する関数
  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/questions', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('問題の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // コンポーネントがマウントされたときに問題のリストを取得
  React.useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // 選択肢を配列に格納
      const choices = [
        formData.choice1,
        formData.choice2,
        formData.choice3,
        formData.choice4
      ];

      // APIに送信するデータを整形
      const questionData = {
        question_text: formData.question_text,
        correct_answer: formData.correct_answer,
        choices: choices,
        explanation: formData.explanation
      };

      const response = await fetch('http://localhost:8080/postquestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // クッキーを含める（認証用）
        body: JSON.stringify(questionData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('問題が正常に作成されました');
        setIsDialogOpen(false);
        // フォームをリセット
        setFormData({
          question_text: "",
          correct_answer: "",
          choice1: "",
          choice2: "",
          choice3: "",
          choice4: "",
          explanation: ""
        });
        // 問題リストを更新
        fetchQuestions();
      } else {
        alert(data.message || '問題の作成に失敗しました');
      }
    } catch (error) {
      alert('問題の作成中にエラーが発生しました');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Dropdown selectedOption={selectedOption} setOptionSelect={handleOptionSelect} />
      <div className='max-w-md shadow-2xl bg-white mx-6 mt-[5%] p-[2%] border-black border-2 items-center rounded-xl'>
        {questions.map((question, index) => (
          <div key={question.id} className='mb-4'>
            <div className='flex justify-between items-center border-black border-2 rounded-2xl py-[2%] px-[1%]'>
              <div className='flex-grow flex flex-col items-center'>
                <div className='text-center'>
                  Q. {question.question_text}
                </div>
                <div className='border-2 border-dashed border-gray-400 my-[4%] w-full'></div>
                <div className='text-center'>
                  A. {question.correct_answer}
                </div>
              </div>
              <img src={Chevron_down} alt="" className='ml-auto' />
            </div>
          </div>
        ))}
        <div className="flex justify-end mt-2">
          <button onClick={() => setIsDialogOpen(true)}>
            <img src={Plus_circle} className="w-10 h-10" alt="Plus" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-[60px] left-2 mb-2 ">
        <button onClick={() => console.log('ヘルプボタンがクリックされました')}>
          <img src={HelpCircle} className="w-10 h-10" alt="Help" />
        </button>
      </div>

      {/* ダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">質問を追加</h2>
            <input 
              type="text" 
              name="question_text" 
              placeholder="質問文" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.question_text}
            />
            <input 
              type="text" 
              name="correct_answer" 
              placeholder="正解" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.correct_answer}
            />
            <input 
              type="text" 
              name="choice1" 
              placeholder="選択肢1" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.choice1}
            />
            <input 
              type="text" 
              name="choice2" 
              placeholder="選択肢2" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.choice2}
            />
            <input 
              type="text" 
              name="choice3" 
              placeholder="選択肢3" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.choice3}
            />
            <input 
              type="text" 
              name="choice4" 
              placeholder="選択肢4" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.choice4}
            />
            <textarea 
              name="explanation" 
              placeholder="説明" 
              className="w-full border p-2 mb-2" 
              onChange={handleChange}
              value={formData.explanation}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsDialogOpen(false)}>キャンセル</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuestions;