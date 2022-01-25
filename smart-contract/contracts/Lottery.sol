//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is VRFConsumerBase, Ownable {
    address payable[] public players;
    address payable public recentWinner;
    uint256 public randomness;
    uint256 public usdEntryFee;
    AggregatorV3Interface internal ethUsdPriceFeed;

    // переменные для получения рандома VRFConsumerBase
    bytes32 public keyHash;
    uint256 public fee;

    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATION_WINNER
    }
    LOTTERY_STATE public lotteryState;

    event RequestedRandomness(bytes32 requestId);

    //наш собственный конструктор (address _priceFeedAddress) + конструктор VRFConsumerBase(address _vrfCoordinator, address _link)
    constructor(address _priceFeedAddress, address _vrfCoordinator, address _link, uint256 _fee, bytes32 _keyHash) VRFConsumerBase(_vrfCoordinator, _link) {
        usdEntryFee = 15 * (10 ** 18);
        //плата за участие -> 5$
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeedAddress);
        lotteryState = LOTTERY_STATE.CLOSED;
        fee = _fee;
        keyHash = _keyHash;
    }

    function enter() public payable {
        //15$ min enter
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery not open yet");
        require(msg.value >= getEntranceFee(), "Not enought ETH!");
        players.push(payable(msg.sender));
    }

    //получаем Стоимость входа в wei
    function getEntranceFee() public view returns (uint256) {
        (, int256 price, , ,) = ethUsdPriceFeed.latestRoundData();
        uint256 formattedPriceToWeiDecimals = uint256(price) * 10 ** 10;
        //price = 8 decimals, нам нужно 18 для wei
        uint256 costToEnter = (usdEntryFee * 10 ** 18) / formattedPriceToWeiDecimals;

        return costToEnter;
    }


    function startLottery() public onlyOwner {
        require(lotteryState == LOTTERY_STATE.CLOSED, "Can`t start a new lottery yet!");
        lotteryState = LOTTERY_STATE.OPEN;
    }

    function endLottery() public onlyOwner {
        // uint(keccak256(abi.encodePacked(msg.sender, block.difficulty, block.timestamp))) % players.length;
        lotteryState = LOTTERY_STATE.CALCULATION_WINNER;
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit RequestedRandomness(requestId);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness) internal override {
        require(lotteryState == LOTTERY_STATE.CALCULATION_WINNER, "You aren`t there yet");
        require(_randomness > 0, "random-not-found");
        uint256 indexOfWinner = _randomness % players.length;
        recentWinner = players[indexOfWinner];
        recentWinner.transfer(address(this).balance);

        // Reset lottery
        players = new address payable[](0);
        lotteryState = LOTTERY_STATE.CLOSED;
        randomness = _randomness;
    }
}
