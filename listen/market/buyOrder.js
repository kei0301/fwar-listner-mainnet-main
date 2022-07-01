const Web3 = require("web3");

const getUserId = require("./../../getUserId");
const Order = require("./../../model/order");
const Character = require("./../../model/character");
const Transaction = require("./../../model/transaction");

const buyOrder = async(data) => {
    if (data && data.length > 0) {
        let returnValues = data.map((i) => ({
            ...i.returnValues,
            transactionHash: i.transactionHash,
        }));

        for (const order of returnValues) {
            const addressSeller = order["_seller"];
            const addressBuyer = order["_buyer"];
            const orderId = order["_orderId"];
            const price = Web3.utils.fromWei(order["price"], "ether");
            const nftIds = order["_nftIds"];
            const userIdSeller = await getUserId(addressSeller);
            const userIdBuyer = await getUserId(addressBuyer);

            const existOrder = await Order.findOne({
                userId: userIdSeller,
                orderId,
            });


            if (existOrder) {
                existOrder.status = "buyed";
                await existOrder.save();
                await Character.updateMany({ nftId: nftIds }, { userId: userIdBuyer, isListed: false });

                const existTx = await Transaction.exists({
                    tx: order.transactionHash,
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
                        nfts,
                        price,
                        tx: order.transactionHash,
                    });
                    await newTransaction.save();
                    console.log('buy order')
                }
            }
        }
        delete returnValues;
    }
};
module.exports = buyOrder;