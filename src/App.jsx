import "./App.css";
import React from "react";
import { useState } from "react";
import { ethers, BrowserProvider } from "ethers";
import {
    ApolloProvider,
    ApolloClient,
    InMemoryCache,
    gql,
    useQuery,
} from "@apollo/client";

// Import the json-file from the ABI
import SimpleRecord from "../artifacts/contracts/SimpleRecord.sol/SimpleRecord.json";

// Store the contract address in a variable
const simpleRecordAddress = "0x27eB8B0B8D32F3AFFA54E5a34303A9E59DF5A0Bb"; // Deployed to testnet

const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/87129/testdapp/0.0.1",
    cache: new InMemoryCache(),
});

const GET_DATA = gql`
    {
        recordCreateds(orderBy: SimpleRecord_id, orderDirection: asc) {
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
                    <p>
                        {entity.creator} has just created a new record with id
                        of #{entity.SimpleRecord_id}
                    </p>
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
