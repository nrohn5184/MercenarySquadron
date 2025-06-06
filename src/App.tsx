import React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PilotManagement from './components/PilotManagement';
import Hangar from './components/Hangar';
import Campaigns from './components/Campaigns';

const App: React.FC = () => {
  return (
    <Router>
      <Box minH="100vh" bg="gray.800" color="white">
        <Navigation />
        <Box p={4}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pilots" element={<PilotManagement />} />
            <Route path="/hangar" element={<Hangar />} />
            <Route path="/campaigns" element={<Campaigns />} />
          </Routes>
        </Box>
      </Box>
      <div id="modal-root" />
    </Router>
  );
};

export default App;
