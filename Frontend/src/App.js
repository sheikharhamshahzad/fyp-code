import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './header';
import Banner from './banner';
import Steps from './steps';
import Features from './features';
import Faq from './faq';
import Reviews from './reviews';
import Footer from './footer';
import Upload from './upload';  
import Options from './options'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Homepage Route */}
          <Route path="/" element={
            <>
              <Header />
              <Banner />
              <Steps />
              <Features />
              <Faq />
              <Reviews />
              <Footer />
            </>
          } />

          {/* Upload Route */}
          <Route path="/upload" element={<Upload />} />

          {/* Options Route */}
          <Route path="/options" element={<Options />} />

          {/* Processing Route (for processing the file after enhancement) */}
          <Route path="/process/:fileName" element={<div>Processing...</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
