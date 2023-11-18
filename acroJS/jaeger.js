/*	-WHAT IS THIS?-
	This file adds optional material to "MPMB's Character Record Sheet" found at https://flapkan.com/mpmb/charsheets
	Import this file using the "Add Extra Materials" bookmark.

	-KEEP IN MIND-
	It is recommended to enter the code in a fresh sheet before adding any other information (i.e. before making your character with it).
*/

/*	-INFORMATION-
	Subject:	Class
	Effect:		This script adds the Jaeger class
				and the five subclasses for it: "Absolute Chapter", "Heretic Chapter", "Marauder Chapter", "Salvation Chapter", and "Sanguine Chapter"

				This is taken from Steinhardt's Guide to the Eldritch Hunt (https://www.kickstarter.com/projects/monkey-dm/eldritch-hunt?ref=80vjq8)
				This class and subclasses are made by MonkeyDM

	Code by:	Nat1110
	Date:		2023-03-03 (sheet v13.0.0)

	Please support the creator of this content (MonkeyDM) and purchase before using this class

*/

var iFileName = "Jaeger [by MonkeyDM, transcribed by Nat1110].js";
RequiredSheetVersion("13.0.0");

SourceList["SGttEH:J"] = {
	name : "Steinhardt's Guide to the Eldritch Hunt: Jaeger Class",
	abbreviation : "SGttEH:J",
	group : "MonkeyDM",
	url : "https://www.kickstarter.com/projects/monkey-dm/eldritch-hunt?ref=80vjq8",
	date : "2023/11/15"
};

// Add a persistent function, as a local variable it won't be usable after re-opening the sheet
SGttEHJ_MomentumDie = function(n) {
	return "1d" + (n < 5 ? 6 : n < 11 ? 8 : n < 17 ? 10);
};

// Different Fighting Styles for the Jaeger
var FightingStyles = {
	dueling : {
		name : "Dueling Fighting Style",
		description : desc("+2 to damage rolls when wielding a melee weapon in one hand and no other weapons"),
		calcChanges : {
			atkCalc : [
				function (fields, v, output) {
					for (var i = 1; i <= FieldNumbers.actions; i++) {
						if ((/off.hand.attack/i).test(What('Bonus Action ' + i))) return;
					};
					if (v.isMeleeWeapon && !v.isNaturalWeapon && !(/((^|[^+-]\b)2|\btwo).?hand(ed)?s?\b/i).test(fields.Description)) output.extraDmg += 2;
				},
				"When I'm wielding a melee weapon in one hand and no weapon in my other hand, I do +2 damage with that melee weapon. This condition will always be false if the bonus action 'Off-hand Attack' exists."
			]
		}
	},
	great_weapon : {
		name : "Great Weapon Fighting Style",
		description : desc("Reroll 1 or 2 on damage if wielding two-handed/versatile melee weapon in both hands"),
		calcChanges : {
			atkAdd : [
				function (fields, v) {
					if (v.isMeleeWeapon && (/(\bversatile|((^|[^+-]\b)2|\btwo).?hand(ed)?s?)\b/i).test(fields.Description)) {
						fields.Description += (fields.Description ? '; ' : '') + 'Re-roll 1 or 2 on damage die' + ((/versatile/i).test(fields.Description) ? ' when two-handed' : '');
					}
				},
				"While wielding a two-handed or versatile melee weapon in two hands, I can re-roll a 1 or 2 on any damage die once."
			]
		}
	},
	flexible : {
		name : "Flexible Fighting Style",
		description : desc("+1 to damage when wielding both weapons"),
		calcChanges : {
			atkCalc : [
				function (fields, v, output) {
					if (v.isOffHand) output+1 = true;
				},
				"When I'm wielding 2 melee weapons, I do +1 damage with both weapons. This condition will always be true if the bonus action 'Off-hand Attack' exists."
			]
		}
	},
	focused : {
		name : "Focused Fighting Style",
		description : desc("I learn an additional Focus Art, and gain 1 additional Focus Point."),
		// need help with this
	},
	two_weapon : {
		name : "Two-Weapon Fighting Style",
		description : desc("I can add my ability modifier to the damage of my off-hand attacks"),
		calcChanges : {
			atkCalc : [
				function (fields, v, output) {
					if (v.isOffHand) output.modToDmg = true;
				},
				"When engaging in two-weapon fighting, I can add my ability modifier to the damage of my off-hand attacks. If a melee weapon includes 'off-hand' or 'secondary' in its name or description, it is considered an off-hand attack."
			]
		}
	}
};

ClassList["jaeger"] = {
	regExpSearch : /^(?=.*jaeger).*$/i,
	name : "Jaeger",
	source : [["SGttEH:J", 112]],
	primaryAbility : "Dexterity",
	prereqs : "Dexterity 13",
	die : 8,
	improvements : [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5],
	saves : ["Dex", "Int"],
	skillstxt : {
		primary : "Choose two from Acrobatics, Arcana, Athletics, History, Investigation, Medicine, Nature, Perception, Religion, Sleight of Hand, Stealth, and Survival",
	},
	
	armorProfs : {
		primary : [true, true, false, false]
	},
	weaponProfs : {
		primary : [true, true]
	},
	equipment : "Jaeger starting equipment:\n \u2022 Scale mail -or- leather armor;\n \u2022 two martial weapons;\n \u2022 A pistol and pouch of 20 bullets -or- any two simple weapons;\n \u2022 An explorer's pack -or- a dungeoneer's pack.\n\nAlternatively, choose 4d4 \xD7 10 gp worth of starting equipment instead of both the class' and the background's starting equipment.",
	subclasses : ["Jaeger Chapters", ["Absolute Chapter", "Heretic Chapter", "Marauder Chapter", "Salvation Chapter", "Sanguine Chapter"]],
	attacks : levels.map(function(n){return n < 5 ? 1 : 2}),
	features : {
		"Focus" : {
			name : "Focus",
			source : [["SGttEH:J", 3]],
			minlevel : 1,
			description : desc([
				'I can use a Focus Point to do a Focus Art; Use the "Choose Features" button above',
				"I can regain all Focus Points after a long rest",
				"Whenever I roll initiative with no focus points, I regain a focus point",
				"Whenever I roll a 20 on a saving throw or an attack roll against a hostile creatre, I regain a focus point",
				"I know the Focus Arts \"Weapon Parry\" and \"Dodge Step\"",
				"Whenever I learn a new Focus Art, I can also replace a Focus Art I know with another",
			]),
			additional : levels.map(function (n) {
				return (n < 2 ? 3 : n < 7 ? 2 : n < 13 ? 3 : n < 17 ? 4 : 5) + " focus art" + (n < 6 ? "" : "s") + " known";
			}),
			usages : levels.map(function (n) {
				return n < 1 ? 3 : n < 2 ? 4 : n < 9 ? 5 : n < 13 ? 6 : n < 17 ? 7 : 8;
			}),
			recovery : "long rest",
			extraname : "Focus Art",
			extrachoices : ["Weapon Parry", "Dodge Step", "Aerial Vault", "Elemental Art", "Focus Mind", "Flourish", "I Don't Want To Be Eaten Today", "Jaeger's Rush", "Jaeger's Assessment"],
			extraTimes : levels.map(function (n) {
				return n < 2 ? 3 : n < 7 ? 2 : n < 13 ? 3 : n < 17 ? 4 : 5;
			}),
			"weapon parry" : {
				name : "Weapon Parry",
				source : [["SGttEH:J", 115]],
				description : desc([
					"As a reaction to being hit by a creature I can see within range of a weapon I am holding, I can",
					"expend 1 Focus Point to make a special weapon attack against that creature. This attack does no damage, but",
					"instead blocks an amount of damage from the incoming attack equal to the weapon's damage roll",
					"(including my ability modifier), unless my attack roll is a 1. On a 20, any weapon damage dice are rolled",
					"twice (like a critical hit would be), and if this total fully blocks the incoming attack, the target is stunned until",
					"the start of its next turn."
				]),
				action : [["reaction", ""]],
			},
			"dodge step" : {
				name : "Dodge Step",
				source : [["SGttEH:J", 115]],
				description : desc([
					"As a reaction to being attacked by a creature I can see, if my speed is not 0, I can expend 1 Focus",
					"Point to move 5 feet without provoking opportunity attacks and make a Dexterity saving throw with a DC",
					"equal to the attacker's attack roll (including modifiers). On a success, I evade completely and take no",
					"damage. On a failure, I halve the attack's damage against me."
				]),
				action : [["reaction", ""]]
			},
			"aerial vault" : {
				name : "Aerial Vault",
				source : [["SGttEH:J", 126]],
				description : desc([
					"When I make a jump, I can expend 1 Focus Point to double my jumping distance for that jump, and I",
					"can ignore difficult terrain until the end of my turn. When I use this Focus Art, the maximum distance",
					"I can jump isn’t limited by my walking speed."
				]),
			},
			"elemental art" : {
				name : "Elemental Art",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a bonus action, I expend 1 Focus Point and touch a weapon I'm carrying. Choose between acid, cold,",
					"fire, or lightning. For 1 minute, the weapon deals that damage type instead of its normal type."
				]),
				action : [["bonus action", ""]]
			},
			"focus mind" : {
				name : "Focus Mind",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a reaction to making a saving throw against being charmed, frightened, or having my mind read or",
					"influenced, I can expend 1 Focus Point to gain advantage on the roll. If I already have advantage on",
					"the roll, I can reroll one of the dice once."
				]),
				action : [["reaction", ""]]
			},
			"flourish" : {
				name : "Flourish",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a bonus action, I can expend 1 Focus Point and gain 1 additional Momentum die (gaining 2",
					"Momentum dice in total, which includes the die gained through the Momentum feature from expending the",
					"Focus Point on Flourish)."
				]),
				action : [["bonus action", ""]]
			},
			"i don't want to be eaten today" : {
				name : "I Don't Want To Be Eaten Today",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a reaction to becoming grappled or restrained by an effect that has an escape DC or to making a contested",
					"roll against these conditions, I can expend 1 Focus Point to attempt to immediately escape the effect,",
					"making an Athletics or Acrobatics check against the escape DC, or to gain advantage on the contested roll."
				]),
				action : [["bonus action", ""]]
			},
			"jaeger's rush" : {
				name : "Jaeger's Rush",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a bonus action, I can expend 1 Focus Point to take the Dash Action"
				]),
				action : [["bonus action", ""]]
			}
			"jaeger's assessment" : {
				name : "Jaeger's Assessment",
				source : [["SGttEH:J", 126]],
				description : desc([
					"As a bonus action, I can expend 1 Focus Point to make an Investigation check against a creature I can",
					"see within 60 feet of me, contested by its Deception check. On success, I learn its creature type, AC, any",
					"resistances or immunities it has to damage or conditions, and any spells it is under the effect of.",
					"Alternatively, when I take this bonus action, I can take the Search action."
				]),
				action : [["bonus action", ""]]
			},
		},
		"Finisher" : {
			name : "Finisher",
			source : [["SGttEH:J", 116]],
			minlevel : 1,
			description : desc([
				desc([
				"Starting at 2nd level, any time I expend a Focus Point, I gain 1 Momentum die, which is a d6. This die",
				"changes as I gain jaeger levels. I can have a maximum number of Momentum",
				"dice equal to my proficiency bonus + my Strength or Dexterity modifier (whichever is higher). Whenever I",
				"gain a Momentum die, or if I attack or end my turn within 5 feet of a hostile creature, all of my",
				"Momentum dice last until the end of my next turn. While I have 1 or more Momentum dice, I can",
				"expend all of my Momentum dice to execute a Finisher. I know the Brutal Finisher. I learn one additional",
				"Finisher of my choice at 4th, 6th, 8th, and 12th level, and may gain others through Jaeger Chapter features."
			]),
			]),
			additional : levels.map(function (n) {
				return (n < 2 ? 1 : n < 4 ? 2 : n < 6 ? 3 : n < 8 ? 4 : 5) + " finisher" + (n < 6 ? "" : "s") + " known";
			}),
			extraname : "Finisher",
			extrachoices : ["Brutal Finisher", "Breaking Blow", "Chasing Finisher", "Hemorrhaging Wound", "Opportunistic Shot", "Viscious Finisher", "Volley Finisher"],
			extraTimes : levels.map(function (n) {
				return n < 2 ? 1 : n < 4 ? 2 : n < 6 ? 3 : n < 8 ? 4 : 5;
			}),
			"brutal finisher" : {
				name : "Brutal Finisher",
				source : [["SGttEH:J", 116]],
				description : desc([
					"When I hit a creature with an attack, I can expend all of my Momentum dice and add them to the",
					"damage roll. If I reduce the target to 0 hit points with this Finisher, or the target is reduced to 0 hit",
					"points before the start of my next turn, I regain 1 Focus Point."
				]),
			},
			"breaking blow" : {
				name : "Breaking Blow",
				source : [["SGttEH:J", 126]],
				description : desc([
					"When I hit a creature with an attack, I can expend all of my Momentum dice to force the target to make",
					"a saving throw, suffering a condition for 1 minute on a failure. The DC of the save is 8 + my Strength or",
					"Dexterity modifier (my choice) + my proficiency bonus. The type of saving throw and the condition",
					"depend on the number of Momentum dice I have when I use this Finisher. I can choose to inflict a",
					"condition that requires fewer Momentum dice than I expend, but all Momentum dice are expended",
					"regardless of the condition selected. \nThe target can repeat its saving throw against the",
					"condition at the end of each of its turns, ending the effect on a success. If the condition inflicted is Prone,",
					"they do not need to pass a subsequent save and can end the condition by standing as normal instead.",
					"\nIf the target fails its initial save against the effect, I regain 1 Focus Point.",
					"\n1 momentum dice, make a strength saving throw or be knocked prone",
					"\n2 momentum dice, make a constitution saving throw or be blinded",
					"\n3 momentum dice, make a strength saving throw or be restrained",
					"\n4 momentum dice, make a constitution saving throw or be stunned",
					"\n5+ momentum dice, make a constitution saving throw or be paralyzed"
				]),
			},
			"chasing finisher" : {
				name : "Chasing Finisher",
				source : [["SGttEH:J", 127]],
				description : desc([
					"As a bonus action, I expend all of my Momentum dice to move 10 feet per die expended before making a",
					"melee weapon attack. On a hit, add the expended Momentum dice to the attack’s damage roll.",
					"\nIf I move at least 30 feet using the Finisher, I regain 1 Focus Point."
				]),
				action : [["bonus action", ""]]
			},
			"hemorrhaging wound" : {
				name : "Hemorrhaging Wound",
				source : [["SGttEH:J", 127]],
				description : desc([
					"When I hit a creature with an attack, I can expend all of my Momentum dice to rend a vicious bleeding",
					"wound. At the end of each of the creature's turns, it loses hit points equal to the Momentum dice",
					"expended. Each time it takes damage from this effect, the number of dice of damage it takes at the end of its",
					"next turn is reduced by 1, and the bleeding stops when the number of dice would be reduced to 0. A bleeding",
					"creature can make a Constitution saving throw at the end of each of its turns, after taking the damage,",
					"ending the effect on a success. The DC of the save is 8 + my Strength or Dexterity modifier (my choice) +",
					"my proficiency bonus + half the number of dice remaining, rounded down.\n",
					"Applying a new bleed while the target is still bleeding does not stack, but instead refreshes the number of",
					"dice of damage taken from the bleed to the higher of the two values."
				]),
			},
			"opportunistic shot" : {
				name : "Opportunistic Shot",
				source : [["SGttEH:J", 127]],
				description : desc([
					"As a reaction when a creature within 20 feet of me becomes paralyzed, restrained, or stunned, I can",
					"expend all of my Momentum dice and make a single weapon attack with a firearm I am holding. On a hit,",
					"the target takes damage equal to the weapon's damage roll plus the expended Momentum dice, it is knocked",
					"prone, and I regain 1 Focus Point."
				]),
				action : [["reaction", ""]]
			},
			"viscious finisher" : {
				name : "Viscious Finisher",
				source : [["SGttEH:J", 127]],
				description : desc([
					"As a bonus action, I expend all of my Momentum dice to form a spectral beast claw around one hand and",
					"make a melee weapon attack with it against a creature within 5 feet of me. I can use my choice of my",
					"Strength or Dexterity modifier for the attack and damage rolls of this attack. On a hit, the target takes",
					"magical slashing damage equal to 1d12 + my Strength modifier + the Momentum dice expended. This attack",
					"has a higher critical hit range based on the number of Momentum dice expended, reducing the roll needed by",
					"2 for each die, up to a maximum of scoring a critical hit on a 10-20 with 5 Momentum dice.",
					"\nIf the Finisher is a critical hit, I regain 1 Focus Point."
				]),
				action : [["bonus action", ""]]
			},
			"volley finisher" : {
				name : "Volley Finisher",
				source : [["SGttEH:J", 127]],
				description : desc([
					"As a bonus action while I am holding a firearm, I can expend all of my Momentum dice to reload and fire a spray of shots at blinding speed. Each creature in a 30-",
					"foot cone must make a Dexterity saving throw (DC = 8 + my Dexterity modifier + my proficiency bonus). On a",
					"failure, a creature takes piercing damage equal to the Momentum dice expended.",
					"If the Finisher damages 2 or more creatures, I regain 1 Focus Point."
				]),
				action : [["bonus action", ""]]
			}
		},
		"momentum die" : {
			name : "Momentum Die",
			source : [["SGttEH:J", 116]],
			minlevel : 2,
			description : "",
			additional : levels.map(SGttEHJ_MomentumDie)
		},
		"flexible combatant" : {
			name : "Flexible Combatant",
			source : [["SGttEH:J", 115]],
			minlevel : 1,
			description : desc([
				"Beginning at 1st level, I can draw or stow two onehanded weapons when I would normally be able to",
				"draw or stow only one, and I can reload weapons with the loading, reload, or barrel properties without a free hand.",
				"\nAdditionally, if I'm carrying a one-handed melee weapon in one hand, and a one-handed ranged weapon",
				"in the other, I do not have disadvantage from being within 5 feet of a hostile creature on attacks made with that ranged weapon."
			])
		},
		"eldritch hunter" : {
			name : "Eldritch Hunter",
			source : [["SGttEH:J", 115]],
			minlevel : 1,
			description : desc([
				"Also at 1st level, when I make an ability check to track or identify an aberration, celestial, fiend, monstrosity, or",
				"undead, I can add my proficiency bonus to the ability check. If I am already proficient in the ability check, I can double my proficiency bonus."
			])
		},
		"fighting style" : {
				name : "Fighting Style",
				source : [["SGttEH:J", 116]],
				minlevel : 1,
				description : desc('I adopt a style of fighting as my specialty. Choose one of the following options. I can’t take a Fighting Style option more than once, even if I later get to choose again.'),
				choices : ["Dueling", "Great Weapon Fighting", "Flexible Fighting", "Focused Fighting", "Two-Weapon Fighting"],
				"dueling" : FightingStyles.dueling,
				"great weapon fighting" : FightingStyles.great_weapon,
				"flexible fighting" : FightingStyles.flexible,
				"Focused Fighting" : FightingStyles.focused,
				"two-weapon fighting" : FightingStyles.two_weapon
		},	
		"subclassfeature3" : {
			name : "Jaeger Chapter",
			source : [["SGttEH:J", 118]],
			minlevel : 3,
			description : desc([
				'I Choose a Jaeger Chapter to commit to and put it in the "Class" field',
				"Choose either the Absolute, Heretic, Marauder, Salvation, or Sanguine Chapter"
			])
		},
		"piercing gaze" : {
			name : "Piercing Gaze",
			source : [["SGttEH:J", 117]],
			minLevel : 3,
			description : desc([
				"Also at 3rd level, I gain the ability to activate a magical sight at will (no action required), allowing me",
				"to effortlessly pierce the gloom and see what lurks within. For 1 hour, I gain darkvision out to a range of",
				"60 feet. If I already have darkvision, its range increases to 120 feet. This vision lets me see normally in",
				"dim light and darkness, both magical and nonmagical. \nWhen I reach 7th level, I also gain the effect of see",
				"invisibility for the duration, and when I reach 13th level, I additionally gain the effect of true seeing for the duration.",
				"\nOnce I use this feature, I can’t use it again until I finish a long rest."
			]),
			recovery : "long rest",
		},
		"ability score improvement" : {
			//don't know how to do this, invoke ability score improvements
		},
		"seasoned survivor" : {
			name : "Seasoned Survivor",
			source : [["SGttEH:J", 117]],
			minLevel : 4,
			description : desc([
				"At 4th level, I gain advantage on Investigation checks made to find secret passages, interpret markings or messages left by",
				"other creatures on walls or surfaces, or determine the fate of creatures from blood stains and remains."
			])
		},
		"extra attack" : {
			name : "Extra Attack",
			source : [["SGttEH:J", 117]],
			minLevel : 5,
			description : desc([
				"Beginning at 5th level, I can attack twice, instead of once, whenever I take the Attack action on my turn."
			])
		},
		"hunter's pursuit" : {
			name : "Hunter's Pursuit",
			source : [["SGttEH:J", 117]],
			minLevel : 6,
			description : desc([
				"Starting at 6th level, at the start of my turn, I can expend 1 Focus Point to immediately move up to half",
				"my speed without using any of my movement and without provoking opportunity attacks."
			])
		},
		"evasion" : {
			name : "Evasion",
			source : [["SGttEH:J", 117]],
			minlevel : 9,
			description : desc("My Dexterity saves vs. areas of effect negate damage on success and halve it on failure"),
			savetxt : { text : ["Dex save vs. area effects: fail \u2015 half dmg, success \u2015 no dmg"] }
		},
		"lethal tempo" : {
			name : "Lethal Tempo",
			source : [["SGttEH:J", 117]],
			minLevel : 11,
			description : desc([
				"Starting at 11th level, the first time I hit a creature on my turn, I gain 1 Momentum die. I gain 1",
				"additional Momentum die any time I reduce a creature to 0 hit points."
			])
		},
		"relentless pursuit" : {
			name : "Relentless Pursuit",
			source : [["SGttEH:J", 117]],
			minLevel : 13,
			description : desc("Starting at 13th level, when I use my Hunter's Pursuit, if I end my movement next to a hostile creature, I regain the expended Focus Point.")
		},
		"inured to madness" : {
			name : "Inured To Madness",
			source : [["SGttEH:J", 117]],
			minLevel : 15,
			description : desc([
				"At 15th level, I gain advantage on saving throws against being charmed or frightened, and against",
				"effects that cause madness. If I fail a saving throw against madness, I can expend 1 Focus Point to reroll",
				"the die. I must use the new roll."
			]),
			savetxt : { adv_vs : ["frightened", "charmed", "madness"] }
		},
		"eternal watch" : {
			name : "Eternal Watch",
			source : [["SGttEH:J", 117]],
			minLevel : 18,
			description : desc("Starting at 18th level, I am always under the effect of Piercing Gaze.")
		},
		"alsways ready" : {
			name : "Always Ready",
			source : [["SGttEH:J", 117]],
			minLevel : 20,
			description : desc([
				"Starting at 20th level, once per round (beginning at the start of each of my turns), I gain one",
				"additional reaction, which I can only use on a Focus Art that requires a reaction (such as Weapon Parry or",
				"Dodge Step). When I expend a Focus Point on this special reaction, I immediately regain the expended Focus Point."
			]),
		}
	},
};

AddSubClass("jaeger", "absolute", {
	regExpSearch : /^(?=.*ghost)(?=.*slayer).*$/i,
	subname : "Absolute Chapter",
	source : [["SGttEH:J", 5]],
	fullname : "Absolute",
	features : {
		"subclassfeature3" : {
			name : "Curse Specialist",
			source : [["SGttEH:J", 5]],
			minlevel : 3,
			description : "\n   I gain an extra blood maledict use; My curses can always affect creatures without blood",
			eval : function (v) {
				AddFeature('Blood Maledict', 1, '', 'short rest', 'Order of the Ghostslayer: Curse Specialist', 'bonus');
			},
			removeeval : function (v) {
				RemoveFeature('Blood Maledict', 1);
			},
			"primal rite of the dawn" : {
				name : "Rite of the Dawn",
				extraname : "Crimson Rite",
				source : [["SGttEH:J", 5]],
				description : " [radiant damage]" + desc([
					"While this rite is active, my weapon deals an extra hemocraft die of rite damage vs. undead",
					"Also, my weapon sheds 20-ft radius bright light and I gain resistance to necrotic damage"
				])
			},
			autoSelectExtrachoices : [{
				extrachoice : 'primal rite of the dawn'
			}]
		},
		"subclassfeature7" : {
			name : "Ethereal Step",
			source : [["SGttEH:J", 5]],
			minlevel : 7,
			description : desc([
				"At the start of my turn, if I'm not incapacitated, I can choose to step between planes",
				"I can then see and affect ethereal things; This lasts for my Int mod in rounds (min 1)",
				"Also, I can move through normal creatures and objects as if they were difficult terrain",
				"If I end my turn inside something, I take 1d10 force damage, or 2 per ft if I'm shunted",
				"I'm shunted to an empty space if this feature ends while I'm inside a creature or object"
			]),
			usages : levels.map(function (n) { return n < 7 ? 0 : n < 15 ? 1 : 2; }),
			recovery : "short rest"
		},
		"subclassfeature11" : {
			name : "Brand of Sundering",
			source : [["SGttEH:J", 6]],
			minlevel : 11,
			description : desc([
				"If I damage a branded creature with a weapon with an active crimson rite, I sunder it",
				"It takes an extra hemocraft die of damage and can't move through objects or creatures"
			]),
			calcChanges : {
				atkAdd : [
					function (fields, v) {
						if (!v.isSpell && (/\brite\b/i).test(v.WeaponTextName)) {
							fields.Description += (fields.Description ? '; ' : '') + '+' + SGttEHJ_MomentumDie(classes.known['blood hunter'].level) + ' rite damage vs. branded creature';
						}
					},
					"If I include the word 'Rite' in a weapon's name, it gets an additional hemocraft die if target is branded."
				]
			},
			"blood curse of the exorcist" : {
				name : "Blood Curse of the Exorcist",
				extraname : "Order of the Ghostslayer 15; Blood Curse",
				source : [["SGttEH:J", 11]],
				description : desc([
					"As a bonus action, I stop a target I can see in 30 ft being frightened, charmed, or possessed",
					"\u2022 Amplify: The creature that caused the stopped condition takes 4d6 psychic damage",
					"  Additionally, it must make Wisdom save or be stunned until the end of my next turn"
				]),
				action : [["bonus action", ""]]
			},
			autoSelectExtrachoices : [{
				extrachoice : "blood curse of the exorcist",
				minlevel : 15
			}]
		},
		"subclassfeature18" : {
			name : "Rite Revival",
			source : [["SGttEH:J", 6]],
			minlevel : 18,
			description : "\n   If I drop to 0 HP, but I'm not killed, I can end a crimson rite to instead stay at 1 HP"
		}
	}
});

AddSubClass("blood hunter", "profane soul", {
	regExpSearch : /^(?=.*profane)(?=.*soul).*$/i,
	subname : "Order of the Profane Soul",
	source : ["SGttEH:J", 7],
	spellcastingFactor : "warlock3",
	spellcastingTable : [
		[0, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 0
		[0, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 1
		[0, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 2
		[1, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 3
		[1, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 4
		[1, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 5
		[2, 0, 0, 0, 0, 0, 0, 0, 0], //lvl 6
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl 7
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl 8
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl 9
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl10
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl11
		[0, 2, 0, 0, 0, 0, 0, 0, 0], //lvl12
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl13
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl14
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl15
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl16
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl17
		[0, 0, 2, 0, 0, 0, 0, 0, 0], //lvl18
		[0, 0, 0, 2, 0, 0, 0, 0, 0], //lvl19
		[0, 0, 0, 2, 0, 0, 0, 0, 0]  //lvl20
	],
	spellcastingKnown : {
		cantrips : [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
		spells : [0, 0, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 11]
	},
	spellcastingList : {
		class : "warlock",
		level : [0, 4]
	},
	features : {
		"subclassfeature3" : {
			name : "Otherwordly Patron",
			source : [["SGttEH:J", 7]],
			minlevel : 3,
			description : '\n   Choose an Otherwordly Patron using the "Choose Feature" button above',
			choices : ["the Archfey", "the Fiend", "the Great Old One", "the Undying", "the Celestial", "the Hexblade"],
			"the archfey" : {
				name : "Rite Focus: the Archfey",
				description : desc([
					"When I deal rite damage to a creature, it glows with faint light until my next turn ends",
					"During this time, it can't benefit from half cover, three-quarters cover, or being invisible"
				])
			},
			"the fiend" : {
				name : "Rite Focus: the Fiend",
				description : "\n   When using the rite of the flame, I may reroll a 1 or 2 on the rite damage die once"
			},
			"the great old one" : {
				name : "Rite Focus: the Great Old One",
				description : desc([
					"When I score a critical hit with an active rite weapon, the target must make a Wis save",
					"If the target fails this save, it is frightened of me until the end of my next turn"
				])
			},
			"the undying" : {
				name : "Rite Focus: the Undying",
				description : "\n   When I reduce a hostile creature to 0 HP using an active rite weapon, I heal HP",
				additional : levels.map(function (n) {
					return n < 3 ? "" : "regain " + SGttEHJ_MomentumDie(n) + " HP";
				})
			},
			"the celestial" : {
				name : "Rite Focus: the Celestial",
				description : "\n   As a bonus action, I can expend a blood maledict use to heal a creature I can see in 60 ft",
				additional : levels.map(function (n) {
					return n < 3 ? "" : "heals " + SGttEHJ_MomentumDie(n) + "+Int mod";
				}),
				action : [["bonus action", ""]]
			},
			"the hexblade" : {
				name : "Rite Focus: the Hexblade",
				description : "\n   When I use a blood curse, my next attack adds my Prof Bonus to damage vs. the cursed"
			},
			choiceDependencies : [{
				feature : "subclassfeature7.1"
			}, {
				feature : "subclassfeature15"
			}]
		},
		"subclassfeature3.1" : {
			name : "Pact Magic",
			source : [["SGttEH:J", 6]],
			minlevel : 3,
			description : desc([
				"I can cast warlock cantrips/spells that I know, using Intelligence as my spellcasting ability",
				"I can use a rite-imbued weapon as a spellcasting focus; I regain spell slots on a short rest"
			]),
			additional : levels.map(function (n, idx) {
				var cantr = [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3][idx];
				var splls = [0, 0, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 11][idx];
				return n < 3 ? "" : cantr + " cantrips \u0026 " + splls + " spells known";
			})
		},
		"subclassfeature7" : {
			name : "Mystic Frenzy",
			source : [["SGttEH:J", 7]],
			minlevel : 7,
			description : "\n   When I cast a cantrip as an action, I can make one weapon attack as a bonus action",
			action : [["bonus action", " (with cantrip)"]]
		},
		"subclassfeature7.1" : {
			name : "Revealed Arcana",
			source : [["SGttEH:J", 7]],
			minlevel : 7,
			description : '\n   Choose an Otherwordly Patron using the "Choose Feature" button above',
			usages : 1,
			recovery : "long rest",
			"the archfey" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Blur by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["blur"],
					selection : ["blur"],
					firstCol : "oncelr"
				}
			},
			"the fiend" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Scorching Ray by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["scorching ray"],
					selection : ["scorching ray"],
					firstCol : "oncelr"
				}
			},
			"the great old one" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Detect Thoughts by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["detect thoughts"],
					selection : ["detect thoughts"],
					firstCol : "oncelr"
				}
			},
			"the undying" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Blindness/Deafness by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["blindness/deafness"],
					selection : ["blindness/deafness"],
					firstCol : "oncelr"
				}
			},
			"the celestial" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Lesser Restoration by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["lesser restoration"],
					selection : ["lesser restoration"],
					firstCol : "oncelr"
				}
			},
			"the hexblade" : {
				name : "Revealed Arcana",
				description : "\n   Once per long rest, I can cast Branding Smite by expending a pact magic spell slot",
				spellcastingBonus : {
					name : "Revealed Arcana",
					spells : ["branding smite"],
					selection : ["branding smite"],
					firstCol : "oncelr"
				}
			}
		},
		"subclassfeature11" : {
			name : "Brand of the Sapping Scar",
			source : [["SGttEH:J", 7]],
			minlevel : 11,
			description : "\n   A creature branded by me has disadvantage on their saves against my warlock spells"
		},
		"subclassfeature15" : {
			name : "Unsealed Arcana",
			source : [["SGttEH:J", 7]],
			minlevel : 15,
			description : '\n   Choose an Otherwordly Patron using the "Choose Feature" button above',
			usages : 1,
			recovery : "long rest",
			"the archfey" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Slow without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["slow"],
					selection : ["slow"],
					firstCol : "oncelr"
				}
			},
			"the fiend" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Fireball without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["fireball"],
					selection : ["fireball"],
					firstCol : "oncelr"
				}
			},
			"the great old one" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Haste without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["haste"],
					selection : ["haste"],
					firstCol : "oncelr"
				}
			},
			"the undying" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Bestow Curse without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["bestow curse"],
					selection : ["bestow curse"],
					firstCol : "oncelr"
				}
			},
			"the celestial" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Revivify without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["revivify"],
					selection : ["revivify"],
					firstCol : "oncelr"
				}
			},
			"the hexblade" : {
				name : "Unsealed Arcana",
				description : "\n   Once per long rest, I can cast Blink without expending a spell slot",
				spellcastingBonus : {
					name : "Unsealed Arcana",
					spells : ["blink"],
					selection : ["blink"],
					firstCol : "oncelr"
				}
			},
			"blood curse of the souleater" : {
				name : "Blood Curse of the Souleater",
				extraname : "Order of the Profane Soul 18; Blood Curse",
				source : [["SGttEH:J", 12]],
				description : " [Amplify 1\xD7 per long rest]" + desc([
					"As a reaction when a living creature (not construct/undead) is reduced to 0 HP in 30 ft,",
					"I can use their soul to gain advantage on my weapon attacks until the end of my next turn",
					"\u2022 Amplify (once per long rest): I also regain an expended warlock spell slot"
				]),
				action : [["reaction", ""]],
				extraLimitedFeatures : [{
					name : "Amplify Blood Curse of the Souleater",
					usages : 1,
					recovery : "long rest"
				}]
			},
			autoSelectExtrachoices : [{
				extrachoice : "blood curse of the souleater",
				minlevel : 18
			}]
		}
	}
});

AddSubClass("blood hunter", "mutant", {
	regExpSearch : /^(?=.*blood)(?=.*hunter)(?=.*mutant).*$/i,
	subname : "Order of the Mutant",
	source : [["SGttEH:J", 8]],
	features : {
		"subclassfeature3" : {
			name : "Mutagencraft",
			source : [["SGttEH:J", 8]],
			minlevel : 3,
			description : levels.map(function (n) {
				return n < 3 ? "" : desc([
					"I can craft " + (n < 7 ? 1 : n < 15 ? 2 : 3) + " mutagen" + (n < 7 ? "" : "s") + " during a short/long rest from known formulae, max 1 of a type",
					"When I learn a new formula, I can swap one I know for another; They can only affect me",
					"As a bonus action, I can consume a mutagen; As an action, I can end all mutagens on me",
					"A mutagen and its effects last until I finish my next short or long rest, unless specified"
				]);
			}),
			usages : levels.map(function (n) { return n < 3 ? "" : n < 7 ? 1 : n < 15 ? 2 : 3; }),
			recovery : "short rest",
			action : [
				["bonus action", " (consume Mutagen)"],
				["action", " (end all Mutagens)"]
			],
			additional : levels.map(function (n) { return n < 3 ? "" : (n < 7 ? 4 : n < 11 ? 5 : n < 15 ? 6 : n < 18 ? 7 : 8) + " formulae known"; }),
			extraname : "Mutagen Formula",
			extrachoices : [
				"Aether (prereq: level 11 blood hunter)",
				"Alluring",
				"Celerity",
				"Conversant",
				"Cruelty (prereq: level 11 blood hunter)",
				"Deftness",
				"Embers",
				"Gelid",
				"Impermeable",
				"Mobile",
				"Nighteye",
				"Percipient",
				"Potency",
				"Precision (prereq: level 11 blood hunter)",
				"Rapidity",
				"Reconstruction (prereq: level 7 blood hunter)",
				"Sagacity",
				"Shielded",
				"Unbreakable",
				"Vermillion"
			],
			extraTimes : levels.map(function (n) {
				return n < 3 ? 0 : n < 7 ? 4 : n < 11 ? 5 : n < 15 ? 6 : n < 18 ? 7 : 8;
			}),
			"aether (prereq: level 11 blood hunter)" : {
				name : "Aether",
				source : [["SGttEH:J", 8]],
				description : desc([
					"I gain 20 ft flying speed for 1 hour",
					"\u2022 Side effect: I gain disadvantage on Strength and Dexterity ability checks for 1 hour"
				]),
				prereqeval : function() { return classes.known['blood hunter'].level >= 11 }
			},
			"alluring" : {
				name : "Alluring",
				source : [["SGttEH:J", 8]],
				description : desc([
					"I gain advantage on Charisma ability checks",
					"\u2022 Side effect: I gain disadvantage on Initiative rolls"
				])
			},
			"celerity" : {
				name : "Celerity",
				source : [["SGttEH:J", 8]],
				description : levels.map(function (n) {
					var descr = n < 11 ? "My Dex score and max increase by 3. They increase by 4 at level 11 and by 5 at level 18" : n < 18 ? "My Dexterity score and maximum Dexterity increase by 4. They increase by 5 at level 18" : "My Dexterity score and maximum Dexterity both increase by 5";
					return desc([
						descr,
						"\u2022 Side effect: I gain disadvantage on Wisdom saving throws"
					]);
				})
			},
			"conversant" : {
				name : "Conversant",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain advantage on Intelligence ability checks",
					"\u2022 Side effect: I gain disadvantage on Wisdom ability checks"
				])
			},
			"cruelty (prereq: level 11 blood hunter)" : {
				name : "Cruelty",
				source : [["SGttEH:J", 9]],
				description : desc([
					"As part of an Attack action, I can make a single weapon attack as a bonus action",
					"\u2022 Side effect: I gain disadvantage on Intelligence, Wisdom, and Charisma saving throws"
				]),
				action : [["bonus action", "Cruelty Mutagen (after Attack action)"]],
				prereqeval : function() { return classes.known['blood hunter'].level >= 11 }
			},
			"deftness" : {
				name : "Deftness",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain advantage on Dexterity ability checks",
					"\u2022 Side effect: I gain disadvantage on Wisdom ability checks"
				])
			},
			"embers" : {
				name : "Embers",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain resistance to fire damage",
					"\u2022 Side effect: I gain vulnerability to cold damage"
				])
			},
			"gelid" : {
				name : "Gelid",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain resistance to cold damage",
					"\u2022 Side effect: I gain vulnerability to fire damage"
				])
			},
			"impermeable" : {
				name : "Impermeable",
				source : ["SGttEH:J", 10],
				description : desc([
					"I gain resistance to piercing damage",
					"\u2022 Side effect: I gain vulnerability to slashing damage"
				])
			},
			"mobile" : {
				name : "Mobile",
				source : [["SGttEH:J", 9]],
				description : levels.map(function (n) {
					var descr = n < 11 ? "I gain immunity to the grappled and restrained conditions; At 11th level also paralyzed" : "I gain immunity to the grappled, restrained, and paralyzed conditions";
					return desc([
						descr,
						"\u2022 Side effect: I gain disadvantage on Strength checks"
					]);
				})
			},
			"nighteye" : {
				name : "Nighteye",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain darkvision up to 60 ft, or add an extra 60 ft to it if I already have darkvision",
					"\u2022 Side effect: I gain sunlight sensitivity"
				])
			},
			"percipient" : {
				name : "Percipient",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain advantage on Wisdom ability checks",
					"\u2022 Side effect: I gain disadvantage on Charisma ability checks"
				])
			},
			"potency" : {
				name : "Potency",
				source : [["SGttEH:J", 9]],
				description : levels.map(function (n) {
					var descr = n < 11 ? "My Str score and max increase by 3. They increase by 4 at level 11 and by 5 at level 18" : n < 18 ? "My Strength score and maximum Strength increase by 4. They increase by 5 at level 18" : "My Strength score and maximum Strength both increase by 5";
					return desc([
						descr,
						"\u2022 Side effect: I gain disadvantage on Dexterity saving throws"
					]);
				})
			},
			"precision (prereq: level 11 blood hunter)" : {
				name : "Precision",
				source : [["SGttEH:J", 9]],
				description : desc([
					"My weapon attacks score critical hits on attack rolls of 19 and 20",
					"\u2022 Side effect: I gian disadvantage on Strength saving throws"
				]),
				prereqeval : function() { return classes.known['blood hunter'].level >= 11 }
			},
			"rapidity" : {
				name : "Rapidity",
				source : [["SGttEH:J", 9]],
				description : levels.map(function (n) {
					var descr = n < 15 ? "My speed increases by 10 ft (or by 15 ft at 15th level)" : "My speed increases by 15 ft";
					return desc([
						descr,
						"\u2022 Side effect: I gain disadvantage on Intelligence ability checks"
					]);
				})
			},
			"reconstruction (prereq: level 7 blood hunter)" : {
				name : "Reconstruction",
				source : [["SGttEH:J", 9]],
				description : desc([
					"For an hour, at the start of my turn, I regain hit points equal to my proficiency bonus",
					"This only occurs if I have at least 1 hit point and am below half my hit point maximum",
					"\u2022 Side effect: My speed decreases by 10 ft for an hour"
				]),
				prereqeval : function() { return classes.known['blood hunter'].level >= 7 }
			},
			"sagacity" : {
				name : "Sagacity",
				source : [["SGttEH:J", 9]],
				description : levels.map(function (n) {
					var descr = n < 11 ? "My Int score and max increase by 3. They increase by 4 at level 11 and by 5 at level 18" : n < 18 ? "My Intelligence score and maximum both increase by 4. They increase by 5 at level 18" : "My Intelligence score and maximum Intelligence both increase by 5";
					return desc([
						descr,
						"\u2022 Side effect: I gain disadvantage on Charisma saving throws"
					]);
				})
			},
			"shielded" : {
				name : "Shielded",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain resistance to slashing damage",
					"\u2022 Side effect: I gain vulnerability to bludgeoning damage"
				])
			},
			"unbreakable" : {
				name : "Unbreakable",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain resistance to bludgeoning damage",
					"\u2022 Side effect: I gain vulnerability to piercing damage"
				])
			},
			"vermillion" : {
				name : "Vermillion",
				source : [["SGttEH:J", 9]],
				description : desc([
					"I gain an additional use of blood maledict",
					"\u2022 Side effect: I gain disadvantage on death saving throws"
				])
			}
		},
		"subclassfeature7" : {
			name : "Strange Metabolism",
			source : [["SGttEH:J", 8]],
			minlevel : 7,
			description : desc([
				"I gain immunity to poison damage and the poisoned condition",
				"As a bonus action once per long rest, I can ignore the side effects of a mutagen for 1 min"
			]),
			action : [['bonus action', '']],
			savetxt : { immune : ["poison"] },
			usages : 1,
			recovery : "long rest"
		},
		"subclassfeature11" : {
			name : "Brand of Axiom",
			source : [["SGttEH:J", 8]],
			minlevel : 11,
			description : desc([
				"A branded creature can't benefit from illusion magic to disguise it or make it invisible",
				"Also, if it's polymorphed or has changed shape when branded or tries to do so during,",
				"It must make a Wis save or its form reverts and it's stunned until my next turn ends"
			]),
			"blood curse of corrosion" : {
				name : "Blood Curse of Corrosion",
				extraname : "Order of the Mutant 15; Blood Curse",
				source : [["SGttEH:J", 11]],
				description : desc([
					"As a bonus action, I can have a creature within 30 ft make a Con save or become poisoned",
					"At the end of each if its turns, the creature can make another Con save to end the curse",
					"\u2022 Amplify: The target takes 4d6 necrotic damage, and again each time it fails the Con save"
				]),
				action : [["bonus action", ""]]
			},
			autoSelectExtrachoices : [{
				extrachoice : "blood curse of corrosion",
				minlevel : 15
			}]
		},
		"subclassfeature18" : {
			name : "Exalted Mutation",
			source : [["SGttEH:J", 8]],
			minlevel : 18,
			description : desc([
				"As a bonus action, I can end an active mutagen, then activate a mutagen that I know"
			]),
			action : [['bonus action', ""]],
			usages : "Int mod per ",
			usagescalc : "event.value = Math.max(1, What('Int Mod'));",
			recovery : "long rest"
		}
	}
});

AddSubClass("blood hunter", "lycan", {
	regExpSearch : /^(?=.*blood)(?=.*hunter)(?=.*lycan).*$/i,
	subname : "Order of the Lycan",
	source : [["SGttEH:J", 9]],
	features : {
		"subclassfeature3" : {
			name : "Heightened Senses",
			source : [["SGttEH:J", 10]],
			minlevel : 3,
			description : "\n   I gain advantage on Wisdom (Perception) checks that rely on hearing or smell",
			vision : [["Adv. on Perception relying on hearing or smell", 0]]
		},
		"subclassfeature3.1" : {
			name : "Hybrid Transformation",
			source : [["SGttEH:J", 10]],
			minlevel : 3,
			description : desc([
				"As a bonus action, I can transform into a hybrid lycanthropy form",
				'See the "Notes" page for the full rules of this hybrid form at my current level'
			]),
			usages : levels.map(function(n) { return n < 3 ? "" : n < 11 ? 1 : n < 18 ? 2 : "\u221E\u00D7 per "; }),
			recovery : "short rest",
			action : [["bonus action", " (start/end)"], ["bonus action", "Predatory Strike (with Attack action)"]],
			savetxt : { text : ["Adv. on Str saves in hybrid form"] },
			weaponsAdd : ["Predatory Strike"],
			weaponOptions : [{
				baseWeapon : "unarmed strike",
				regExpSearch : /^(?=.*predatory)(?=.*strike).*$/i,
				name : "Predatory Strike",
				source : [["SGttEH:J", 10]],
				description : "Finesse; Only in hybrid form; If used in Attack action, attack once as bonus action",
				damage : [1, 6, "slashing"],
				isPredatoryStrikes : true
			}],
			calcChanges : {
				atkCalc : [
					function(fields, v, output) {
						if (v.isMeleeWeapon && classes.known['blood hunter'] && classes.known['blood hunter'].level && ((/\b(lycan|hybrid)\b/i).test(v.WeaponTextName) || v.theWea.isPredatoryStrikes)) {
							var lvl = classes.known['blood hunter'].level;
							output.extraDmg += lvl < 3 ? 0 : lvl < 11 ? 1 : lvl < 18 ? 2 : 3;
						}
					},
					"If I include the word 'Lycan' or 'Hybrid' in a melee weapon's name, the calculation will add +1 to damage rolls. This bonus increases to +2 at 11th level and +3 at 18th level in the blood hunter class"
				]
			},
			changeeval : function(v) {
				ClassList["blood hunter"].updateHybridForm(v[0], v[1]);
			}
		},
		"subclassfeature7" : {
			name : "Stalker's Prowess",
			source : [["SGttEH:J", 11]],
			minlevel : 7,
			description : desc([
				"I gain +10 ft speed; I add +10 ft to my long jump and +3 ft to my high jump distance",
				'In my hybrid form, I gain the Improved Predatory Strikes feature, see "Notes" page'
			]),
			speed : { allModes : "+10" },
			calcChanges : {
				atkCalc : [
					function(fields, v, output) {
						if (v.theWea.isPredatoryStrikes && classes.known['blood hunter'] && classes.known['blood hunter'].level) {
							var lvl = classes.known['blood hunter'].level;
							output.extraHit += lvl < 7 ? 0 : lvl < 11 ? 1 : lvl < 18 ? 2 : 3;
						}
					},
					"I get +1 to attack rolls for my predatory strikes at level 7. This bonus increases to +2 at 11th level and +3 at 18th level in the blood hunter class"
				],
				atkAdd : [
					function(fields, v) {
						if (v.theWea.isPredatoryStrikes && classes.known['blood hunter'] && classes.known['blood hunter'].level && classes.known['blood hunter'].level >= 7) {
							fields.Description += (fields.Description ? '; ' : '') + 'Counts as magical if a rite is active';
						}
					},
					"My predatory strike attacks count as magical when I have a Crimson rite active"
				]
			}
		},
		"subclassfeature11" : {
			name : "Advanced Transformation",
			source : [["SGttEH:J", 11]],
			minlevel : 11,
			description : '\n   In my hybrid form, I gain the Lycan Regeneration feature, see "Notes" page',
			calcChanges : {
				atkCalc : [
					function(fields, v, output) {
						if (v.theWea.isPredatoryStrikes && classes.known['blood hunter'] && classes.known['blood hunter'].level && classes.known['blood hunter'].level >= 11) {
							try {
								var curDie = eval_ish(fields.Damage_Die.replace('d', '*'));
							} catch (e) {
								var curDie = 'x';
							};
							if (isNaN(curDie) || curDie < 8) {
								output.die = '1d8';
							};
						}
					},
					"My predatory strikes damage increases from 1d6 to 1d8 at 11th level"
				]
			}
		},
		"subclassfeature15" : {
			name : "Brand of the Voracious",
			source : [["SGttEH:J", 11]],
			minlevel : 15,
			description : desc([
				"I have advantage on my Wisdom saves to maintain control of blood lust in hybrid form",
				"While in hybrid form, I have advantage on attacks against a creature branded by me"
			]),
			savetxt : { text : ["Adv. on Wis saves to control blood lust"] },
			"blood curse of the howl" : {
				source : [["SGttEH:J", 12]],
				name : "Blood Curse of the Howl",
				extraname : "Order of the Lycan 18; Blood Curse",
				description : desc([
					"As an action, creatures of my choice in 30 ft that can hear me howl must make a Wis save",
					"If failed, they're frightened of me (stunned if failed by 5 or more), until my next turn ends",
					"If successful, they're immune to this blood curse for the next 24 hours",
					"\u2022 Amplify: The range of the curse increases to 60 ft"
				]),
				action : [["action", ""]]
			},
			autoSelectExtrachoices : [{
				extrachoice : "blood curse of the howl",
				minlevel : 18
			}]
		}
	}
});