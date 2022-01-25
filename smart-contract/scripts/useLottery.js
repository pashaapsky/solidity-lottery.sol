const { ethers, deployments, network, config } = require("hardhat");

async function main() {
    const Lottery = await deployments.get("Lottery");
    const lottery = await ethers.getContractAt("Lottery", Lottery.address);

    await startLottery(lottery);
    await enterLottery(lottery);
    await endLottery(lottery);
}

async function startLottery (lottery) {
    const startTx = await lottery.startLottery();
    await startTx.wait();

    console.log('lottery is started');
}

async function enterLottery (lottery) {
    const [owner, addr1] = await ethers.getSigners();

    const value = await lottery.getEntranceFee();
    console.log('value: ', ethers.BigNumber.from(value));
    const tx = await lottery.connect(addr1).enter({value: ethers.BigNumber.from(value).add(ethers.BigNumber.from(10000))});
    await tx.wait();
    console.log('You entered the lottery!')
}


async function endLottery (lottery) {
    //перед тем как закончить лоттерею надо
    //fund контракт
    console.log('fund contract start...');
    const linkToken = await ethers.getContractAt("LinkToken", config.networks[network.name].linkToken);
    const fundTx = await linkToken.transfer(lottery.address, ethers.utils.parseUnits("0.1", 'ether'));
    await fundTx.wait();
    console.log('fund contract end...');
    const endTx = await lottery.endLottery();
    await endTx.wait();
    console.log('lottery end!');
    await new Promise((resolve) => setTimeout(resolve, 180000));
    console.log(`${await lottery.recentWinner()} is a new winner!`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

