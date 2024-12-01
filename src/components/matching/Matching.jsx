import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import secHeader from '../../assets/images/Group 83.png'

const Matching = () => {
  // アクティブなスライドのインデックスを管理するstate
  const [activeIndex, setActiveIndex] = useState(0);
  // スクロール可能なコンテナへの参照を保持するref
  const scrollContainerRef = useRef(null);

  // 表示するスライドのデータ配列
  // 実際のアプリケーションではpropsとして渡すことが多い
  const items = [
    { id: 1, color: 'bg-red-500' },
    { id: 2, color: 'bg-blue-500' },
    { id: 3, color: 'bg-green-500' },
    { id: 4, color: 'bg-yellow-500' },
    { id: 5, color: 'bg-purple-500' }
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
      container.addEventListener('scroll', handleScroll);
      // コンポーネントのアンマウント時にイベントリスナーを削除
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []); // 空の依存配列で初回マウント時のみ実行

  // 指定したインデックスのスライドまでスクロールする関数
  const scrollToItem = (index) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.clientWidth;
      // smooth指定で滑らかなスクロールを実現
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const navigate = useNavigate();

  const backHomepage = () => {
    navigate(-1)
  }
  //スライドコンテナの切れ端表示する処理
  //-------------------------------------------------------------------------
  return (
    <>
      <div className="mt-16 flex justify-center" aria-label="読み込み中">
        <div className="mr-28 animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <div className="ml-28 animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>

      </div>
      {/*セクション*/}
      <div className='mt-12 flex justify-center '>
        <div className='pt-2 rounded-t-2xl  w-11/12 bg-gradient-to-r from-gray-400 to-black flex justify-center'>
          <img src={secHeader} width="97%" height="90%" alt="" className='rounded-t-3xl w-15/16 ' />
        </div>
      </div>
      {/*セクションの中身*/}
      <div className='flex justify-center '>
        <div className='rounded-b-2xl shadow-2xl w-11/12 h-64 bg-gradient-to-r from-gray-400 to-black '>
          <div className=' rounded-b-2xl w-15/16  h-60 bg-white m-2'>
            <div className=' w-64 mx-auto'>
              <div className=" w-full mx-auto">
                {/* スクロール可能なスライドコンテナ */}
                {/* snap-x, snap-mandatoryでスナップスクロールを実現 */}
                <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* スライドのマッピング */}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`mt-10 flex-none w-full h-36 snap-start ${item.color} flex items-center justify-center text-white text-2xl`}
                    >
                      Slide {item.id}
                    </div>
                  ))}
                </div>
                {/* ドットインジケーターのコンテナ */}
                <div className="flex justify-center gap-2 mt-4">
                  {/* インジケータードットのマッピング */}
                  {items.map((_, index) => (
                    <button key={index}onClick={() => scrollToItem(index)}className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300'}`} aria-label={`Scroll to slide ${index + 1}`}/>
                  ))}
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>

      <div className='flex justify-center mt-24'>
        <h1 className='mx-auto'>マッチング待機中・・・</h1>
      </div>
      <div className='flex justify-center '>

        <button onClick={backHomepage} className="mx-auto h-16 w-32 text-white border-4 rounded-3xl border-cyan-300 bg-black ">Cancel</button>
      </div>
    </>
  )
}

export default Matching