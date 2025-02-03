import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [messageData, setMessageData] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // 初期値を false に変更
  const navigate = useNavigate();
  const url = "ws://localhost:8080/matchmaking";

  useEffect(() => {
    if (!isConnected) {
      const websocket = new WebSocket(url);
      setIsConnected(true);

      websocket.onopen = () => {
        console.log("WebSocket接続確立");
        setWs(websocket); // 状態を更新
      };

      websocket.onmessage = (event) => {
        const responseData = JSON.parse(event.data);
        console.log("コンテキストで受け取ったメッセージ", responseData);
        setMessageData(responseData); // メッセージデータを更新
      };

      websocket.onclose = () => {
        console.log("WebSocket切断");
        setWs(null);
        navigate('/'); // 接続が切れたときにルートへリダイレクト
      };

      websocket.onerror = (error) => console.error("WebSocketエラー:", error);

      return () => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.close();
        }
      };
    }
  }, [isConnected, navigate]); // `isConnected` と `navigate` を依存配列に追加

  return (
    <WebSocketContext.Provider value={{ ws, messageData }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
