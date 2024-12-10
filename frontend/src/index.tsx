import './index.css'; // Assuming you have some global styles

import App from './App';
import { Provider } from 'react-redux';
import React from 'react';
import { createRoot } from 'react-dom/client';
import store from './store';

const container = document.getElementById('root');
const root = createRoot(container!); // Create a root.

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);