import '../styles/globals.css';
import { RobinhoodProvider } from '../contexts/RobinhoodContext';
import { MoralisProvider } from 'react-moralis';
import { config } from '../moralisConfig';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider appId={config.appId} serverUrl={config.serverUrl}>
      <RobinhoodProvider>
        <Component {...pageProps} />
      </RobinhoodProvider>
    </MoralisProvider>
  );
}

export default MyApp;
