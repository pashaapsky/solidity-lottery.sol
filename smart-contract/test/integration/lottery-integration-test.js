const {expect} = require("chai");
const {ethers, getChainId, deployments, network, config} = require("hardhat");

describe("Lottery integration test:", () => {
    let Lottery;
    let lottery;
    let linkToken;

    before(async () => {
        linkToken = await ethers.getContractAt("LinkToken", config.networks[network.name].linkToken);
        Lottery = await deployments.get("Lottery");
        lottery = await ethers.getContractAt("Lottery", Lottery.address);
        deployments.log("before end");
    });

    it("Проверка на верное определение победителя?", async () => {
        if (await getChainId() === "1337") {
            this.skip();
        }

        const [owner] = await ethers.getSigners();

        await lottery.startLottery();
        const entranceFee = await lottery.getEntranceFee();
        const entryFee = ethers.BigNumber.from(entranceFee).add(ethers.BigNumber.from(10000));
        await lottery.connect(owner).enter({value: entryFee});
        await lottery.connect(owner).enter({value: entryFee});
        await lottery.connect(owner).enter({value: entryFee});
        const fundTx = await linkToken.transfer(lottery.address, ethers.utils.parseUnits("0.1", 'ether'));
        await fundTx.wait();
        const endTx = await lottery.endLottery();
        await endTx.wait();
        // Give the oracle some minutes to update the random number
        await new Promise((resolve) => setTimeout(resolve, 180000));

        await expect(await lottery.recentWinner()).to.be.equal(owner.address);
        await expect(await ethers.getDefaultProvider().getBalance(lottery.address)).to.be.equal(0);
    });
});
