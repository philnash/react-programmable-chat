import React, { Component } from 'react';
import './App.css';
import ChatApp from './ChatApp.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <h1>Twilio Programmable Chat!</h1>
        </header>
        <ChatApp />
      </div>
    );
  }
}

export default App;
