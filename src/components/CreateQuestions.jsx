import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from './common/Dropdown';
import HelpCircle from '../assets/images/HelpCircle.png';
import Chevron_down from '../assets/images/Chevron_down.png';
import Plus_circle from '../assets/images/Plus_circle.png';

const CreateQuestions = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [questions, setQuestions] = useState([]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
  };

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

  // 新規作成ページへの遷移処理を追加
  const handleAddQuestion = () => {
    navigate('/CreateQuestions_details');  };

  return (
    <div>
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
                  <div className="flex flex-col border-2 border-black rounded-lg px-[3%] py-[2%]">
                    <div
                      className={`text-white px-2 pb-1 text-xs mb-2 w-fit ${
                        question.question_type === "Long"
                          ? "bg-[#DF8181]"
                          : question.question_type === "short"
                            ? "bg-[#77D885]"
                            : "bg-gray-500"
                      }`}
                    >
                      {question.question_type}
                    </div>
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
            <button onClick={handleAddQuestion}>
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
    </div>
  );
};

export default CreateQuestions;