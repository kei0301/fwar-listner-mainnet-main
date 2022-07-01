const Web3 = require('web3');

const getUserId = require('./../../getUserId');
const Order = require('./../../model/order');
const Character = require('./../../model/character');

const cancelOrder = async (data) => {
  if (data && data.length > 0) {
    const returnValues = data.map((i) => i.returnValues);
    for (const order of returnValues) {
      const userId = await getUserId(order._owner);
      const existOrder = await Order.findOne({
        userId,
        orderId: order._orderId,
      });
      if (existOrder) {
        existOrder.status = 'canceled';
        existOrder.save();
        const result = await Character.updateMany(
          { nftId: order._nftIds },
          { isListed: false }
        );
        console.log('canceled order')
      }
    }
    delete returnValues;
  }
};
module.exports = cancelOrder;
