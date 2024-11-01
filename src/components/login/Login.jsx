import React from 'react'

const Login = () => {
  return (
    <>
      <div className="m-auto border-4 rounded-2xl">
        <form action="/" method='POST' className="flex flex-col">
          <p>プレイヤーID</p>
          <input type="text" placeholder="プレイヤーIDを入力" className="border-4 rounded-2xl"></input>
          <p>パスワード</p>
          <input type="password" placeholder="パスワードを入力" className="border-4 rounded-2xl"></input>
          <p>確認用パスワード</p>
          <input type="password" placeholder="確認用パスワードを入力" className="border-4 rounded-2xl"></input>
          <button type="submit" className="text-red-500 border-4 rounded-2xl my-5">ログイン</button>
        </form>
      </div>
    </>
  )
}

export default Login