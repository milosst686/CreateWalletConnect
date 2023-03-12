import { SignClient } from '@walletconnect/sign-client';
import { Web3Modal } from '@web3modal/standalone';
import { useEffect,useState } from 'react';
import './App.css';

const web3Modal = new Web3Modal({
  projectId: process.env.REACT_APP_PROJECT_ID,
  standaloneChains: ["eip155:5"]
})

function App() {
  const [signClient, setSignClient] = useState();
  const [sessions, setSessions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  async function createClient(){
    try {
      const client = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID
      })
      console.log('client', client);
      setSignClient(client);
      await subscribeToEvents(client);
    } catch (e) {
      console.log(e);
    }
  }

  async function handleConnect(){
    if(!signClient) throw Error("Cannot connect. Sign Client is not created");
    try {

      // dapp is going to send a proposal namespace
           const proposalNamespace={
        eip155:{
          chains: ["eip155:5"],
          methods: ["eth_sendTransaction"],
          events: ["connect", "disconnect"]
        }
      };

      const {uri, approval} = await signClient.connect({
        requiredNamespaces: proposalNamespace
      });

      //Opening popup for scaning wallet
      if(uri){
        web3Modal.openModal({uri});
        const sessionNamespace= await approval();
        onSessionConnect(sessionNamespace);
        web3Modal.closeModal();
      }

    } catch (e) {
      console.log(e);
    }
  }

  async function onSessionConnect(session){
    if(!session) throw Error("Session doesn't exist");
    try {
      setSessions(session);
      setAccounts(session.namespaces.eip155.accounts[0].slice(9));
      
    } catch (e) {
      console.log(e);
      
    }
  }

  async function handleDisconnect(){
    try {
      await signClient.disconnect({
        topic: sessions.topic,
        code: 6000,
        message: "User disconnected"
      });
      reset();
    } catch (error) {
      console.log(error);
    }
  }

  async function subscribeToEvents(client){
    if(!client) throw Error("No events to subscribe to b/c the client does not ecist");

    try {
      client.on("session_delete",() =>{
        console.log("User disconnected the session from their wallet");
        reset();
      })
      
    } catch (e) {
     console.log(e);
    }
  }

  const reset = ()=>{
    setAccounts([]);
    setSessions([]);
  }

  useEffect(()=> {
    if(!signClient){
      createClient();
    }
  }, [signClient]);

  return (
    <div className="App">
     <h1>Wallet Connect</h1>
   {accounts.length ? 
   (<>
   <p>{accounts}</p>
   <button onClick={handleDisconnect}>Disconnect</button>
   </>): 
   (<button onClick={handleConnect} disabled={!signClient}>Connect</button>)}
    </div>
  );
}

export default App;
