import React, { useContext, useEffect, useState } from "react";
import "./App.scss";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Main } from "./Main";
import { Container } from "reactstrap";
import { useSigner } from "./hooks/useSigner";
import { Web3ModalContext } from "./state/Web3ModalContext";
import signerContext from "./state/SignerContext";
import COLO from "./contracts/COLO.json";

const App: React.FC = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  //   return <>asd</>;
  // };

  const setContracts = (currentSigner: ethers.Signer) => {
    const currentCOLO = new ethers.Contract(
      COLO.address,
      COLO.abi,
      currentSigner
    );
  };

  web3Modal.on("connect", async (networkProvider) => {
    setloading(true);
    const currentProvider = new ethers.providers.Web3Provider(networkProvider);
    const network = await currentProvider.getNetwork();
    if (
      process.env.REACT_APP_NETWORK_ID &&
      !(
        network.chainId === parseInt(process.env.REACT_APP_NETWORK_ID) ||
        parseInt(process.env.REACT_APP_NETWORK_ID) === 0
      )
    ) {
      setInvalidNetwork(true);
    }
    const currentSigner = currentProvider.getSigner();
    signer.setCurrentSigner(currentSigner);
    setContracts(currentSigner);
    setloading(false);
  });

  useEffect(() => {
    async function loadProvider() {
      if (web3Modal.cachedProvider && !signer.signer) {
        const networkProvider = await web3Modal.connect();
        const currentProvider = new ethers.providers.Web3Provider(
          networkProvider
        );
        const network = await currentProvider.getNetwork();

        if (network.chainId === parseInt("3")) {
          setInvalidNetwork(true);
        }
        const currentSigner = currentProvider.getSigner();
        signer.setCurrentSigner(currentSigner);
        setContracts(currentSigner);
      }
      setloading(false);
    }
    loadProvider();
    // eslint-disable-next-line
  }, [web3Modal]);

  if (isLoading) {
    return <>Loading</>;
  }

  if (invalidNetwork) {
    return <>Invalid Network</>;
  }

  return (
    <signerContext.Provider value={signer}>
      <Main></Main>
    </signerContext.Provider>
  );
};

export default App;
