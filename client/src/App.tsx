import React from 'react';
import './App.css';
import CollaborativeEditor from './components/CollaborativeEditor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Collaborative Editor</h1>
      </header>

      <main className="App-main">
        <CollaborativeEditor roomName="my-room" />
      </main>
    </div>
  );
}

export default App;
