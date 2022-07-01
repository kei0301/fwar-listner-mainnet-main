const Web3 = require("web3");
const TokenBurn = require("./../../model/tokenBurn");

const tokenBurn = async (data) => {
  if (data && data.length > 0) {
    let returnValues = data.map((i) => ({
      result: i.returnValues,
      blockNumber: i.blockNumber,
      tx: i.transactionHash,
    }));
    for (const token of returnValues) {
      const existTokenBurn = await TokenBurn.exists({
        blockNumber: token.blockNumber,
        tx: token.tx,
      });
      if (!existTokenBurn) {
        const newTokenBurn = new TokenBurn({
          blockNumber: token.blockNumber,
          tx: token.tx,
          from: token.result.from,
          value: Web3.utils.fromWei(token.result.value, "ether"),
        });
        await newTokenBurn.save();
        console.log("new token burn");
      }
    }
    returnValues = null;
  }
};
module.exports = tokenBurn;
