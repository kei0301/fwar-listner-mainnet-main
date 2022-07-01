const getUserId = require('./../../getUserId');
const Order = require('./../../model/order');
const Character = require('./../../model/character');

const cleanOrder = async (data) => {
  if (data && data.length > 0) {
    let returnValues = data.map((i) => i.returnValues);

    for (const order of returnValues) {
      const userId = await getUserId(order._seller);

      const existOrder = await Order.findOneAndUpdate(
        {
          userId,
          orderId: order._orderId,
        },
        { status: 'cleaned' }
      );

      if (existOrder) {
        await Character.updateMany(
          { nftId: order._nftIds },
          { isListed: false }
        );
        console.log('clean order')
      }
    }
    delete returnValues;
  }
};
module.exports = cleanOrder;
