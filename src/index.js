import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

// Add the following styles to match the index.html from seychess
const style = document.createElement('style');
style.innerHTML = `
    .navbar-content {
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
    }
    .no-wrap {
        white-space: nowrap;
    }
    .center-align {
        text-align: center;
    }
`;
document.head.appendChild(style);

// Add the favicon link
const link = document.createElement('link');
link.rel = 'icon';
link.href = 'web-icon.ico';
link.type = 'image/x-icon';
document.head.appendChild(link);
