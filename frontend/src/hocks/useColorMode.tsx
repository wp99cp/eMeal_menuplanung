import { useEffect } from 'react';
import useLocalStorage from '@/hocks/useLocalStorage';


const toggleDarkMode = (colorMode: string) => (colorMode === 'light' ? 'dark' : 'light');


const useColorMode = () => {

  const [colorMode, setColorMode] = useLocalStorage('color-theme', 'light');

  useEffect(() => {
    const className = 'dark';
    const bodyClass = (window?.document.body.parentNode as HTMLElement).classList;

    colorMode === 'dark' ? bodyClass.add(className) : bodyClass.remove(className);

    // TODO: if signed in, save the color mode to the Database
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export { toggleDarkMode, useColorMode };
