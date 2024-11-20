import React, { useState } from 'react'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // クッキーを含める
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // ログイン成功メッセージ
        // ここでリダイレクトなどの処理を追加できう
      } else {
        alert(data.message || 'ログインに失敗しました'); // エラーメッセージを表示
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
      <div className="m-auto border-4 rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <p>プレイヤーID</p>
          <input
            type="text"
            name="username"
            placeholder="プレイヤーIDを入力"
            className="border-4 rounded-2xl"
            value={formData.username}
            onChange={handleChange}
          />
          <p>パスワード</p>
          <input
            type="password"
            name="password"
            placeholder="パスワードを入力"
            className="border-4 rounded-2xl"
            value={formData.password}
            onChange={handleChange}
          />
          <p>確認用パスワード</p>
          <input
            type="password"
            name="confirmPassword"
            placeholder="確認用パスワードを入力"
            className="border-4 rounded-2xl"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit" className="text-red-500 border-4 rounded-2xl my-5">
            ログイン
          </button>
        </form>
      </div>
    </>
  )
}

export default Login