const { ethers, config, network } = require("hardhat");
const deployMocks = require("../deploy/00-deploy-mocks");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, get } = deployments;
    const [owner] = await ethers.getSigners();
    const chainId = await getChainId();

    let LinkToken;
    let VRFCoordinatorMock;
    let MockV3Aggregator;
    let KeyHash;
    let Fee;

    if (chainId === "1337") {
        await deployMocks({ getNamedAccounts, deployments, getChainId});
        LinkToken = await get("LinkToken").then(res => res.address);
        VRFCoordinatorMock = await get("VRFCoordinatorMock").then(res => res.address);
        MockV3Aggregator = await get("MockV3Aggregator").then(res => res.address);
        KeyHash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
        Fee = "100000000000000000";
    } else {
        LinkToken = config.networks[network.name].linkToken;
        VRFCoordinatorMock = config.networks[network.name].vrfCoordinator;
        MockV3Aggregator = config.networks[network.name].ethUsdPriceFeed;
        KeyHash = config.networks[network.name].keyHash;
        Fee = config.networks[network.name].fee;
    }

    await deploy("Lottery", {
        from: owner.address,
        log: true,
        args: [MockV3Aggregator, VRFCoordinatorMock, LinkToken, Fee, KeyHash],
    });
};

module.exports.tags = ["all", "main"];