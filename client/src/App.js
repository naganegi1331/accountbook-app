import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Input from './components/Input.jsx';
import Edit from './components/Edit.jsx';
import Graph from './components/Graph.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Input />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/graph" element={<Graph />} />
      </Routes>
    </Router>
  );
}

export default App;
