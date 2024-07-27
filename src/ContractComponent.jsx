import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { abi, contractAddress } from "./utils/constants";
import { Trophy } from "lucide-react";

const ContractComponent = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

console.log(network)

  useEffect(() => {
    const connectMetaMask = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = provider.selectedAddress ? [provider.selectedAddress] : [];
        handleAccountsChanged(accounts);
        handleNetworkChanged(provider.networkVersion);
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleNetworkChanged);
      } else {
        setError('Please install MetaMask!');
      }
    };

    connectMetaMask();
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setError('Please connect to MetaMask.');
      setAccount(null);
      setIsConnected(false);
      setData(null); // Reset data if disconnected
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
    }
  };

  const fetchData = async () => {
    if (!account) {
      setError('No account connected. Please connect your wallet.');
      return;
    }
  
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    try {
      const data = await contract.checkRewardPoints(account);
  
   
      if (data.toString() === '0') {
        setData('0');
      } else {
        setData(data.toString());
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch data from contract');
    }
  };
  

  const handleNetworkChanged = (networkId) => {
    setNetwork(networkId);
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
      } catch (err) {
        if (err.code === 4001) {
          setError('Please connect to MetaMask.');
        } else {
          console.error(err);
          setError(err.message);
        }
      }
    } else {
      setError('Please install MetaMask!');
    }
  };

  return (
    <div className="">
      <div className="fixed right-3 top-3">
        <button onClick={connectWallet} className="flex bg-black justify-center text-white px-3 py-2 rounded-lg">
          <h1 className="w-24 truncate">{isConnected ? `${account}` : `Connect Wallet`}</h1>
        </button>
      </div>

      <div className="fixed left-3 top-3">
        <button
          onClick={fetchData}
          className="flex bg-white ring-1 ring-blue-700 justify-center text-black px-3 py-2 rounded-lg"
          disabled={!isConnected} 
        >
          <h1 className="whitespace-nowrap">Add Reward Points</h1>
        </button>
      </div>

      <div className="mt-16 flex items-center flex-col ">
        <h1 className="text-3xl text-neutral-700 font-bold">Fitness Club Reward Tracker</h1>

        <button
          onClick={fetchData}
          className="bg-blue-700 mt-6 text-white px-3 py-2 rounded-md shadow-sm"
          disabled={!isConnected} 
        >
          My Reward Points
        </button>
        {data !== null && <p className="flex items-center gap-2 mt-5">{data} <Trophy className="text-yellow-400" size={18} /></p>}
        {error && <p className="text-red-500 mt-2">{error}</p>} 
      </div>
    </div>
  );
}

export default ContractComponent;
