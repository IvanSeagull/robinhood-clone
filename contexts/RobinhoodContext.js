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
import swapTokens from '../pages/api/swapTokens';

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

  const getToAddress = () => {
    switch (toCoin) {
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

  const getToAbi = () => {
    switch (toCoin) {
      case 'DOGE':
        return dogeAbi;
      case 'BTC':
        return bitcoinAbi;
      case 'SOLANA':
        return solanaAbi;
      case 'USDC':
        return usdcAbi;
      default:
        return null;
    }
  };

  const mint = async () => {
    try {
      if (coinSelect === 'ETH') {
        if (!isAuthenticated) return;
        await Moralis.enableWeb3();
        const contractAddress = getToAddress();
        const abi = getToAbi();
        let options = {
          contractAddress,
          functionName: 'mint',
          abi,
          params: {
            to: currentAccount,
            amount: Moralis.Units.Token('50', '18'),
          },
        };

        sendEth();
        const transaction = await Moralis.executeFunction(options);
        const receipt = await transaction.wait(4);
        saveTransaction(receipt.transactionHash, amount, receipt.to);
      } else {
        swapTokens();
        saveTransaction(receipt.transactionHash, amount, receipt.to);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const swapTokens = async () => {
    try {
      if (!isAuthenticated) return;
      await Moralis.enableWeb3();
      if (coinSelect === toCoin) return;

      const fromOptions = {
        type: 'erc20',
        amount: Moralis.Units.Token(amount, '18'),
        receiver: getContractAddress(),
        contractAddress: getContractAddress(),
      };

      const toMintOptions = {
        contractAddress: getToAddress(),
        functionName: 'mint',
        abi: getToAbi(),
        params: {
          to: currentAccount,
          amount: Moralis.Units.Token(amount, '18'),
        },
      };

      let fromTransaction = await Moralis.transfer(fromOptions);
      let toMintTransaction = await Moralis.executeFunction(toMintOptions);
      let fromReceipt = await fromTransaction.wait();
      let toReceipt = await toMintTransaction.wait();
      console.log(fromReceipt);
      console.log(toReceipt);
    } catch (error) {
      console.error(error);
    }
  };

  const sendEth = async () => {
    if (!isAuthenticated) return;

    const contractAddress = getToAddress();

    let options = {
      type: 'native',
      amount: Moralis.Units.ETH('0.01'),
      receiver: contractAddress,
    };

    const transaction = await Moralis.transfer(options);
    const receipt = await transaction.wait(0);
    console.log(receipt);
    saveTransaction(receipt.transactionHash, amount, receipt.to);
  };

  const saveTransaction = async (txHash, amount, toAddress) => {
    await fetch('/api/swapTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash,
        from: currentAccount,
        to: toAddress,
        amount: parseFloat(amount),
      }),
    });
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
        setAmount,
        mint,
        setCoinSelect,
        coinSelect,
        balance,
        swapTokens,
        amount,
        toCoin,
        setToCoin,
      }}>
      {children}
    </RobinhoodContext.Provider>
  );
};
