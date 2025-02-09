import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Createquestion_backbutton from '../assets/images/Createquestion_backbutton.png';
import Createquestion_submitbutton from '../assets/images/Createquestion_submitbutton.png';
import Createquestion_sectionheader from '../assets/images/Createquestion_sectionheader.png';
import Createquestion_header from '../assets/images/Createquestion_header.png';
import HelpCircle from '../assets/images/HelpCircle.png';

const CreateQuestions_details = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    question_type: "",
    question_text: "",
    correct_answer: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    explanation: ""  // 空欄として追加
  });

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setFormData(prev => ({
      ...prev,
      question_type: option
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const sampleData = {
        question_type: selectedOption,
        question_text: formData.question_text,
        correct_answer: formData.correct_answer,
        choices: [formData.choice1, formData.choice2, formData.choice3, formData.choice4],
        explanation: "",  // 空文字列として送信
      };

      const response = await fetch("http://localhost:8080/postquestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sampleData),
        credentials: 'include',
      });

      if (response.ok) {
        alert("問題が正常に作成されました");
        navigate('/createquestions');
      } else {
        alert("問題作成に失敗しました");

      }
    } catch (error) {
      alert("問題作成中にエラーが発生しました");
      console.error("エラー:", error);
    }
  };

  const handleBack = () => {
    navigate('/create-questions');
  };

  return (
    <div>
      <img src={Createquestion_header} alt="" className='mt-[5%]' />
      <div className="mt-[4%] flex justify-center items-center mx-[5%]">
        <div className="relative flex flex-col justify-center items-center">
          <img src={Createquestion_sectionheader} alt="" className="w-full" />
          <div className="max-w-md max-h-[80dvh] p-4 bg-white border-black border-b-2 border-x-2 rounded-xl">
            {/* Question Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500"></div>
              <span className="font-medium">Question</span>
              <div className="flex gap-2 ml-4">
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={selectedOption === 'reading'}
                    onChange={() => handleOptionChange('reading')}
                  />
                  <span>Reading</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={selectedOption === 'listening'}
                    onChange={() => handleOptionChange('listening')}
                  />
                  <span>Listening</span>
                </label>
              </div>
            </div>

            {/* Question Text Box */}
            <textarea 
              className="border border-gray-800 rounded-lg p-3 mb-4 relative w-full"
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              placeholder="問題文を入力してください"
            />

            {/* Answer Options */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-300"></div>
              <span className="font-medium">Answer</span>
            </div>
            <div className="space-y-2 mb-6">
              <input 
                placeholder="正解を入力"
                className="border border-gray-800 rounded p-2 text-sm mb-[5%] w-full"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
              />
              <div className='border-gray-400 border-[1px] mb-[5%]'></div>
              <div className='mt-[10%]'></div>
              {['choice2', 'choice3', 'choice4'].map((option, index) => (
                <input 
                  key={option}
                  placeholder={`選択肢${index + 2}を入力`}
                  className="border border-gray-800 rounded p-2 text-sm w-full"
                  name={`choice${index + 2}`}
                  value={formData[`choice${index + 2}`]}
                  onChange={handleChange}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-[10%]">
              <button onClick={handleBack}>
                <img src={Createquestion_backbutton} className="rounded-md text-sm" alt="Back" />
              </button>
              <button onClick={handleSubmit}>
                <img src={Createquestion_submitbutton} className="text-white rounded-md text-sm" alt="Submit" />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-1 left-2">
          <button onClick={() => alert("ヘルプボタンがクリックされました")}>
            <img src={HelpCircle} className="w-10 h-10" alt="Help" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestions_details;