import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { abi, contractAddress } from "./utils/constants";
import { Trophy } from "lucide-react";
import toast from "react-hot-toast";

const ContractComponent = () => {
  const [account, setAccount] = useState(null);
  const [dataloading,setDataLoading] = useState(false);
  const [addPointsLoading,setAddPointsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState(null);
  console.log(network)
  const [data, setData] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(0); // State for points to add
  const [addressToAdd, setAddressToAdd] = useState(""); // State for the address to which points will be added

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
        toast.error('Please install MetaMask!');
      }
    };

    connectMetaMask();
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      toast.error('Please connect to MetaMask.');
      setAccount(null);
      setIsConnected(false);
      setData(null);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const fetchData = async () => {
    setDataLoading(true)
    if (!account) {
      toast.error('No account connected. Please connect your wallet.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    try {
      const data = await contract.checkRewardPoints(account);
      setData(data.toString() === '0' ? '0' : data.toString());
      setDataLoading(false)
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data from contract');
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
          toast.error('Please connect to MetaMask.');
        } else {
          console.error(err);
          toast.error('Something went wrong');
        }
      }
    } else {
      toast.error('Please install MetaMask!');
    }
  };

  const addRewardPoints = async () => {
    setAddPointsLoading(true)
    if (!account || !isConnected) {
      toast.error('Please connect to MetaMask and select an account.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
      const signer = await provider.getSigner();
      const tx = await contract.connect(signer).addRewardPoints(addressToAdd, pointsToAdd);
      await tx.wait();
      fetchData(); 
      setPointsToAdd(0); 
      setAddressToAdd("");
      setAddPointsLoading(false) // Reset address input after adding points
      toast.success('Reward points added successfully!'); // Success notification
    } catch (error) {
      console.error(error);
      toast.error('Error adding points');
    }
  };

  return (
    <div className="">
      <div className="fixed right-3 top-3">
        <button onClick={connectWallet} className="flex bg-black justify-center text-white px-3 py-2 rounded-lg">
          <h1 className="w-24 truncate">{isConnected ? `${account}` : `Connect Wallet`}</h1>
        </button>
      </div>

    
      

      <div className="mt-16 flex items-center flex-col ">
        <h1 className="text-3xl text-neutral-700 font-bold">Fitness Club Reward Tracker</h1>

        <div className="flex flex-col items-center mt-6">
          <input
            type="text"
            value={addressToAdd}
            onChange={(e) => setAddressToAdd(e.target.value)}
            className="border rounded-md p-2 mb-2"
            placeholder="Address to add points"
          />
          <input
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(e.target.value)}
            className="border rounded-md p-2"
            placeholder="Points to add"
          />
          <button
            onClick={addRewardPoints}
            className="bg-green-500 mt-2 text-white px-3 py-2 rounded-md shadow-sm"
            disabled={addPointsLoading || !isConnected || pointsToAdd <= 0 || !addressToAdd }
          >
           {
            addPointsLoading ? <div className="flex items-center gap-2">
                  <div className="h-3 w-3 border border-t-transparent rounded-full animate-spin"></div>
                  Adding ...
            </div> : <div> Add Points</div>
           }
          </button>
        </div>

        <button
          onClick={fetchData}
          className="bg-blue-700 mt-6 text-white px-3 py-2 rounded-md shadow-sm"
          disabled={!isConnected} 
        >
          {
            dataloading ? <div className="flex items-center gap-2">
                  <div className="h-3 w-3 border border-t-transparent rounded-full animate-spin"></div>
                  Fetching...
            </div> : <div> My Rewards</div>
           }
        </button>
        {data !== null && <p className="flex items-center gap-2 mt-5">{data} <Trophy className="text-yellow-400" size={18} /></p>}
      </div>
    </div>
  );
};

export default ContractComponent;
