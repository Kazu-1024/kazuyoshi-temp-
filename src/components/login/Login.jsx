import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Luxon from "../../assets/images/Luxon.png";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // ログインとサインアップの切り替え

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? 'login' : 'signup';  // エンドポイントを切り替え

    // サインアップ時のパスワード確認
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('パスワードが異なります');
      return;
    }

    try {
      const fetchOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      };

      // ログイン時のみクッキー含める
      if (isLogin) {
        fetchOptions.credentials = 'include';
      }
      // const response = await fetch('http://localhost:8080/${endpoint}', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   credentials: 'include', // クッキーを含める
      //   body: JSON.stringify({
      //     username: formData.username,
      //     password: formData.password,
      //   }),
      // });

      const response = await fetch(`http://localhost:8080/${endpoint}`, fetchOptions);

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // 成功メッセージ
        if (isLogin) navigate('/'); // ログイン成功時にホーム画面
        else setIsLogin(true);
      } else {
        alert(data.message || isLogin ? 'ログインに失敗しました' : 'アカウント作成に失敗しました'); // エラーメッセージを表示
      }
    } catch (error) {
      alert('ログイン処理中にエラーが発生しました');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className='flex justify-center'>
        <img src={Luxon} alt="" className='mt-32'/>
      </div>
      <div className="shadow-2xl bg-white rounded-2xl p-8  max-w-md mt-12 mx-6">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'ログイン' : '新規作成'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <p className='mt-4'>プレイヤーID</p>
          <input
            type="text"
            name="username"
            placeholder="プレイヤーIDを入力"
            className="bg-gray-200 border-2 border-gray-500 h-10 rounded-md  mt-1"
            value={formData.username}
            onChange={handleChange}
          />
          <p className='mt-4'>パスワード</p>
          <input
            type="password"
            name="password"
            placeholder="パスワードを入力"
            className=" bg-gray-200 border-2 border-gray-500 rounded-md shadow-2xl h-10 mt-1"
            value={formData.password}
            onChange={handleChange}
          />
          {!isLogin && (
            <>
              <p className="mt-4">確認用パスワード</p>
              <input
                type="password"
                name="confirmPassword"
                placeholder="確認用パスワードを入力"
                className="bg-gray-200 border-2 border-gray-500 rounded-md shadow-2xl h-10 mt-1"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </>
          )}
          {isLogin && (
            <button type="button" className='text-left text-red-500 underline'>パスワードをお忘れの方はこちら</button>
          )}
          <button type="submit" className="h-10 text-white  border-2 border-black bg-gray-400 rounded-xl mx-8 mt-8 mb-4">
            {isLogin ? 'ログイン' : '新規登録' }
          </button>
          <button type="button" className='text-red-500 underline' onClick={() => setIsLogin(!isLogin)}>{!isLogin ? 'ログインはこちら' : '新規登録はこちら' }</button>
        </form>
      </div>
    </>
  )
}

export default Login