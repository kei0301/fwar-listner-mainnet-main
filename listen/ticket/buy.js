const HistoryBuyTicket = require("./../../model/historyBuyTicket");
const User = require("./../../model/user");

function findAndUpdate(Modal, filters, update, option) {
  return new Promise((resolve, reject) => {
    Modal.findOneAndUpdate(filters, update, option, (err, doc) => {
      if (err) return reject(err);
      resolve(doc);
    });
  });
}

module.exports = async function buyTicket(data) {
  if (data && data.length > 0) {
    for (const history of data) {
      const { transactionHash, returnValues } = history;
      const { _caller, _payToken, _amount } = returnValues;
      const existHistory = await HistoryBuyTicket.exists({
        transactionHash,
      });
      if (!existHistory) {
        await findAndUpdate(
          HistoryBuyTicket,
          { transactionHash: transactionHash },
          {
            transactionHash,
            caller: _caller,
            payToken: _payToken,
            amount: _amount,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
        await findAndUpdate(
          User,
          { address: _caller },
          { $inc: { ticket: Number(_amount) } },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
        console.log("buy ticket");
      }
      console.log("exist ticket");
    }
  }
};
