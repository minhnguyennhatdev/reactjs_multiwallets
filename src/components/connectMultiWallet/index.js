import React, { useEffect } from 'react'
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { useState } from 'react';
import Web3 from "web3";
import { Button, Container, Card, OverlayTrigger , Tooltip } from 'react-bootstrap';

const providerOptions = {
  binancechainwallet: {
    package: true
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "658dad76fb8746d484a524b4ddf1f8eb"
    }
  },
  walletlink: {
    package: WalletLink,
    options: {
      appName: "Bstar Solutions",
      infuraId: "658dad76fb8746d484a524b4ddf1f8eb",
      rpc: "",
      chainId: 1,
      appLogoUrl: null,
      darkMode: false
    }
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Bstar Solutions",
      infuraId: "658dad76fb8746d484a524b4ddf1f8eb",
      rpc: "",
      chainId: 1,
      darkMode: false
    }
  }
}

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

const ConnectMultiWallet = () => {

  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0])

      setAccount(accounts[0])
      setBalance(web3.utils.fromWei(balance, "ether"))
      // const accounts = await library.listAccounts();
      // const network = await library.getNetwork();
      // setProvider(provider);
      // setLibrary(library);
      // if (accounts) setAccount(accounts[0]);
      // setChainId(network.chainId);
    } catch (error) {
      console.log(error)
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  return (
    <Container className='container_wrapper'>
      <Card style={{ width: '23rem', padding: "20px" }}>
        <Card.Body>
          {account ? (
            <>
              <Card.Title>
                <OverlayTrigger
                  key={account}
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id={`tooltip-${account}`}>
                      <strong>{account}</strong>.
                    </Tooltip>
                  }
                >
                  <Card.Title className="text-truncate" >
                    Address: {account}
                  </Card.Title>
                </OverlayTrigger>
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Balance: {balance} ETH</Card.Subtitle>
              {/* <Card.Text>
                Some quick example text to build on the card title and make up the bulk of
                the card's content.
              </Card.Text> */}
            </>
            ) : (
              <div></div>
            )
          }

          <div>
            <Button onClick={connectWallet} disabled={account ? true : false}>Connect Wallet</Button>
            <Button onClick={disconnect}  variant="secondary">Disconnect</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ConnectMultiWallet