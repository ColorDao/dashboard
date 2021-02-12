import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import SignerContext from "./state/SignerContext";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import token from "./assets/img/colo.jpeg";
import { Web3ModalContext } from "./state/Web3ModalContext";

type props = {
  ColoContract?: ethers.Contract;
  MembershipContract?: ethers.Contract;
  POAContract?: ethers.Contract;
};

const Main = ({ ColoContract, MembershipContract, POAContract }: props) => {
  const [address, setAddress] = useState("");
  const [coloBalance, setColoBalance] = useState("0.0");
  const [isMember, setIsMember] = useState(false);
  const signer = useContext(SignerContext);
  const [requests, setRequests] = useState<any>([]);
  const web3Modal = useContext(Web3ModalContext);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalId, setModalId] = useState("0");
  const [ipfsHash, setIpfsHash] = useState("");

  const toggle = () => setModal(!modal);

  useEffect(() => {
    const load = async () => {
      if (signer.signer && ColoContract && MembershipContract && POAContract) {
        const currentAddress = await signer.signer.getAddress();
        setAddress(currentAddress);
        const currentBalance = await ColoContract.balanceOf(currentAddress);
        const coloString = ethers.utils.formatEther(currentBalance);
        setColoBalance(coloString);
        const member = await MembershipContract.balanceOf(currentAddress);
        if (member.toString() === "0") {
          setIsMember(false);
        } else {
          setIsMember(true);
        }
        const nmbRquest = await POAContract.requestsCount();
        let currentRequests = [];
        for (let i = 1; i <= nmbRquest; i++) {
          const request = await POAContract.requests(i);
          currentRequests.push(request);
        }
        setRequests(currentRequests);
      }
    };

    load();
    // eslint-disable-next-line
  }, [coloBalance, address]);

  const submitProof = async () => {
    await POAContract?.submitProof(modalId, ipfsHash);
  };
  const onChangeIPFS = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIpfsHash(event.target.value);
    toggle();
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2>Address: {address}</h2>
          <Button
            onClick={(event) => {
              event.preventDefault();
              web3Modal.clearCachedProvider();
              window.location.reload();
            }}
          >
            Logout
          </Button>
          <h3>
            Balance:{" "}
            <img className="token" src={token} height="30" alt="token" />
            {coloBalance}
          </h3>
          <h3>Colorado DAO Membership</h3>
          {isMember ? (
            <>
              <img
                alt="membership"
                height="300"
                className="membership"
                src="https://gateway.pinata.cloud/ipfs/QmPqxpnJkBHmBiy6S8TbhnckMMt7FawJGxUK7K2EDDENMv"
              />
              <Container>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Active</th>
                      <th>Reward</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request: any, index: any) => {
                      console.log(request);
                      return (
                        <tr key={index}>
                          <th scope="row">{request[0].toString()}</th>
                          <td>{request[1].toString()}</td>{" "}
                          <td>{request[2].toString()}</td>
                          <td>
                            <img
                              className="token"
                              src={token}
                              height="20"
                              alt="token"
                            />{" "}
                            {ethers.utils.formatEther(request[3].toString())}
                          </td>
                          <td>
                            <Button
                              onClick={() => {
                                setModalId(request[0].toString());
                                setModalTitle(request[1].toString());
                                toggle();
                              }}
                            >
                              Submit Proof
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <Modal isOpen={modal} toggle={toggle}>
                  <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
                  <ModalBody>
                    <Form>
                      <FormGroup>
                        <Label for="exampleEmail">Proof Hash</Label>
                        <Input
                          type="text"
                          placeholder="IPFS Hash"
                          value={ipfsHash}
                          onChange={onChangeIPFS}
                        />
                      </FormGroup>
                    </Form>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={submitProof}>
                      Submit Proof
                    </Button>{" "}
                    <Button color="secondary" onClick={toggle}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </Container>
            </>
          ) : (
            <p>
              <b>Not a Member</b>
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Main;
