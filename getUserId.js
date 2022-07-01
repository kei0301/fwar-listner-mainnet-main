const User = require("./model/user");
const randomString = require("random-string");

const getUserId = async (receiver) => {
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
      return newUser._id;
    } else {
      return existUser._id;
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = getUserId;
