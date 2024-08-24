require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.23",
    networks: {
        "base-sepolia": {
            chainId: 84532,
            url: "https://sepolia.base.org", // Insert Infura url
            accounts: [`0x${process.env.WALLET_KEY}`],
        },
    },
};
// 0x9e09C81af9fa6191611506dF7d0d718784f5D1cD
