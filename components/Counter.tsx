import React, { useState, useEffect } from "react";
import SmartAccount from "@biconomy/smart-account";
import abi from "../utils/counterAbi.json";
import { ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { css } from '@emotion/css';

interface Props {
  smartAccount: SmartAccount
  provider: any
}

// const counterAddress = "0x6305d48dAFfa321604B87eF8Bf8c2231c611F972"

const Counter: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0)
  const [counterContract, setCounterContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const counterAddress = process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ADDRESS

  useEffect(() => {
    setIsLoading(true)
    getCount(false)
  }, [])

  const getCount = async (isUpdating: boolean) => {
    const contract = new ethers.Contract(
      counterAddress,
      abi,
      provider,
    )
    setCounterContract(contract)
    const currentCount = await contract.count()
    setCount(currentCount.toNumber())
    if (isUpdating) {
      toast.success('count has been updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }

  const incrementCount = async () => {
    try {
      toast.info('processing count on the blockchain!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const incrementTx = await counterContract.populateTransaction.incrementCount()
      const tx1 = {
        to: counterAddress,
        data: incrementTx.data,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx1 })

      const txHash = await txResponse.wait();
      console.log(txHash)
      getCount(true)

     

      const currentCount = await counterContract.count()
      setCount(currentCount.toNumber())

    } catch (error) {
      console.log({ error })
      toast.error('error occured check the console', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className={buttonWrapperStyle}>
        <button className={buttonStyle} onClick={() => incrementCount()}>
          count is {count}
        </button>
      </div>

    </>
  )
};

export default Counter;


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