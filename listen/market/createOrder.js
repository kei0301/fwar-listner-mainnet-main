const Web3 = require('web3');

const getUserId = require('./../../getUserId');
const Order = require('./../../model/order');
const Character = require('./../../model/character');

const createOrder = async(data) => {
    if (data && data.length > 0) {
        let returnValues = data.map((i) => i.returnValues);

        for (const order of returnValues) {
            const userId = await getUserId(order._owner);

            const existOrder = await Order.exists({
                userId,
                orderId: order._orderId,
            });
            console.log("a", existOrder);
            const nftInfos = await Character.find({
                nftId: order._nftIds,
            }).populate('teamId');

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
                    orderId: order._orderId,
                    userId: userId,
                    nfts: nfts,
                    nftContract: order._nftContract,
                    token: order._token,
                    price: Web3.utils.fromWei(order._price, 'ether'),
                    expiration: order._expiration,
                });
                await newOrder.save();

                const result = await Character.updateMany({ nftId: order._nftIds }, { isListed: true });
                console.log('create order')
            } else {
                const oldOrder = await Order.findOne({
                    userId,
                    orderId: order._orderId,
                });
                oldOrder.status = 'listed';
                oldOrder.price = Web3.utils.fromWei(order._price, 'ether');
                oldOrder.userId = userId;
                oldOrder.nfts = nfts;
                oldOrder.expiration = order._expiration;
                oldOrder.save();
                console.log('create order')
            }
        }
        delete returnValues;
    }
};
module.exports = createOrder;