const OpenChestHistory = require("./../../model/OpenChestHistory");
const getUserId = require("./../../getUserId");

const createOpenChestHistory = async (data) => {
    if (data && data.length > 0) {
        let returnValues = data.map((i) => ({
            result: i.returnValues,
            tx: i.transactionHash,
        }));
        for (const char of returnValues) {
            const userId = await getUserId(char.result._receiver);

            const existOpenChestHistory = await OpenChestHistory.exists({
                userId,
                transactionHash: char.tx,
            });
            console.log(existOpenChestHistory);
            if (!existOpenChestHistory) {
                let { _number: amount, _openChestInfo: nfts } = char.result;
                // console.log('nft', nfts)
                nfts = nfts.map((i) => {
                    return {
                        tokenId: i[0],
                        rarity: i[1],
                        element: i[2],
                        teamId: i[3],
                    };
                });
                const newOpenChestInfo = new OpenChestHistory({
                    amount,
                    nfts,
                    address: char.result._receiver,
                    transactionHash: char.tx,
                    userId,
                });

                await newOpenChestInfo.save();
                console.log("open chest");
            }
        }
        returnValues = null;
    }
};
module.exports = createOpenChestHistory;
