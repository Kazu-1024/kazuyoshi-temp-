import React, { useImperativeHandle } from 'react'

const UserData = () => {
    const getUserName = () => {

    };

    const getUserIcon = () => {
        
    };

    useImperativeHandle(ref, () => ({
        name: getUserName,
        icon: getUserIcon
    }));
}

export default UserData