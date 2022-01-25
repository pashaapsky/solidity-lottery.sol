const { ethers } = require("hardhat");

const DECIMALS = 8;
const STARTING_PRICE = "200000000000";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, log } = deployments;
    const [owner] = await ethers.getSigners();
    const chainId = await getChainId();

    if (chainId === "1337") {
        log("Local Network Detected, Deploying Mocks");

        await deploy("MockV3Aggregator", {from: owner.address, log: true, args: [DECIMALS, STARTING_PRICE]});

        const linkToken = await deploy("LinkToken", { from: owner.address, log: true });

        await deploy("VRFCoordinatorMock", {
            from: owner.address,
            log: true,
            args: [linkToken.address],
        });
    } else {
        log("No need to deploy all Mocks in not Local Network");
    }
};

module.exports.tags = ["all", "mocks", "main"];