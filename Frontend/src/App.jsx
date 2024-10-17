import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EditorPage from './components/editorPage';
import Home from './components/home';


function App() {
  return (
    <>
    <Router>
      <div className="App">
        <div className="container mx-auto mt-10">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </div>
      </div>
    </Router>
    </>
  )
}

export default App