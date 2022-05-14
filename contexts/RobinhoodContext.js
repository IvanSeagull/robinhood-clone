import { createContext, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

import {
  dogeAbi,
  bitcoinAbi,
  solanaAbi,
  usdcAbi,
  dogeAddress,
  bitcoinAddress,
  solanaAddress,
  usdcAddress,
} from '../lib/constants';

export const RobinhoodContext = createContext();

export const RobinhoodProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [formattedAccount, setFormattedAccount] = useState([]);
  const [coinSelect, setCoinSelect] = useState('DOGE');
  const [toCoin, setToCoin] = useState('');
  const [balance, setBalance] = useState('');
  const [amount, setAmount] = useState('');

  const { isAuthenticated, authenticate, user, logout, Moralis, enableWeb3 } = useMoralis();

  useEffect(() => {
    getAccount();
  }, [isAuthenticated, enableWeb3]);

  const getAccount = async () => {
    if (isAuthenticated) {
      const account = user.get('ethAddress');
      let formatAccount = account.slice(0, 4) + '...' + account.slice(-4);
      setFormattedAccount(formatAccount);
      setCurrentAccount(account);
      const currentBalance = await Moralis.Web3API.account.getNativeBalance({
        chain: 'rinkeby',
        address: currentAccount,
      });
      const balanceToEth = Moralis.Units.FromWei(currentBalance.balance);
      const formattedBalance = parseFloat(balanceToEth).toFixed(3);
      setBalance(formattedBalance);
      console.log(formattedBalance);
    }
  };

  useEffect(() => {
    if (!currentAccount) return;
    (async () => {
      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: currentAccount,
        }),
      });

      const data = await response.json();
    })();
  }, [currentAccount]);

  const getContractAddress = () => {
    switch (coinSelect) {
      case 'DOGE':
        return dogeAddress;
      case 'BTC':
        return bitcoinAddress;
      case 'SOLANA':
        return solanaAddress;
      case 'USDC':
        return usdcAddress;
      default:
        return null;
    }
  };

  const connectWallet = () => {
    authenticate();
  };

  const signOut = () => {
    logout();
  };

  return (
    <RobinhoodContext.Provider
      value={{
        connectWallet,
        signOut,
        currentAccount,
        isAuthenticated,
        formattedAccount,
      }}>
      {children}
    </RobinhoodContext.Provider>
  );
};
