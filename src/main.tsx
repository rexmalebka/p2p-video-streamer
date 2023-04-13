import * as ReactDOM from "react-dom"
import React , { useEffect, useState, useRef } from 'react';
import Index from './index.tsx'

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
ReactDOM.render(<Index></Index>, document.querySelector("#app"))
