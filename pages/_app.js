import '../styles/globals.css';
import { RobinhoodProvider } from '../contexts/RobinhoodContext';

function MyApp({ Component, pageProps }) {
  return (
    <RobinhoodProvider>
      <Component {...pageProps} />
    </RobinhoodProvider>
  );
}

export default MyApp;
