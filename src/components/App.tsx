import React, {useState} from 'react';
import styles from './App.module.scss'
import {Outlet} from "react-router-dom";

const App = () => {
    const [state, setState] = useState(false)
    return (
        <div className={styles.main}>
            <h1 style={{color: `${state ? 'red' : 'blue'}`}}>hello</h1>
            <button onClick={() => setState(v => !v)}>Button</button>
            <h2>test</h2>
            <span>green</span>
            <Outlet/>
        </div>
    );
};

export {App};