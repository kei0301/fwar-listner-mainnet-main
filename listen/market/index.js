const Web3 = require("web3");

const getUserId = require("./../../getUserId");
const Order = require("./../../model/order");
const Character = require("./../../model/character");
const Transaction = require("./../../model/transaction");

const orderMarket = async (data) => {
	if (data && data.length > 0) {
		let returnValues = data.map((i) => ({
			event: i.event,
			value: i.returnValues,
			blockNumber: i.blockNumber,
			transactionHash: i.transactionHash,
		}));

		for (const event of returnValues) {
			if (event.event === "CreateOrder") {
				const userId = await getUserId(event.value["_owner"]);
				const existOrder = await Order.exists({
					orderId: event.value["_orderId"],
				});

				console.log("existOrder", existOrder);

				const nftInfos = await Character.find({
					nftId: event.value["_nftIds"],
				}).populate("teamId");

				const nfts = nftInfos.map((i) => ({
					nftId: i.nftId,
					element: i.element,
					rarity: i.rarity,
					level: i.level,
					hash: i.hash,
					teamId: i.teamId.teamId,
					cardType: i.cardType,
					attack: i.attack,
					defense: i.defense,
					health: i.health,
				}));
				if (!existOrder) {
					const newOrder = new Order({
						orderId: event.value["_orderId"],
						userId: userId,
						nfts: nfts,
						nftContract: event.value["_nftContract"],
						token: event.value["_token"],
						price: Web3.utils.fromWei(event.value["_price"], "ether"),
						expiration: event.value["_expiration"],
					});
					await newOrder.save();

					await Character.updateMany({ nftId: event.value["_nftIds"] }, { isListed: true });
					console.log("create order");
				} else {
					const oldOrder = await Order.findOne({
						orderId: event.value["_orderId"],
					});
					oldOrder.status = "listed";
					oldOrder.price = Web3.utils.fromWei(event.value["_price"], "ether");
					oldOrder.userId = userId;
					oldOrder.nfts = nfts;
					oldOrder.expiration = event.value["_expiration"];
					await oldOrder.save();
					await Character.updateMany({ nftId: event.value["_nftIds"] }, { isListed: true });
					console.log("update exist order");
				}
				continue;
			}
			if (event.event === "BuyOrder") {
				const addressSeller = event.value["_seller"];
				const addressBuyer = event.value["_buyer"];
				const orderId = event.value["_orderId"];
				const price = Web3.utils.fromWei(event.value["price"], "ether");
				const nftIds = event.value["_nftIds"];
				// const userIdSeller = await getUserId(addressSeller);
				const userIdBuyer = await getUserId(addressBuyer);

				const existOrder = await Order.findOne({
					// userId: userIdSeller,
					orderId: orderId,
				});

				if (existOrder) {
					existOrder.status = "buyed";
					await existOrder.save();
					await Character.updateMany({ nftId: nftIds }, { userId: userIdBuyer, isListed: false });
					
					const existTx = await Transaction.exists({
						tx: event.transactionHash,
					});

					if (!existTx) {
						const nftInfos = await Character.find({ nftId: nftIds })
							.populate({ path: "teamId", select: "teamId" })
							.select(["nftId", "rarity", "element", "teamId"]);
						const nfts = nftInfos.map((i) => ({
							nftId: i.nftId,
							rarity: i.rarity,
							element: i.element,
							teamId: i.teamId.teamId,
						}));
						const newTransaction = new Transaction({
							from: addressSeller,
							owner: addressBuyer,
							nfts:nfts,
							price: price,
							tx: event.transactionHash,
						});
						await newTransaction.save();
					}
					console.log("buy order");
				}
				continue;
			}
			if (event.event === "CancelOrder") {
				// const userId = await getUserId(event.value["_owner"]);
				const existOrder = await Order.findOne({
					orderId: event.value["_orderId"],
				});
				if (existOrder) {
					existOrder.status = "canceled";
					existOrder.save();
					await Character.updateMany(
						{ nftId: event.value["_nftIds"] },
						{ isListed: false }
					);
					console.log("cancel order");
				}
				continue;
			}
			if (event.event === "CleanOrder") {
				// const userId = await getUserId(event.value["_seller"]);
				const existOrder = await Order.findOneAndUpdate(
					{
						// userId,
						orderId: event.value["_orderId"],
					},
					{ status: "cleaned" }
				);
				if (existOrder) {
					await Character.updateMany(
						{ nftId: event.value["_nftIds"] },
						{ isListed: false }
					);
				}
			}
		}
		returnValues = null;
	}
};
module.exports = orderMarket;
