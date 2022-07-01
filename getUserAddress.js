const User = require("./model/user");
const randomString = require("random-string");

const getUserAddress = async (receiver) => {
  try {
    const existUser = await User.findOne({ address: receiver });
    if (!existUser) {
      const name = randomString({
        length: 8,
        numeric: true,
        letters: true,
        special: false,
      });
      const newUser = new User({ address: receiver, name });
      console.log("newUser", newUser);
      await newUser.save();
      return newUser.address;
    } else {
      return existUser.address;
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = getUserAddress;
