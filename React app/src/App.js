import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
//import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [currAccount, setCurrentAccount] = React.useState("")
  const contractAddress = "0x685D6054aA14AbB0ACcA08De747180cDaBA62969"
  const contractABI = abi.abi

  const checkIfWalletIsConnected = () => {

    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have matamask!")
      return
    } else {
      console.log("We have the ethereum object", ethereum)
    }

    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log(accounts)
      if(accounts.lenghts !== 0) {
        const account = accounts[0]; 
        console.log("Found an authorized account: ", account)
        setCurrentAccount(account);
        getAllWaves();
      } else {
      console.log("No authorized account found")
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!")
    }

    ethereum.request({ method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err));
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    const message = document.getElementById("message").value;

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave(message)
    console.log("Mining...", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())

    getAllWaves();
  }

  const [allWaves, setAllWaves] = React.useState([])
  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves()

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log("cleaned", wavesCleaned)
    setAllWaves(wavesCleaned)

    waveportalContract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      setAllWaves(oldArray => [...oldArray,{
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })

    setAllWaves(wavesCleaned)
  }

  React.useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
    
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Yanis and I developed a way to message me On-Chain. Connect your Ethereum wallet and wave at me!
        </div>
        <br/>
        <label for="message">Write a message here...</label>
          <div className="block_container">
              <div className="bloc1">
                <textarea id="message" name="message" rows="5" cols="33"></textarea>
              </div>
              <div className="bloc2">
                <button className="glow-on-hover" onClick={wave}>
                    Wave at Me
                </button>
              </div>
          </div>
        <div>

        </div>
       

        {currAccount ? null : (
          <button className="glow-on-hover" align='center' onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div>{allWaves.length}</div>
        <br/>
        {allWaves.map((wave, index) => {
          return (
            <div className="card-message">
              <div> From: {wave.address}</div>
              <div> Message: {wave.message}</div>
              <div> At {wave.timestamp.toUTCString()}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
