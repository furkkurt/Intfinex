import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import PhoneAuth from './components/PhoneAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PhoneAuth isLogin={true} />} />
        <Route path="/register" element={<PhoneAuth isLogin={false} />} />
      </Routes>
    </Router>
  );
}

export default App; 