import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app/App';
import {Utils} from "./Utils";
import * as xml from 'xml2js';
import ClothesService, {ClothesMapDlc, CustomClothesMap} from "./services/ClothesService";
import {componentIds} from "./components";

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
