import React, {useState, useEffect} from 'react'
import ratingBg from '../../assets/images/ratingBg.png'

const PlayerRating = ({ username, position }) => {
    const [PlayerRating, setPlayerRating] = useState(1500);

    useEffect(() => {
        const fetchRating = async () => {
            try{
                const endpoint = `http://localhost:8080/rate/user${username ? `?username=${username}` : ""}`;
                console.log("Requesting with username:", username);

                const response = await fetch(endpoint, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("レートの取得に失敗");
                }

                const data = await response.json();
                console.log(data);
                setPlayerRating(data.rating);
            } catch (error) {
                console.error(error);
            } 
        };

        fetchRating();
    }, [username]);

    const positionStyle = {
        "home": "absolute right-1 top-1 w-24",
        "result": "relative w-24"
    }
    return (
        <>
            <div className={positionStyle[position]} >
                <div className="relative">
                    <img src={ratingBg} alt="ratingBg" role="presentation" draggable="false" className="w-full h-full object-cover" />
                    <p className="absolute inset-0 left-10 flex items-center text-black font-jaro tracking-wider text-xl outlined-bold">
                        {PlayerRating}
                    </p>
                </div>

            </div>
        </>
    )
}

export default PlayerRating