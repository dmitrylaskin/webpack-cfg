import React, {useState} from 'react';
import styles from './App.module.scss'
import {Outlet} from "react-router-dom";
import icon from '@/assets/wifi.png'

const App = () => {
    const [state, setState] = useState(false)

    return (
        <div className={styles.main}>
            <h1 style={{color: `${state ? 'red' : 'blue'}`}}>hello</h1>
            <button onClick={() => setState(v => !v)}>Button</button>
            <h2>test</h2>
            <span>green</span>
            <Outlet/>
            <img width={50} height={50} src={icon} alt="icon"/>
            <h2>PLATFORM: {__PLATFORM__}</h2>
        </div>
    );
};

export {App};