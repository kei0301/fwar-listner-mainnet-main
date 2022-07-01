require("./connectDb");
const User = require("./model/user");
const Character = require("./model/character");

const updateTeamId = async (i) => {
    const infoTeam = await Team.findOne({ teamId: `${i}` });
    // const chars = await Character.find({ teamId: '0' });
    await Character.updateMany({ teamId: `${i}` }, { teamId: infoTeam._id });
    console.log("info team", infoTeam);
};
const getCharAndTeam = async () => {
    const char = await Character.findOne({
        userId: "61558275cb82720023f5657a",
    }).populate("teamId");
    console.log(char);
};
async function removeChar() {
    const chars = await Character.deleteMany({
        userId: "616ae78f6387c6cf977b2e50",
    });
    console.log(chars);
}

const checkSame = async () => {
    const nfts = await Character.find({});
    for (let i = 99; i <= nfts.length + 99; i++) {
        console.log(i);
        const nft = await Character.find({ nftId: i });
        if (nft.length > 1) {
            console.log(nfts[1990]);
        }
    }
};
// checkSame();

const getChar = async () => {
    const result = await Character.find({ userId: "61aaa27de65b727fea710dee" });
    console.log(result);
};

const updateMany = async () => {
    const data = await User.updateMany({}, { ticket: 0 });
    // const result = data.map((i) => ({ ...i, currentBoard: 1 }));
    // await result.save();
    console.log("ok");
};
// updateMany();
getChar();
