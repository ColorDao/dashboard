import React, { useContext, useEffect, useState } from "react";
import "./App.scss";
import { ethers } from "ethers";
import Main from "./Main";
import { useSigner } from "./hooks/useSigner";
import { Web3ModalContext } from "./state/Web3ModalContext";
import signerContext from "./state/SignerContext";
import COLO from "./contracts/COLO.json";
import { Container, Row, Col, Button } from "reactstrap";
import Membership from "./contracts/Memberships.json";
import POA from "./contracts/ProofOfAction.json";

const App: React.FC = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [ColoContract, setColoContract] = useState<ethers.Contract>();
  const [
    MembershipContract,
    setMembershipContract,
  ] = useState<ethers.Contract>();
  const [POAContract, setPOAContract] = useState<ethers.Contract>();

  const setContracts = (currentSigner: ethers.Signer) => {
    const currentCOLO = new ethers.Contract(
      COLO.address,
      COLO.abi,
      currentSigner
    );
    setColoContract(currentCOLO);

    const currentMembership = new ethers.Contract(
      Membership.address,
      Membership.abi,
      currentSigner
    );
    setMembershipContract(currentMembership);

    const currentPOA = new ethers.Contract(POA.address, POA.abi, currentSigner);
    setPOAContract(currentPOA);
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
    return (
      <Container>
        <Row>
          <Col>
            <h2>Loading</h2>
          </Col>
        </Row>
      </Container>
    );
  }

  if (invalidNetwork) {
    return <>Invalid Network</>;
  }

  if (!signer.signer) {
    return (
      <Container className="mt-4">
        <Row>
          <Col>
            <Button
              size="lg"
              onClick={() => {
                web3Modal.toggleModal();
              }}
            >
              Sign In
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <signerContext.Provider value={signer}>
      <Main
        ColoContract={ColoContract}
        MembershipContract={MembershipContract}
        POAContract={POAContract}
      ></Main>
    </signerContext.Provider>
  );
};

export default App;
