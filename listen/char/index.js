const Character = require("./../../model/character");
const Team = require("./../../model/team");

const getUserId = require("./../../getUserId");

const CharacterStats = require("./dataChar");

module.exports = async function character(data) {
	if (data && data.length > 0) {
		let returnValues = data.map((i) => ({
			event: i.event,
			value: i.returnValues,
			address: i.address,
			transactionHash: i.transactionHash,
			block: i.blockNumber,
		}));

		for (const event of returnValues) {
			if (event.event === "MintNFT") {
				const userId = await getUserId(event.value.receiver);
				const existChar = await Character.exists({
					nftId: event.value.tokenId,
				});
				if (!existChar) {
					const infoStat = CharacterStats.find(
						(charStat) => charStat.teamId === event.value.teamId
					);
					const infoTeam = await Team.findOne({
						teamId: event.value.teamId,
					}).select("type");

					if (
						event.value.teamId === "2" ||
						event.value.teamId === "3" ||
						event.value.teamId === "11"
					) {
						burnEffectDmg = (
							Number(event.value.attack) * 0.00005
						).toFixed(2);
						poisonEffectDmg = (
							Number(event.value.attack) * 0.00005
						).toFixed(2);
					} else {
						burnEffectDmg = (
							Number(event.value.attack) * 0.0001
						).toFixed(2);
						poisonEffectDmg = (
							Number(event.value.attack) * 0.0001
						).toFixed(2);
					}
					const newCharacter = new Character({
						userId,
						nftId: event.value.tokenId,
						level: event.value.level,
						rarity: event.value.rarity,
						element: event.value.elementType,
						cardType: infoTeam.type,
						attack: (Number(event.value.attack) * 0.001).toFixed(2),
						defense: (Number(event.value.defense) * 0.001).toFixed(
							2
						),
						health: (Number(event.value.health) * 0.001).toFixed(2),
						baseAttack: (
							Number(event.value.attack) * 0.001
						).toFixed(2),
						baseDefense: (
							Number(event.value.defense) * 0.001
						).toFixed(2),
						baseHealth: (
							Number(event.value.health) * 0.001
						).toFixed(2),

						burnEffectDmg: burnEffectDmg,
						poisonEffectDmg: poisonEffectDmg,
						hash: event.value.hash,
						...infoStat,
						teamId: infoTeam._id,
					});
					await newCharacter.save();
					console.log("create character: " + event.value.tokenId);
					continue;
				}
			}
			if (event.event === "UpgradeNFT") {
				const tokenId = event.value["tokenId"];
				const nft = await Character.findOne({
					nftId: tokenId,
				}).populate({ path: "teamId", select: "teamId" });
				if (nft) {
					const level = event.value["level"];
					const teamId = nft["teamId"].teamId;
					const {
						attackSpeed,
						coolDown,
						critDamage,
						level: nft_level,
					} = nft;
					const newAttackSpeed = attackSpeedFn(
						Number(level),
						teamId,
						attackSpeed
					);
					const newCoolDown = coolDownFn(
						Number(level),
						teamId,
						coolDown
					);
					const newCritDamage = critDamageFn(
						Number(level),
						teamId,
						critDamage
					);
					const newBurnEffectDmg = burnEffectDmgFn({
						level: Number(level),
						nft_level: Number(nft_level),
						teamId: teamId,
						attack: Number(event.value.attack) / 1000,
					});
					const newPoisonEffectDmg = poisonEffectDmgFn({
						level: Number(level),
						nft_level: Number(nft_level),
						teamId: teamId,
						attack: Number(event.value.attack) / 1000,
					});
					if (
						newCoolDown &&
						newCritDamage &&
						newBurnEffectDmg &&
						newPoisonEffectDmg &&
						newPoisonEffectDmg
					) {
						const newUpgrade = {
							level: level,
							attack: Number(event.value["attack"]) / 1000,
							defense: Number(event.value["defense"]) / 1000,
							health: Number(event.value["health"]) / 1000,
							hash: event.value["hash"],
							attackSpeed: newAttackSpeed,
							coolDown: newCoolDown,
							critDamage: newCritDamage,
							burnEffectDmg: newBurnEffectDmg.toFixed(2),
							poisonEffectDmg: newPoisonEffectDmg.toFixed(2),
						};

						await Character.findOneAndUpdate(
							{ nftId: tokenId },
							newUpgrade
						);
						console.log("char upgrade: " + tokenId);
					}
				}
				continue;
			}
			if (event.event === "Transfer") {
				if (
					event.value.to ==
					"0x0000000000000000000000000000000000000000"
				) {
					await Character.updateOne(
						{ nftId: event.value.tokenId },
						{ isBurn: true }
					);
					console.log("char burn: " + event.value.tokenId);
				}
			}
		}
		returnValues = null;
	}
};

function attackSpeedFn(level, teamId, attackSpeed) {
	switch (level) {
		case 5:
			if (teamId === "16") return "1.5";
			return attackSpeed;
		case 10:
			if (teamId === "14") return "1.7";
			if (teamId === "16") return "2";
			return attackSpeed;
		default:
			return attackSpeed;
	}
}

function coolDownFn(level, teamId, coolDown) {
	switch (level) {
		case 5:
			switch (teamId) {
				case "0":
					return "2.73";

				case "1":
					return "1.36";

				case "2":
					return "0.91";

				case "3":
					return "0.45";

				case "4":
					return "1.82";

				case "5":
					return "2.09";

				case "6":
					return "1.82";

				case "7":
					return "1.21";

				case "8":
					return "1.82";

				case "9":
					return "1.3";

				case "10":
					return "2.73";

				case "11":
					return "1.82";

				case "12":
					return "1.82";

				case "13":
					return "2.55";

				case "14":
					return "3.91";

				case "15":
					return "1.21";

				case "16":
					return "2.27";

				case "17":
					return "1.07";

				case "18":
					return "1.21";

				case "19":
					return "2.36";

				default:
					return false;
			}

		case 10:
			switch (teamId) {
				case "0":
					return "2";

				case "1":
					return "1";

				case "2":
					return "0.67";

				case "3":
					return "0.3";

				case "4":
					return "1.33";

				case "5":
					return "1.53";

				case "6":
					return "1.33";

				case "7":
					return "0.89";

				case "8":
					return "1.33";

				case "9":
					return "0.95";

				case "10":
					return "2";

				case "11":
					return "1.33";

				case "12":
					return "1.33";

				case "13":
					return "1.87";

				case "14":
					return "2.87";

				case "15":
					return "0.89";

				case "16":
					return "1.67";

				case "17":
					return "0.79";

				case "18":
					return "0.89";

				case "19":
					return "1.73";

				default:
					return false;
			}

		case 15:
			switch (teamId) {
				case "0":
					return "2";

				case "1":
					return "1";

				case "2":
					return "0.67";

				case "3":
					return "0.33";

				case "4":
					return "1.33";

				case "5":
					return "1.53";

				case "6":
					return "1.33";

				case "7":
					return "0.89";

				case "8":
					return "1.33";

				case "9":
					return "0.95";

				case "10":
					return "2";

				case "11":
					return "1.33";

				case "12":
					return "1.33";

				case "13":
					return "1.87";

				case "14":
					return "2.87";

				case "15":
					return "0.89";

				case "16":
					return "1.67";

				case "17":
					return "0.79";

				case "18":
					return "0.89";

				case "19":
					return "1.73";

				default:
					return false;
			}

		case 20:
			switch (teamId) {
				case "0":
					return "1.71";

				case "1":
					return "0.86";

				case "2":
					return "0.57";

				case "3":
					return "0.29";

				case "4":
					return "1.14";

				case "5":
					return "1.31";

				case "6":
					return "1.14";

				case "7":
					return "0.76";

				case "8":
					return "1.14";

				case "9":
					return "0.82";

				case "10":
					return "1.71";

				case "11":
					return "1.14";

				case "12":
					return "1.14";

				case "13":
					return "1.6";

				case "14":
					return "2.46";

				case "15":
					return "0.76";

				case "16":
					return "1.43";

				case "17":
					return "0.67";

				case "18":
					return "0.76";

				case "19":
					return "1.49";

				default:
					return false;
			}

		case 25:
			switch (teamId) {
				case "6":
					return "1.14";

				case "9":
					return "0.82";

				case "3":
					return "0.29";

				case "2":
					return "0.57";

				case "4":
					return "1.14";

				case "0":
					return "1.71";

				case "1":
					return "0.86";

				case "5":
					return "1.31";

				case "7":
					return "0.76";

				case "8":
					return "1.14";

				case "12":
					return "1.14";

				case "13":
					return "1.6";

				case "14":
					return "2.46";

				case "15":
					return "0.76";

				case "16":
					return "1.43";

				case "10":
					return "1.71";

				case "17":
					return "0.67";

				case "18":
					return "0.76";

				case "19":
					return "1.49";

				case "11":
					return "1.14";

				default:
					return false;
			}

		case 30:
			switch (teamId) {
				case "6":
					return "1.14";

				case "9":
					return "0.82";

				case "3":
					return "0.29";

				case "2":
					return "0.57";

				case "4":
					return "1.14";

				case "0":
					return "1.71";

				case "1":
					return "0.86";

				case "5":
					return "1.31";

				case "7":
					return "0.76";

				case "8":
					return "1.14";

				case "12":
					return "1.14";

				case "13":
					return "1.6";

				case "14":
					return "2.46";

				case "15":
					return "0.76";

				case "16":
					return "1.43";

				case "10":
					return "1.71";

				case "17":
					return "0.67";

				case "18":
					return "0.76";

				case "19":
					return "1.49";

				case "11":
					return "1.14";

				default:
					return false;
			}

		default:
			return coolDown;
	}
}

function critDamageFn(level, teamId, critDamage) {
	switch (level) {
		case 15:
			if (teamId === "7") return "2.4";
			return critDamage;

		case 20:
			if (teamId === "17") return "3";
			return critDamage;

		default:
			return critDamage;
	}
}
function burnEffectDmgFn({ level, nft_level, teamId, attack }) {
	if (teamId === "2" || teamId === "3" || teamId === "11") {
		return attack * 0.05;
	} else {
		return attack * 0.1;
	}
}

function poisonEffectDmgFn({ level, nft_level, teamId, attack }) {
	if (teamId === "2" || teamId === "3" || teamId === "11") {
		return attack * 0.05;
	} else {
		return attack * 0.1;
	}
}
