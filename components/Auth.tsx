import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import SocialLogin from '@biconomy/web3-auth';
import { ChainId } from "@biconomy/core-types";
import { ethers } from 'ethers';
import SmartAccount from '@biconomy/smart-account';
import { css } from '@emotion/css';
import Counter from './Counter';

import { IDKitWidget, solidityEncode, internal } from '@worldcoin/idkit'


export default function Auth() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const [provider, setProvider] = useState<any>(null);


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
