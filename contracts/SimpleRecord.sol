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