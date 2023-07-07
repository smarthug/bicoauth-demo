import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import SocialLogin from '@biconomy/web3-auth';
import { ChainId } from "@biconomy/core-types";
import { ethers } from 'ethers';
import SmartAccount from '@biconomy/smart-account';
import { css } from '@emotion/css';
import Counter from './Counter';

import { IDKitWidget, solidityEncode, internal } from '@worldcoin/idkit'


import Axios from 'axios';

export default function Auth() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const [provider, setProvider] = useState<any>(null);

  const [nullifierHash, setNullifierHash] = useState<string | null>(null);


  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }

    return () => {
      clearInterval(configureLogin);
    };
  }, [interval]);

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      // const signature1 = await socialLoginSDK.whitelistUrl(
      //   'https://biconomy-social-auth.vercel.app'
      // );
      const signature2 = await socialLoginSDK.whitelistUrl(
        'http://127.0.0.1:3000/'
      );
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI),
        network: 'testnet',
        whitelistUrls: {
          // 'https://biconomy-social-auth.vercel.app': signature1,
          'http://127.0.0.1:3000/': signature2,
        },
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      // sdkRef.current.showConnectModal()
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) return;
    sdkRef.current.hideWallet();
    setLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(sdkRef.current.provider);
    setProvider(web3Provider);
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY
          }
        ]
      });

      await smartAccount.init();
      setSmartAccount(smartAccount);
      setLoading(false);
    } catch (err) {
      console.log('error setting up smart account... ', err);
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.');
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  };

  function test() {
    console.log('test');

    console.log(smartAccount)
  }


  async function onSuccess(response) {
    console.log('response', response)

    console.log("enter the concert")

    // const worldTicketAddress = "0x1c3aDb05b8a51ec6D941cC266E72a62964D94bC2";

    // const worldTicketContract = new ethers.Contract(worldTicketAddress, EthSeoulABI.abi, signer);

    // const contractWithSigner = worldTicketContract.connect(signer)

    // const unpackedProof = ethers.utils.defaultAbiCoder.decode(['uint256[8]'], response.proof)[0]
    // const decodedMerkleRoot = decode("uint256", response.merkle_root)
    // const decodedNullifierHash = decode("uint256", response.nullifier_hash)

    // const gasEstimated = await worldTicketContract.estimateGas.mint(account.address, decodedMerkleRoot, decodedNullifierHash, unpackedProof, account.address)
    // console.log("gasEstimated", gasEstimated)

    // const tx = await contractWithSigner.mint(account.address, decodedMerkleRoot, decodedNullifierHash, unpackedProof, account.address, { gasLimit: "1000000" })
    // const rc = await tx.wait()

    // console.log(tx);
    // console.log(rc);

    // const reqBody = {
    //   nullifier_hash: response.nullifier_hash,
    //   merkle_root: response.merkle_root,
    //   proof: response.proof,
    //   credential_type: response.credential_type,
    //   action: response.action,
    //   signal: smartAccount.address,
    // };
    setNullifierHash(response.nullifier_hash)


  }



  return (
    <div className={containerStyle}>

      <div className={imagestyle}>
        <img src={'https://raw.githubusercontent.com/bcnmy/sdk-demo/c33591f04e9304a339d64af4cea6b17a6b861091/public/img/logo.svg'} alt="Biconomy Logo" />
        <h1 className={headerStyle}>Get your SCW using Biconomy</h1>
      </div>

      {!!smartAccount &&
        <div className={buttonWrapperStyle}>


          <button className={buttonStyle} onClick={test}>console.log smart account</button>
        </div>
      }

      <div className={buttonWrapperStyle}>


        <IDKitWidget
          app_id="app_staging_24e942c5a9e13eaba62ff6917dfaab6b" // obtained from the Developer Portal
          action="human" // this is your action identifier from the Developer Portal (can also be created on the fly)
          signal={smartAccount?.address} // any arbitrary value the user is committing to, e.g. for a voting app this could be the vote
          onSuccess={onSuccess}
          credential_types={['orb']} // the credentials you want to accept
          // walletConnectProjectId="get_this_from_walletconnect_portal" // optional, obtain from WalletConnect Portal
          enableTelemetry
        >
          {({ open }) => <button
            className={buttonStyle}
            onClick={open}

          >
            Verify as a human
          </button>}
        </IDKitWidget>

      </div>

      <div className={accountStyle} style={{
        color: 'gray',
      }}>

        <h3>nullifier_hash: {nullifierHash}</h3>
        
      </div>


      {!!smartAccount && <Counter smartAccount={smartAccount} provider={provider} />}




      <div className={buttonWrapperStyle}>

        {
          !smartAccount && !loading && <button className={buttonStyle} onClick={login}>Login</button>
        }

        {
          loading && <p>Loading account details...</p>
        }

      </div>


      {
        !!smartAccount && (
          <div className={containerStyle}>
            <div className={accountStyle}>
              <h3>Smart account address: {smartAccount.address}</h3>
            </div>

            <div className={buttonWrapperStyle}>
              <button className={buttonStyle} onClick={() => window.open(`https://polygonscan.com/address/${smartAccount.address}`, '_blank')}>View Contract on PolygonScan</button>
            </div>
            <div className={buttonWrapperStyle}>
              <button className={buttonStyle} onClick={logout}>Logout</button>
            </div>
          </div>
        )
      }


    </div>
  )
}



const buttonStyle = css`
padding: 20px;
width: 300px;
border: 100px;
cursor: pointer;
border-radius: 999px;
outline: none;
margin-top: 10px;
background-color:#CC5500;
transition: all .25s;
&:hover {
background-color: black ; 
color:white;
}
font-size: 20px;
font-family:'Helvetica';
`

const buttonWrapperStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top:50px;
  color: black;
  font-size:20px;
`;

const headerStyle = css`
font-size: 32px;
padding-left: 550px;
color: black;
font-family: 'Helvetica';
`

const containerStyle = css`
width: 100%;
margin: 0 auto;
align-items: center;
padding-top: 40px;
background-color: #fffef6;
height: 100vh;

`


const imagestyle = css`
height: 80px;
background: inherit;
box-shadow: none;
border-bottom: 3px solid black;
margin-bottom: 10px;
display: flex;
padding-left : 30px;
padding-bottom:60px;

`

const accountStyle = css`
display: flex;
font-family :'helvetica';
color : black ;
font-size : 25px;
justify-content: center;
border : 4px solid orange;
padding-top:25px;
padding-bottom:25px;
padding-left:10px;
padding-right:10px;

`


const response = {
  "merkle_root": "0x049befbab9fe5f731b8c02e7f6616c140220130aa65875da9c3cd98fa1dded03",
  "nullifier_hash": "0x235a46e7050559b13567c3c6658d44c6f3ef88c84930fcf348844397756d3321",
  "proof": "0x231ccb30e30afe1376aba5a486355a0839b4f590e65526ad29c5a45909b9bf152ec85a912f80944386d97765c4033ffae8be5fd2db021c83ec99652951452e51178a5d3a09262aa64407340a2b6e544c55f02d70306142d716c4823baf9f09a90ae8c03e82ac9e2850c261db2fce6f5bb8512bdca4597970daef78edeb728d792a884722a2c81f7131ed6e4821cbac1a06f4268f6da2a5f020d9f593f8d70ca505a33f5c915b3b125834b53b451e3039c9d228742658b94ced047f1a12be32f0211d5cca3d79cdc7849bc4e47d1cc76b6137b5317776c0fe5897a699575dcf860460d06ec979e525196479c3e3337d41fcd766aa866f1f9a57f32a3b8801b54b",
  "credential_type": "orb",
  "chain": "polygon"
}

const response2 = {
  "merkle_root": "0x049befbab9fe5f731b8c02e7f6616c140220130aa65875da9c3cd98fa1dded03",
  "nullifier_hash": "0x235a46e7050559b13567c3c6658d44c6f3ef88c84930fcf348844397756d3321",
  "proof": "0x045faa77638b4d36227b5a9b09a9630452ca8fd4f86acfdc78337ed84dbba74820c731e341923741bfc21fbe7236de477ddadf169a1c25bec5858be7a58fb31a165ff013e91ac3f0955cf9e7cb7407055655805dfe8b9ecd8cf9ffea4fe367d325b13c661b2fcaf918f9e4d7be4fcc48ee38f461b4def850614120d15033a92110d1963afec32d7fb0a195553d4ef4cb1552db60500fdda742f49e4b4293fb091f860745e9fc4e38052c50f56ceb98612b78c08b956613808a5da80ff697f840229794a20a698b8d60fd2f11ab9fd1e23e535f89a82813e4f4d93556b466e41c1da26e11c1a8c8f1a07366cf48e7a8b268241ed77a2c86b97f3f7d427aa377eb",
  "credential_type": "orb",
  "chain": "polygon"
}

//"0x228542a98fe718ed7718cba25fa827bdc73929fccd2a1deab47d65af32ae0f88"
//"0x228542a98fe718ed7718cba25fa827bdc73929fccd2a1deab47d65af32ae0f88"