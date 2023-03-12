import { SignClient } from '@walletconnect/sign-client';
import { useEffect,useState } from 'react';
import './App.css';

function App() {
  const [signClient, setSignClient] = useState();

  async function createClient(){
    try {
      const client = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID
      })
      console.log('client', client);
      setSignClient(client);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(()=> {
    if(!signClient){
      createClient();
    }
  }, [signClient]);

  return (
    <div className="App">
     <h1>Wallet Connect</h1>
    </div>
  );
}

export default App;
