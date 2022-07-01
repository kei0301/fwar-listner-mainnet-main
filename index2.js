const Web3 = require("web3");
const ethers = require("ethers");
// model db
require("./connectDb");

const character = require("./listen/char");
const orderMarket = require("./listen/market");

const createOpenChestHistory = require("./listen/char-delegate/openChest");
const buyTicket = require("./listen/ticket/buy");
const mining = require("./listen/mining");

// contract
const FwarCharDelegate = require("./contracts/FwarChar/FwarCharDelegate.json");
const FwarChar = require("./contracts/FwarChar/FWarChar.json");
const FwarMarketDelegate = require("./contracts/FwarMarket/FwarMarketDelegate.json");
const FwarTicket = require("./contracts/FWarTicket/FwarTicket.json");
const FwarMining = require("./contracts/FwarMining/FwarMining.json");

// const web3 = new Web3("https://bsc-dataseed.binance.org/");

// const NODE_URL = "https://speedy-nodes-nyc.moralis.io/1084e29b09ec77f6c8e1aab0/bsc/mainnet";
const NODE_URL =
	"https://little-sparkling-paper.bsc.quiknode.pro/6214af9198f1b203ffe9bedb03fa5acacfd1ece5/"; //Quick Node
const provider = new Web3.providers.HttpProvider(NODE_URL);
const web3 = new Web3(provider);

let id = 56;
let rangeOfBlock = 1000;
let delayBlock = 10;

const fwarCharContract = new web3.eth.Contract(
	FwarChar.abi,
	FwarChar.networks[id].address
);
const fwarCharDelegateContract = new web3.eth.Contract(
	FwarCharDelegate.abi,
	FwarCharDelegate.networks[id].address
);
const fwarMarketDelegateContract = new web3.eth.Contract(
	FwarMarketDelegate.abi,
	FwarMarketDelegate.networks[id].address
);
const fwarTicketContract = new web3.eth.Contract(
	FwarTicket.abi,
	FwarTicket.networks[id].address
);
const fwarMiningContract = new web3.eth.Contract(
	FwarMining.abi,
	FwarMining.networks[id].address
);

const getPastEventData = async (
	contract,
	event,
	fromBlock,
	toBlock,
	_filter
) => {
	try {
		const options = {
			fromBlock: fromBlock,
			toBlock: toBlock,
		};
		_filter ? (options["filter"] = _filter) : ``;

		return await contract.getPastEvents(event, options);
	} catch (error) {
		console.log(event + ":::::::: " + error);
	}
};

// ------------------- OPEN CHEST
// network address CharacterDelegate : 0x5880E47A08Aa7A043212839E01C56262106c6f43
// 0xac4dd94aba846eaf36e16cb38cd49c683b5fbb77 : old contract -- 12912415

let runBlockOpenChests = 13832555;
let isRunningChest = false;
let fromBlockChest = runBlockOpenChests;
let toBlockChest = fromBlockChest + rangeOfBlock;
let chestLastestBlock = runBlockOpenChests;

const openChestInterval = async () => {
	if (isRunningChest) {
		return;
	}
	isRunningChest = true;

	try {
		const getBlock = await web3.eth.getBlock("latest");
		const latestBlock = getBlock.number - delayBlock;
		//Check if have new block then call function getPastEvent
		if (latestBlock > chestLastestBlock) {
			chestLastestBlock = latestBlock;
			if (toBlockChest >= latestBlock) {
				toBlockChest = latestBlock;
			}

			if (fromBlockChest >= latestBlock) {
				fromBlockChest = latestBlock;
			}
			console.log(
				"Open chest",
				latestBlock + "--" + fromBlockChest + "--" + toBlockChest
			);

			await getPastEventData(
				fwarCharDelegateContract,
				"OpenChest",
				fromBlockChest,
				toBlockChest
			).then(async (data) => {
				await createOpenChestHistory(data)
					.then(async (data) => {
						fromBlockChest = toBlockChest + 1;
						toBlockChest = fromBlockChest + rangeOfBlock;
					})
					.catch(async (error) => {
						console.log("openChestInterval- OpenChest: " + error);
					});
			});
		}

		isRunningChest = false;
	} catch (error) {
		console.log("openChestInterval: " + error);
	}
};
// ------------------- END OPEN CHEST

// ------------------- Character
// network address Character : 0x57150a95a55f31460be38bbe270209623ac6b8e2

let runBlockChar = 13832555; // 12985688;
let isRunningChar = false;
let fromBlockChar = runBlockChar;
let toBlockChar = fromBlockChar + rangeOfBlock;
let charLatestBlock = runBlockChar;
const characterInterval = async () => {
	if (isRunningChar) {
		return;
	}
	isRunningChar = true;
	try {
		const getBlock = await web3.eth.getBlock("latest");
		const latestBlock = getBlock.number - delayBlock;
		//Check if have new block then call function getPastEvent
		if (latestBlock > charLatestBlock) {
			charLatestBlock = latestBlock;
			if (toBlockChar >= latestBlock) {
				toBlockChar = latestBlock;
			}

			if (fromBlockChar >= latestBlock) {
				fromBlockChar = latestBlock;
			}
			console.log(
				"characterInterval:::",
				latestBlock + "--" + fromBlockChar + "-->" + toBlockChar
			);

			await getPastEventData(
				fwarCharContract,
				"allEvents",
				fromBlockChar,
				toBlockChar
			).then(async (data) => {
				await character(data)
					.then(async (data) => {
						fromBlockChar = toBlockChar + 1;
						toBlockChar = fromBlockChar + rangeOfBlock;
					})
					.catch(async (error) => {
						console.log("characterInterval:::::: " + error);
					});
			});
		}
	} catch (error) {
		console.log("characterInterval:::::: " + error);
	}

	isRunningChar = false;
};
//  ------------------- End Character

// ------------------- Character burn
let runBlockBurnChar = 13832555;
let isRunningBurn = false;
let fromBlockBurn = runBlockBurnChar;
let toBlockBurn = fromBlockBurn + rangeOfBlock;
let burnLatestBlock = runBlockBurnChar;

const burnInterval = async () => {
	if (isRunningBurn) {
		return;
	}
	isRunningBurn = true;

	try {
		let getBlock = await web3.eth.getBlock("latest");
		let latestBlock = getBlock.number;
		//Check if have new block then call function getPastEvent
		if (latestBlock > burnLatestBlock) {
			burnLatestBlock = latestBlock;

			if (toBlockBurn >= latestBlock) {
				toBlockBurn = latestBlock;
			}
			if (fromBlockBurn >= latestBlock) {
				fromBlockBurn = latestBlock;
			}

			console.log(
				"burnInterval",
				latestBlock + "--" + fromBlockBurn + "--" + toBlockBurn
			);
			await getPastEventData(
				fwarCharContract,
				"Transfer",
				fromBlockBurn,
				toBlockBurn,
				{ to: "0x0000000000000000000000000000000000000000" }
			).then(async (data) => {
				// fromBlockBurn = toBlockBurn + 1;
				//    toBlockBurn = fromBlockBurn + rangeOfBlock;
				//    console.log(data);
				await burnChar(data)
					.then(async (data) => {
						fromBlockBurn = toBlockBurn + 1;
						toBlockBurn = fromBlockBurn + rangeOfBlock;
					})
					.catch(async (error) => {
						console.log("burnInterval: " + error);
					});
			});
		}
	} catch (error) {
		console.log("burnInterval: " + error);
	}

	isRunningBurn = false;
};

// -------------------  End character burn

//  ------------------- Mining
let runBlockMining = 13832555; //12971593
let isRunningStaking = false;
let fromBlockStaking = runBlockMining;
let toBlockStaking = fromBlockStaking + rangeOfBlock;
let stakingLatestBlock = runBlockMining;
const miningInterval = async () => {
	if (isRunningStaking) {
		return;
	}
	isRunningStaking = true;
	try {
		let getBlock = await web3.eth.getBlock("latest");
		let latestBlock = getBlock.number - delayBlock;
		//Check if have new block then call function getPastEvent
		if (latestBlock > stakingLatestBlock) {
			stakingLatestBlock = latestBlock;

			if (toBlockStaking >= latestBlock) {
				toBlockStaking = latestBlock;
			}
			if (fromBlockStaking >= latestBlock) {
				fromBlockStaking = latestBlock;
			}
			console.log(
				"miningInterval",
				latestBlock + "--" + fromBlockStaking + "--" + toBlockStaking
			);
			await getPastEventData(
				fwarMiningContract,
				"allEvents",
				fromBlockStaking,
				toBlockStaking
			)
				.then(async (data) => {
					await mining(data)
						.then(async (data) => {
							fromBlockStaking = toBlockStaking + 1;
							toBlockStaking = fromBlockStaking + rangeOfBlock;
						})
						.catch(async (error) => {
							console.log("miningInterval: " + error);
						});
				})
				.catch((err) => console.log(err));
		}
	} catch (error) {
		console.log("error:::: " + error);
	}
	isRunningStaking = false;
};
//  ------------------- End Mining

// ------------------- Market
// network : 0x8290fc65962fC77b44fD0F7C53f56B9885bB8545
let runBlockMarket = 13832555; //12913660
let isRunningMarket = false;
let fromBlockMarket = runBlockMarket;
let toBlockMarket = fromBlockMarket + rangeOfBlock;
let latestBlockMarket = runBlockMarket;

const marketInterval = async () => {
	if (isRunningMarket) {
		return;
	}
	isRunningMarket = true;

	try {
		let getBlock = await web3.eth.getBlock("latest");
		let latestBlock = getBlock.number - delayBlock;
		//Check if have new block then call function getPastEvent
		if (latestBlock > latestBlockMarket) {
			latestBlockMarket = latestBlock;

			if (toBlockMarket >= latestBlock) {
				toBlockMarket = latestBlock;
			}
			if (fromBlockMarket >= latestBlock) {
				fromBlockMarket = latestBlock;
			}

			console.log(
				"marketInterval",
				latestBlock + "----" + fromBlockMarket + "----" + toBlockMarket
			);
			await getPastEventData(
				fwarMarketDelegateContract,
				"allEvents",
				fromBlockMarket,
				toBlockMarket
			)
				.then(async (data) => {
					await orderMarket(data)
						.then(async (data) => {
							fromBlockMarket = toBlockMarket + 1;
							toBlockMarket = fromBlockMarket + rangeOfBlock;
						})
						.catch(async (error) => {
							console.log("marketInterval: " + error);
						});
				})
				.catch((err) => console.log(err));
		}
	} catch (error) {
		console.log("error:::: " + error);
	}

	isRunningMarket = false;
};
// ------------------- End market

// Ticket
// address: 0xd0B315E4DC7478F18950304432b072D3BB33CA1f
const runBlockTicket = 13832555;
let isRunningTicket = false;
let fromBlockBuyTicket = runBlockTicket;
let toBlockBuyTicket = fromBlockBuyTicket + rangeOfBlock;
let ticketLatestBlock = runBlockTicket;

const buyTicketInterval = async () => {
	if (isRunningTicket) {
		return;
	}
	isRunningTicket = true;
	try {
		const getBlock = await web3.eth.getBlock("latest");
		const latestBlock = getBlock.number;
		// Check if have new block then call function getPastEvent
		if (latestBlock > ticketLatestBlock) {
			ticketLatestBlock = latestBlock;
			if (toBlockBuyTicket >= latestBlock) {
				toBlockBuyTicket = latestBlock;
			}

			if (fromBlockBuyTicket >= latestBlock) {
				fromBlockBuyTicket = latestBlock;
			}
			console.log(
				"buyTicket",
				latestBlock +
					"--" +
					fromBlockBuyTicket +
					"--" +
					toBlockBuyTicket
			);

			await getPastEventData(
				fwarTicketContract,
				"buyTicketEvent",
				fromBlockBuyTicket,
				toBlockBuyTicket
			).then(async (data) => {
				await buyTicket(data)
					.then(async (data) => {
						fromBlockBuyTicket = toBlockBuyTicket + 1;
						toBlockBuyTicket = fromBlockBuyTicket + rangeOfBlock;
					})
					.catch(async (error) => {
						console.log("buyTicketInterval: " + error);
					});
			});
		}
	} catch (error) {
		console.log("buyTicketInterval: " + error);
	}
	isRunningTicket = false;
};
// End Ticket

setInterval(openChestInterval, 30000);
setInterval(characterInterval, 30000);

setInterval(miningInterval, 30000);
setInterval(marketInterval, 30000);
setInterval(buyTicketInterval, 30000);
