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
