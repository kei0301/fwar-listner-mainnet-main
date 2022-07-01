const Character = require("./../../model/character");
const getUserId = require("./../../getUserId");

module.exports = async function mining(data) {
  if (data && data.length > 0) {
    let returnValues = data.map((i) => ({
      event: i.event,
      value: i.returnValues,
    }));
    // console.log(returnValues);
      for (const event of returnValues) {
        if(event.event === 'Stake') {
          const userId = await getUserId(event.value._owner);
             await Character.updateMany({ userId, nftId:event.value["_nftIds"]  }, {isStake: true});
             console.log('Staking');
        }
        if(event.event === 'Unstake') {
          const userId = await getUserId(event.value._owner);
             await Character.updateMany({ userId, nftId:event.value["_nftIds"]  }, {isStake: false});
             console.log('Unstaking');
        }
        
      }
      
      returnValues = null;
  }
};
