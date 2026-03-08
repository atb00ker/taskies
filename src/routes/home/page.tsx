import type React from 'react';
import { useEffect } from 'react';

const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'Home';
  }, []);

  return <h1>Taskies</h1>;
};

export default Home;
