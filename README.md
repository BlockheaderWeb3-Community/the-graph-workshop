## Building a Dapp and leveraging the Graph in real time

-   Network faucet for base - https://docs.base.org/tools/network-faucets
-   Network details for base
-   Name Value
    Network Name Base Sepolia
    Description A public testnet for Base.
    RPC Endpoint https://sepolia.base.org
    Rate limited and not for production systems.
    Chain ID 84532
    Currency Symbol ETH
    Block Explorer https://sepolia-explorer.base.org

Setup in metamask or download coinbbase wallet https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad?hl=en and switch network to base sepolia

### Initializing environments

-   `npm create vite@latest project_name --template react` to initialize a react project
-   `cd project_name` to enter the project folder
-   `yarn add hardhat` to setup the smart contract development and testing suite
-   `npx hardhat init` to initiate hardhat
-   Follow the prompt and select Create a Javascript project.
    Press “y" to agree to other options and continue.
-   Setup Hardhat config for deploy to testnet
-   Enter the smart contract code

```=solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleRecord {
    // Define a Record structure
    struct Record {
        uint256 id;
        string data;
        address creator;
    }

    // State variables
    uint256 public recordCount = 0;
    mapping(uint256 => Record) public records;

    // Event to be emitted when a new record is created
    event RecordCreated(
        uint256 id,
        string data,
        address indexed creator
    );

    // Function to create a new record
    function createRecord(string memory _data) public {
        recordCount++;
        records[recordCount] = Record(recordCount, _data, msg.sender);

        // Emit the RecordCreated event
        emit RecordCreated(recordCount, _data, msg.sender);
    }

    // Function to retrieve a record by ID
    function getRecord(uint256 _id) public view returns (Record memory) {
        return records[_id];
    }
}
```

-   Update Hardhat config to

```
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.23",
    networks: {
        "base-sepolia": {
            chainId: 84532,
            url: "https://sepolia.base.org", // Insert Infura Celo Url here
            accounts: [`0x${process.env.WALLET_KEY}`],
        },
    },
};

```

-   Install the toolbox and dotenv
    `yarn add @nomicfoundation/hardhat-toolbox && yarn add dotenv`

-   `npx hardhat compile` to compile the smart contract
-   Now to deploy the Smart contract , Create this set of files : scripts/deploy.js
-   Add This :-1:

```=javascript
require("hardhat");

async function main() {
    const SimpleRecord = await ethers.deployContract("SimpleRecord");

    await SimpleRecord.waitForDeployment();

    console.log("SimpleRecord Contract Deployed at " + SimpleRecord.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

```

-   Next run the following command to deploy to base sepolia `npx hardhat run scripts/deploy.js --network base-sepolia`
-   Head over to https://sepolia.basescan.org/ to confirm the address has actually been deployed , then verify the contract. Fetch Abi from artifact folder

Now we can head over to the dapp section .

-   Open src/app.jsx and update with the following code, Note our dapp would allow us Create record and also get record based on its ID

```=javascript
import "./App.css";
import React from "react";
import { useState } from "react";
import { ethers, BrowserProvider } from "ethers";

// Import the json-file from the ABI
import SimpleRecord from "../artifacts/contracts/SimpleRecord.sol/SimpleRecord.json";

// Store the contract address in a variable
const simpleRecordAddress = "0x98F7eDaB05Cd392232D317e250CE3337981401D9"; // Deployed to testnet

const App = () => {
    // Store Record details in a local state
    const [record, setRecordValue] = useState();
    const [id, setIdValue] = useState();
    const [fetchedRecord, setFetchedRecordValue] = useState();

    // Request access to User's MetaMask account
    const requestAccount = async () => {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    };

    // Function for retrieving record value from smart contract.
    const getRecord = async () => {
        if (!id) return;
        if (typeof window.ethereum !== "undefined") {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                simpleRecordAddress,
                SimpleRecord.abi,
                web3Provider
            );
            try {
                const data = await contract.getRecord(id);
                console.log(`Data: ${data}`);
                setFetchedRecordValue(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Function for updating message value on smart contract
    const createRecord = async () => {
        if (!record) return;
        if (typeof window.ethereum !== "undefined") {
            await requestAccount();
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            const contract = new ethers.Contract(
                simpleRecordAddress,
                SimpleRecord.abi,
                signer
            );
            const transaction = await contract.createRecord(record);
            await transaction.wait();
            setRecordValue("");
            alert("created successfully");
        }
    };

    return (
        <div className="container">
            <button onClick={getRecord}>FetchRecord</button>
            <button onClick={createRecord}>Create Record</button>

            <input
                onChange={(e) => setRecordValue(e.target.value)}
                placeholder="Write your Record here..."
            />
            <input
                onChange={(e) => setIdValue(e.target.value)}
                placeholder="Write The id of record you want to fetch here..."
            />
            {fetchedRecord && (
                <p>{` Id of ${fetchedRecord[0]} with value of ${fetchedRecord[1]} and creator of address ${fetchedRecord[2]}`}</p>
            )}
        </div>
    );
};

export default App;

```

Then Update src/App.css with :-1:

```=css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

/* styles.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

button {
  background-color: #4caf50; /* Green */
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

input {
  padding: 10px;
  margin: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #4caf50;
  outline: none;
}
```

Then to View it , run `yarn run dev`
Test functions and all

-   Now we build our graph to make things work better
-   `yarn global add @graphprotocol/graph-cli` to install graph cli
-   `graph init ` to initialize our subgraph then fill in all details
-   Follow the prompt > ethereum > subgraphstudio > pick nice slug > base-sepolia> input contract address > index entities - true
-   Head over to subgraph studio, create and follow the prompts
-   Remember the endpoint created for you

Now we install the graphQL apollo client to interact with the frontend

-   We use `yarn add @apollo/client graphql` to install it
-   Then import it in our app.jsx with

```=javascript
import { ApolloProvider, ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
```

-   Create a client that would be used when querying

```=javascript
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/<GITHUB_USER>/<SUBGRAPH_NAME>',
  cache: new InMemoryCache(),
});
```

-   Then a query to collect first 3 values from the indexed data

```=javascript
const GET_DATA = gql`
  query {
    entities {
      id
      field1
      field2
    }
  }
`;
```

-   Remember to Wrap App component with Apollo Provider and pass client as a prop
-   ` <ApolloProvider client={client}>`

-   Create a data fetcher component that will fetch all data

```
const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/87032/simplerecords/version/latest",
    cache: new InMemoryCache(),
});

const GET_DATA = gql`
    {
        recordCreateds(first: 5) {
            id
            SimpleRecord_id
            data
            creator
        }
    }
`;

function DataFetcher() {
    const { loading, error, data } = useQuery(GET_DATA);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            {data.recordCreateds.map((entity) => (
                <div key={entity.SimpleRecord_id}>
                    <p>{entity.SimpleRecord_id}</p>
                    <p>{entity.data}</p>
                    <p>{entity.creator}</p>
                </div>
            ))}
        </div>
    );
}
```

-   This component can further be utilized in our project
-   By importing it. Final code should look like this

```=javascript
import "./App.css";
import React from "react";
import { useState } from "react";
import { ethers, BrowserProvider } from "ethers";

// Import the json-file from the ABI
import SimpleRecord from "../artifacts/contracts/SimpleRecord.sol/SimpleRecord.json";

// Store the contract address in a variable
const simpleRecordAddress = "0x98F7eDaB05Cd392232D317e250CE3337981401D9"; // Deployed to testnet

//GRAPHQL ADDITION
import {
    ApolloProvider,
    ApolloClient,
    InMemoryCache,
    gql,
    useQuery,
} from "@apollo/client";

const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/87032/simplerecords/version/latest",
    cache: new InMemoryCache(),
});

const GET_DATA = gql`
    {
        recordCreateds(first: 5) {
            id
            SimpleRecord_id
            data
            creator
        }
    }
`;

function DataFetcher() {
    const { loading, error, data } = useQuery(GET_DATA);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            {data.recordCreateds.map((entity) => (
                <div key={entity.SimpleRecord_id}>
                    <p>{entity.SimpleRecord_id}</p>
                    <p>{entity.data}</p>
                    <p>{entity.creator}</p>
                </div>
            ))}
        </div>
    );
}

const App = () => {
    // Store Record details in a local state
    const [record, setRecordValue] = useState();
    const [id, setIdValue] = useState();
    const [fetchedRecord, setFetchedRecordValue] = useState();

    // Request access to User's MetaMask account
    const requestAccount = async () => {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    };

    // Function for retrieving record value from smart contract.
    const getRecord = async () => {
        if (!id) return;
        if (typeof window.ethereum !== "undefined") {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                simpleRecordAddress,
                SimpleRecord.abi,
                web3Provider
            );
            try {
                const data = await contract.getRecord(id);
                console.log(`Data: ${data}`);
                setFetchedRecordValue(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Function for updating message value on smart contract
    const createRecord = async () => {
        if (!record) return;
        if (typeof window.ethereum !== "undefined") {
            await requestAccount();
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            const contract = new ethers.Contract(
                simpleRecordAddress,
                SimpleRecord.abi,
                signer
            );
            const transaction = await contract.createRecord(record);
            await transaction.wait();
            setRecordValue("");
            alert("created successfully");
        }
    };

    return (
        <ApolloProvider client={client}>
            <div className="container">
                <button onClick={getRecord}>FetchRecord</button>
                <button onClick={createRecord}>Create Record</button>

                <input
                    onChange={(e) => setRecordValue(e.target.value)}
                    placeholder="Write your Record here..."
                />
                <input
                    onChange={(e) => setIdValue(e.target.value)}
                    placeholder="Write The id of record you want to fetch here..."
                />
                {fetchedRecord && (
                    <p>{` Id of ${fetchedRecord[0]} with value of ${fetchedRecord[1]} and creator of address ${fetchedRecord[2]}`}</p>
                )}
            </div>
            <DataFetcher />
        </ApolloProvider>
    );
};

export default App;
```
