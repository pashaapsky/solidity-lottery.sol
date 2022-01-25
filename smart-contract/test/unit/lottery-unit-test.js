const {expect} = require("chai");
const {ethers, getChainId, deployments} = require("hardhat");

describe("Lottery unit tests:", () => {
    let Lottery;
    let lottery;
    let LinkToken;
    let linkToken;
    let VrfCoordinator;
    let vrfCoordinator;

    before(async () => {
        await deployments.fixture(["main"]);

        LinkToken = await deployments.get("LinkToken");
        linkToken = await ethers.getContractAt("LinkToken", LinkToken.address);
        VrfCoordinator = await deployments.get("VRFCoordinatorMock");
        vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", VrfCoordinator.address);
        Lottery = await deployments.get("Lottery");
        lottery = await ethers.getContractAt("Lottery", Lottery.address);
    });

    it("Проверка на правильность перевода $ в eth?", async () => {
        //т.к. STARTING_PRICE === 2,000 eth, a usdEntryFee = 5$;
        // 2000/1 = 5/x => 0.0025
        // expect(5).to.equal(5);
        if (await getChainId() !== "1337") {
            this.skip();
        }

        const expectedEntranceFee = ethers.utils.parseUnits("0.0025", 'ether');
        await expect(await lottery.getEntranceFee()).to.equal(expectedEntranceFee);
    });

    it("Проверка можно ли войти, когда у lottery не open статус?", async () => {
        if (await getChainId() !== "1337") {
            this.skip();
        }

        const entranceFee = await lottery.getEntranceFee();
        await expect(lottery.enter({value: entranceFee})).to.be.revertedWith('Lottery not open yet');
    });

    it("Проверка можно ли закончить lottery?", async () => {
        if (await getChainId() !== "1337") {
            this.skip();
        }

        [owner, addr1, addr2] = await ethers.getSigners();

        await lottery.startLottery();
        const entranceFee = await lottery.getEntranceFee();
        await lottery.enter({value: entranceFee});
        const fundTx = await linkToken.transfer(lottery.address, ethers.utils.parseUnits("0.1", 'ether'));
        await fundTx.wait();
        const endTx = await lottery.endLottery();
        await endTx.wait();

        await expect(await lottery.lotteryState()).to.be.equal(2);
    });

    it("Проверка можно ли войти в запущенную lottery?", async () => {
        if (await getChainId() !== "1337") {
            this.skip();
        }

        await lottery.startLottery();
        const entranceFee = await lottery.getEntranceFee();
        await lottery.enter({value: entranceFee});
        const fundTx = await linkToken.transfer(lottery.address, ethers.utils.parseUnits("0.1", 'ether'));
        await fundTx.wait();

        await expect(await lottery.players(0)).to.be.equal(owner.address);

        const endTx = await lottery.endLottery();
        await endTx.wait();
    });

    it("Проверка на верное определение победителя?", async () => {
        if (await getChainId() !== "1337") {
            this.skip();
        }

        const [owner, addr1, addr2] = await ethers.getSigners();

        await lottery.startLottery();
        const entranceFee = await lottery.getEntranceFee();
        await lottery.connect(owner).enter({value: entranceFee});
        await lottery.connect(addr1).enter({value: entranceFee});
        await lottery.connect(addr2).enter({value: entranceFee});
        const fundTx = await linkToken.transfer(lottery.address, ethers.utils.parseUnits("0.1", 'ether'));
        await fundTx.wait();

        const endTx = await lottery.endLottery();
        const endTxReceipt = await endTx.wait();
        const requestId = await endTxReceipt.events[3].topics[0];


        const STATIC_RNG = 22;
        await vrfCoordinator.callBackWithRandomness(requestId, STATIC_RNG, lottery.address);

        const startWinnerAccountBalance = await addr1.getBalance();
        const lotteryBalance = await ethers.getDefaultProvider().getBalance(lottery.address);

        // winner => 21 % 3 = 1
        await expect(await lottery.recentWinner()).to.be.equal(addr1.address);
        const expectedBalance = BigInt(startWinnerAccountBalance) + BigInt(lotteryBalance);

        await expect(await addr1.getBalance()).to.be.equal(expectedBalance);
    });
});
