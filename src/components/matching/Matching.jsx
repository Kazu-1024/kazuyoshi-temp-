import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import secHeader from "../../assets/images/Group_83.png";
import cancelButton from "../../assets/images/cancel_button.png";
import MTH from "../../assets/images/MTH.png";
import RatingB from "../../assets/images/Frame_37.png";
import Tag1on1 from "../../assets/images/1on1_tag.png";

const Matching = () => {
  // アクティブなスライドのインデックスを管理するstate
  const [activeIndex, setActiveIndex] = useState(0);
  // スクロール可能なコンテナへの参照を保持するref
  const scrollContainerRef = useRef(null);

  // 表示するスライドのデータ配列-----------------------------
  const cardText = [
    { id: 1, text: "create" },
    { id: 2, text: "read" },
    { id: 3, text: "update" },
    { id: 4, text: "delete" },
    { id: 5, text: "start" },
  ];

  useEffect(() => {
    // スクロールイベントのハンドラー関数
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        // 現在のスクロール位置を取得
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        // 各スライドの幅（ビューポート幅）を取得
        const itemWidth = scrollContainerRef.current.clientWidth;
        // スクロール位置からアクティブなスライドのインデックスを計算
        const newIndex = Math.round(scrollLeft / itemWidth);
        // アクティブなインデックスを更新
        setActiveIndex(newIndex);
      }
    };

    // スクロールイベントリスナーの設定
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // コンポーネントのアンマウント時にイベントリスナーを削除
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []); // 空の依存配列で初回マウント時のみ実行

  // 指定したインデックスのスライドまでスクロールする関数
  const scrollToItem = (index) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.clientWidth;
      // smooth指定で滑らかなスクロールを実現
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: "smooth",
      });
    }
  };

  const navigate = useNavigate();

  const backHomepage = () => {
    navigate(-1);
  };
  //スライドコンテナの切れ端表示する処理
  //-------------------------------------------------------------------------
  return (
    <>
      <div className="relative h-32 border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
        <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
        <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
        <div className="w-5/6 border-t border-2 border-gray-300" />
        <img src={Tag1on1} className="absolute top-2 left-2" />
      </div>
      <div className="mt-16 flex justify-center" aria-label="読み込み中">
        {/*自分のアイコン、ランク、レート表示 */}
        <div className="mr-24">
          <img src={MTH} alt="" className=" rounded-full h-12 w-12 ml-2 mr-4" />
          <div className="flex">
            <img src={RatingB} alt="" className=" rounded-full" />
            <p>1314</p>
          </div>
        </div>
        {/*相手ののアイコン、ランク、レート表示 */}

        <div className="ml-24 animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>

        
      </div>
      {/*暗記カード*/}
      <div className="mt-12 flex justify-center ">
        <div className="pt-2 rounded-t-2xl  w-11/12 bg-gradient-to-r from-gray-400 to-black flex justify-center">
          <img
            src={secHeader}
            width="97%"
            height="90%"
            alt=""
            className="rounded-t-3xl w-15/16 "
          />
        </div>
      </div>

      {/*暗記カードの中身*/}
      <div className="flex justify-center ">
        <div className="rounded-b-2xl shadow-2xl w-11/12 h-64 bg-gradient-to-r from-gray-400 to-black ">
          <div className=" rounded-b-2xl w-15/16  h-60 bg-white m-2">
            <div className=" w-64 mx-auto">
              <div className="w-full mx-auto">
                {/* スクロール可能なスライドコンテナ */}
                {/* snap-x, snap-mandatoryでスナップスクロールを実現 */}
                <div
                  ref={scrollContainerRef}
                  className="pb-0.5  flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* スライドのマッピング */}
                  {cardText.map((item) => (
                    <div
                      key={item.id}
                      className={`shadow-2xl mt-10 flex-none w-full h-36 snap-start bg-white flex items-center justify-center text-black text-2xl border border-black `}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
                {/* ドットインジケーターのコンテナ */}
                <div className="flex justify-center gap-2 mt-4">
                  {/* インジケータードットのマッピング */}
                  {cardText.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToItem(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === index
                          ? "bg-blue-600 w-6"
                          : "bg-gray-300"
                        }`}
                      aria-label={`Scroll to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-32">
        <h1 className="mx-auto text-gray-500">対戦相手を探してます...</h1>
      </div>
      {/*キャンセルボタン */}
      <div className="flex justify-center ">
        <img
          className="mx-auto h-16 w-56 text-white rounded-3xl  "
          onClick={backHomepage}
          src={cancelButton}
          alt=""
        />
      </div>
    </>
  );
};

export default Matching;