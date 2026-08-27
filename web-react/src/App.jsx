import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Demo from './pages/Demo';
import Copilot from './pages/Copilot';

export default function App() {
  return (
    <div className="min-h-screen bg-ink">
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden" aria-hidden>
        <span className="absolute -top-40 -left-24 w-[500px] h-[500px] rounded-full bg-primary-dark opacity-30 blur-[90px]" />
        <span className="absolute top-[40%] -right-36 w-[400px] h-[400px] rounded-full bg-blue-600 opacity-30 blur-[90px]" />
        <span className="absolute -bottom-40 left-[40%] w-[350px] h-[350px] rounded-full bg-primary-bright opacity-20 blur-[90px]" />
      </div>

      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/copilot" element={<Copilot />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}