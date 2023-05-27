import { createContext, useState, useEffect, useContext } from 'react'
import Web3 from 'web3'
import createLotteryContract from '../utils/LotteryContract'

export const appContext = createContext()

export const AppProvider = ({ children }) => {
  const [address, setAddress] = useState('')
  const [web3, setWeb3] = useState()
  const [lotteryContract, setLotteryContract] = useState()
  const [lotteryId, setLotteryId] = useState(0)
  const [lotteryPot, setLotteryPot] = useState('0 MATIC')
  const [lotteryPlayers, setLotteryPlayers] = useState([])
  const [lastWinner, setLastWinner] = useState([])


  useEffect(() => {
    updateLottery();
  }, [lotteryContract]);


  // Now update the lotteryPot Dinamically
  const updateLottery = async ()=>{

    if(lotteryContract){
      let pot = await lotteryContract.methods.getBalance().call()
      setLotteryPot(web3.utils.fromWei(pot,'ether')+' MATIC')

      
      
      setLotteryId(await lotteryContract.methods.getLotteryId().call())
      setLotteryPlayers(await lotteryContract.methods.getPlayers().call())
      setLastWinner(await lotteryContract.methods.getWinners().call())

    }
    else{
      console.log('Not Lottery Found!')
    }
  }


  // connect wallet function
  const connectWallet = async()=> {
    if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
      try {
        // request wallet connection
        let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        setAddress(accounts[0])

        // create a web3 instance
        const web3 = new Web3(window.ethereum)
        setWeb3(web3)

        setLotteryContract(createLotteryContract(web3))

        window.ethereum.on('accountsChanged', async()=>{
          const accounts = web3.eth.getAccounts()
          setAddress(accounts[0])

        })
        
      } catch (error) {
        console.log(error)
      }
    }
    else{
      console.log('please install MetaMask!')
    }
  }


  // enter lottery function
  const enterLottery = async ()=>{

    try {
      await lotteryContract.methods.enter().send({
        from: address,
        value: web3.utils.toWei('0.1','ether'),
        gas: 3000000,
        gassPrice: null,
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  // Pick Winner function
  const pickWinner = async ()=>{

    try {
      let transaction = await lotteryContract.methods.pickWinner().send({
        from: address,
        gas: 3000000,
        gassPrice: null,
      })
      console.log(transaction)
      updateLottery();
      
    } catch (error) {
      console.log(error)
    }
  }


  return <appContext.Provider 
  value={{connectWallet, address, enterLottery, lotteryPot, lotteryPlayers, pickWinner, lotteryId, lastWinner  }}
  >
    {children}
    </appContext.Provider>
}

export const useAppContext = () => {
  return useContext(appContext)
}