"use strict";
// Go to bottom of the file to see the main function that runs the simulation.
Object.defineProperty(exports, "__esModule", { value: true });
var bja_game_rules_1 = require("./bja_game_rules");
var PlayingCard = /** @class */ (function () {
    function PlayingCard(rank) {
        this.rank = rank;
        this.rank = rank;
    }
    PlayingCard.prototype.value = function () {
        if (["J", "Q", "K"].includes(this.rank)) {
            return 10;
        }
        else if (this.rank === "A") {
            return 11;
        }
        else {
            return parseInt(this.rank, 10);
        }
    };
    return PlayingCard;
}());
var Hand = /** @class */ (function () {
    function Hand(dealer, cardOne, cardTwo, bet) {
        this.dealer = dealer;
        this.cardOne = cardOne;
        this.cardTwo = cardTwo;
        this.bet = bet;
        this.doubledDown = false;
        this.card_one = cardOne;
        this.card_two = cardTwo;
        this.is_dealer = dealer;
        this.hand_cards = [this.card_one, this.card_two];
        this.handSplited = 0;
        this.handBet = bet;
        this.handValue = this.card_one.value() + this.card_two.value();
        var aceCount = this.hand_cards.filter(function (card) { return card.rank === "A"; }).length;
        while (this.handValue > 21 && aceCount > 0) {
            this.handValue -= 10;
            aceCount--;
        }
    }
    Hand.prototype.isSoft = function () {
        var aceCount = this.hand_cards.filter(function (card) { return card.rank === "A"; }).length;
        return aceCount > 0 && this.handValue <= 21;
    };
    Hand.prototype.canSplit = function () {
        return (this.hand_cards.length === 2 &&
            this.hand_cards[0].rank === this.hand_cards[1].rank);
    };
    Hand.prototype.hitCard = function (card) {
        this.hand_cards.push(card);
        this.handValue += card.value();
        if (this.handValue > 21) {
            if (this.hand_cards.some(function (card) { return card.rank === "A"; })) {
                this.handValue -= 10;
            }
        }
    };
    return Hand;
}());
var Shoe = /** @class */ (function () {
    function Shoe(numDecks, penetration, dealerHitsSoft17, maxSplits, doubleAfterSplit, blackjackPayout, initialMoney) {
        this.numDecks = numDecks;
        this.penetration = penetration;
        this.dealerHitsSoft17 = dealerHitsSoft17;
        this.maxSplits = maxSplits;
        this.doubleAfterSplit = doubleAfterSplit;
        this.blackjackPayout = blackjackPayout;
        this.initialMoney = initialMoney;
        this.cards = [];
        this.running_count = 0;
        this.handsPlayedinShoe = 0;
        this.createShoe();
        this.shuffle();
        this.penetration = penetration;
        console.log("I Worked: shoe constructor"); // debug
    }
    Shoe.prototype.startShoe = function () {
        while (this.cards.length / (this.numDecks * 52) > this.penetration) {
            console.log("I Worked: playhand called"); // debug
            this.playHand();
        }
    };
    Shoe.prototype.trueCount = function () {
        return ((Math.round(this.running_count / (this.cards.length / 52)) * Math.pow(10, 14)) /
            Math.pow(10, 14));
    };
    Shoe.prototype.createShoe = function () {
        var ranks = [
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
            "A",
        ];
        for (var i = 0; i < this.numDecks; i++) {
            for (var _i = 0, ranks_1 = ranks; _i < ranks_1.length; _i++) {
                var rank = ranks_1[_i];
                for (var i_1 = 0; i_1 < 4; i_1++) {
                    this.cards.push(new PlayingCard(rank));
                }
            }
        }
    };
    // shuffle() {
    //   this.running_count = 0;
    //   let copy: PlayingCard[] = [],
    //     n: number = this.cards.length,
    //     i: number;
    //   while (n) {
    //     // Pick a remaining element…
    //     i = Math.floor(Math.random() * n--);
    //     // And move it to thr new array. so its not picked again.
    //     copy.push(this.cards.splice(i, 1)[0]);
    //   }
    //   this.cards = copy;
    // }
    Shoe.prototype.shuffle = function () {
        var _a;
        this.running_count = 0;
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [this.cards[j], this.cards[i]], this.cards[i] = _a[0], this.cards[j] = _a[1];
        }
    };
    Shoe.prototype.dealCard = function () {
        var dealed_card = this.cards.pop();
        if (dealed_card.value() <= 6) {
            this.running_count++;
        }
        else if (dealed_card.value() >= 10) {
            this.running_count--;
        }
        return dealed_card;
    };
    Shoe.prototype.remainingCards = function () {
        return this.cards.length;
    };
    Shoe.prototype.playHand = function () {
        // Implement the logic to play a single hand
        console.log("==============================hand"); // debug
        var opening_cards = [
            this.dealCard(),
            this.dealCard(),
            this.dealCard(),
            this.dealCard(),
        ];
        var player_hand = new Hand(false, opening_cards[0], opening_cards[2], this.bettingRamp(this.trueCount())); //dealing cards like the real way, have no idea if it changes anythink :D, prob no in long run i guess
        var dealer_hand = new Hand(true, opening_cards[1], opening_cards[3], this.bettingRamp(this.trueCount()));
        //dealer hand:
        var dealer_hand_value = this.dealerHandAlgorithm(dealer_hand);
        //players hand:
        this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
        this.handsPlayedinShoe++;
    };
    Shoe.prototype.dealerHandAlgorithm = function (dealer_hand) {
        console.log("I Worked: dealer algorithm called"); // debug
        if (!dealer_hand.isSoft()) {
            while (dealer_hand.handValue < 17) {
                dealer_hand.hitCard(this.dealCard());
            }
            return dealer_hand.handValue;
        }
        else {
            if (this.dealerHitsSoft17) {
                while (dealer_hand.handValue <= 17) {
                    dealer_hand.hitCard(this.dealCard());
                }
                return dealer_hand.handValue;
            }
            else {
                while (dealer_hand.handValue < 17) {
                    dealer_hand.hitCard(this.dealCard());
                }
                return dealer_hand.handValue;
            }
        }
    };
    Shoe.prototype.playerHandAlgorithm = function (player_hand, dealer_hand, dealer_hand_value) {
        var strategyCode = this.basicStrategy(player_hand, dealer_hand);
        var action = this.codeConverter(strategyCode);
        console.log("I Worked: player algorithm"); // debug
        // debug trueC
        console.log("-Hands played: " +
            this.handsPlayedinShoe +
            " action: " +
            action +
            " trueC: " +
            this.trueCount()); //just to see if the loop works delete it later
        if (action === "Y" && player_hand.handSplited <= this.maxSplits) {
            var new_hand1 = new Hand(false, player_hand.hand_cards[0], this.dealCard(), this.bettingRamp(this.trueCount()));
            var new_hand2 = new Hand(false, player_hand.hand_cards[1], this.dealCard(), this.bettingRamp(this.trueCount()));
            new_hand1.handValue = player_hand.hand_cards[0].value();
            new_hand2.handValue = player_hand.hand_cards[1].value();
            this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
            this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);
            console.log("split"); // debug
        }
        else if (action === "B" &&
            player_hand.handSplited <= this.maxSplits &&
            this.doubleAfterSplit &&
            !player_hand.doubledDown) {
            var new_hand1 = new Hand(false, player_hand.hand_cards[0], this.dealCard(), this.bettingRamp(this.trueCount() * 2));
            var new_hand2 = new Hand(false, player_hand.hand_cards[1], this.dealCard(), this.bettingRamp(this.trueCount() * 2));
            new_hand1.handValue = player_hand.hand_cards[0].value();
            new_hand2.handValue = player_hand.hand_cards[1].value();
            new_hand1.doubledDown = true;
            new_hand2.doubledDown = true;
            this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
            this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);
            console.log("double after split");
        }
        else if (action === "D") {
            if (!player_hand.doubledDown) {
                player_hand.hitCard(this.dealCard());
                player_hand.handBet *= 2;
                player_hand.doubledDown = true;
                this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
            }
            else {
                player_hand.hitCard(this.dealCard());
                this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
            }
        }
        else if (action === "M" && !player_hand.doubledDown) {
            player_hand.hitCard(this.dealCard());
            player_hand.handBet *= 2;
            player_hand.doubledDown = true;
            this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
        }
        else if (action === "H") {
            player_hand.hitCard(this.dealCard());
            this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
        }
        else {
            if (player_hand.handValue === 21) {
                //player blackjack
                console.log("player blackjack");
            }
            if (dealer_hand_value === 21) {
                //dealer blackjack
                console.log("dealer blackjack");
            }
            if (player_hand.handValue > 21) {
                //player bust
                //dealer wins
                console.log("player bust");
                console.log("dealer wins");
                return;
            }
            else if (dealer_hand_value > 21) {
                //dealer bust
                //player wins
                console.log("dealer bust");
                console.log("player wins");
                return;
            }
            else if (player_hand.handValue > dealer_hand_value) {
                //player wins
                console.log("player wins");
                return;
            }
            else if (player_hand.handValue < dealer_hand_value) {
                //dealer wins
                console.log("dealer wins");
                return;
            }
            else {
                //stand off
                console.log("stand off");
                return;
            }
        }
    };
    Shoe.prototype.bettingRamp = function (true_count) {
        var bettingRatio = bja_game_rules_1.GameRules.bettingRatio;
        var betingMultiplier = 1 / 3; //CUSTOMIZABLE
        var bettingArray = bettingRatio.map(function (x) { return x * betingMultiplier; });
        var revindCount = 1; //CUSTOMIZABLE
        var roundedCount = Math.round(true_count * 10);
        if (roundedCount <= 0) {
            return bettingArray[0];
        }
        else if (roundedCount >= 100) {
            return bettingArray[19];
        }
        else {
            return bettingArray[Math.round(roundedCount * 5) - revindCount];
        }
    };
    Shoe.prototype.codeConverter = function (code) {
        console.log(code);
        if (code.length === 1) {
            return code;
        }
        else {
            var countNuber = parseInt(code.slice(0, 2));
            var highLow = code.slice(2, 3);
            var firstStrategy = code.slice(3, 4);
            var secondStrategy = code.slice(4, 5);
            if (highLow === "+" && this.trueCount() > countNuber) {
                return secondStrategy;
            }
            else if (highLow === "-" && this.trueCount() < countNuber) {
                return secondStrategy;
            }
            else {
                return firstStrategy;
            }
        }
    };
    Shoe.prototype.basicStrategy = function (player_hand, dealer_hand) {
        var softTypeTest;
        if (player_hand.isSoft()) {
            softTypeTest = "S";
        }
        else {
            softTypeTest = "H";
        }
        // debug
        console.log("BASIC STRATEGY CALLED: playerhand:" +
            softTypeTest +
            player_hand.handValue +
            " dealer cards: " +
            dealer_hand.hand_cards[0].value() +
            " " +
            dealer_hand.hand_cards[1].value());
        if (player_hand.canSplit() === true) {
            console.log("can split");
            var splitCode = bja_game_rules_1.GameRules.pair_chart[(22 - player_hand.handValue) / 2][dealer_hand.hand_cards[0].value() - 2];
            if (splitCode !== "N") {
                return splitCode;
            }
            else {
                if (!player_hand.isSoft()) {
                    console.log("hard hand");
                    if (player_hand.handValue >= 17) {
                        return "S";
                    }
                    else if (player_hand.handValue < 8) {
                        return "H";
                    }
                    else {
                        return bja_game_rules_1.GameRules.hard_chart[16 - player_hand.handValue][dealer_hand.hand_cards[0].value() - 2];
                    }
                }
                else if (dealer_hand.isSoft()) {
                    console.log("soft hand");
                    if (player_hand.handValue >= 10) {
                        return "S";
                    }
                    else if (player_hand.handValue < 3) {
                        return "H";
                    }
                    else {
                        return bja_game_rules_1.GameRules.soft_chart[9 - player_hand.handValue][dealer_hand.hand_cards[0].value() - 2];
                    }
                }
                else {
                    console.log("somethink might went wrong in fisrt basicStrategy() section"); //hope it wont :D
                    console.log("----------Error-----------");
                    console.log(player_hand, dealer_hand);
                    console.log("----------Error-----------");
                    return "Error"; // debug
                }
            }
        }
        else {
            if (!player_hand.isSoft()) {
                console.log("hard hand");
                if (player_hand.handValue >= 17) {
                    return "S";
                }
                else if (player_hand.handValue < 8) {
                    return "H";
                }
                else {
                    return bja_game_rules_1.GameRules.hard_chart[16 - player_hand.handValue][dealer_hand.hand_cards[0].value() - 2];
                }
            }
            else if (dealer_hand.isSoft()) {
                console.log('heree');
                console.log("soft hand");
                if (player_hand.handValue >= 10) {
                    return "S";
                }
                else if (player_hand.handValue < 3) {
                    return "H";
                }
                else {
                    return bja_game_rules_1.GameRules.soft_chart[9 - player_hand.handValue][dealer_hand.hand_cards[0].value() - 2];
                }
            }
            else {
                console.log("somethink might went wrong in second basicStrategy() section"); //hope it wont :D
                console.log("----------Error-----------");
                console.log(player_hand.isSoft());
                console.log(player_hand, dealer_hand);
                console.log("----------Error-----------");
                return "Error"; // debug
            }
        }
        return "basicStr";
    };
    return Shoe;
}());
var BlackjackSimulation = /** @class */ (function () {
    function BlackjackSimulation(numDecks, penetration, dealerHitsSoft17, maxSplits, doubleAfterSplit, blackjackPayout, initialMoney) {
        this.numDecks = numDecks;
        this.penetration = penetration;
        this.dealerHitsSoft17 = dealerHitsSoft17;
        this.maxSplits = maxSplits;
        this.doubleAfterSplit = doubleAfterSplit;
        this.blackjackPayout = blackjackPayout;
        this.initialMoney = initialMoney;
        this.statistics = {
            shoesPlayed: 0,
            handsPlayed: 0,
            dealerWins: 0,
            playerWins: 0,
            standOffs: 0,
            dealerBlackjacks: 0,
            playerBlackjacks: 0,
            dealerBusts: 0,
            playerBusts: 0,
            initialMoney: 0,
            endMoney: 0,
            totalBet: 0,
            avarageBet: 0,
            largestBet: 0,
            amountWonLost: 0,
        };
        this.statistics.initialMoney = initialMoney;
        this.statistics.endMoney = initialMoney;
    }
    BlackjackSimulation.prototype.setStatistics = function (player_hand, dealer_hand, player_won, player_blackjack, player_bust, dealer_bust, hand_bet, true_count_of_bet) {
        this.statistics.handsPlayed++;
        this.statistics.totalBet += player_hand.handBet;
        if (player_won) {
            this.statistics.playerWins++;
            if (player_blackjack) {
                this.statistics.playerBlackjacks++;
            }
        }
        else if (player_bust) {
            this.statistics.playerBusts++;
        }
        if (dealer_bust) {
            this.statistics.dealerBusts++;
        }
    };
    BlackjackSimulation.prototype.simulate = function (numShoes) {
        for (var i = 0; i < numShoes; i++) {
            var shoe = new Shoe(this.numDecks, this.penetration, this.dealerHitsSoft17, this.maxSplits, this.doubleAfterSplit, this.blackjackPayout, this.initialMoney);
            shoe.startShoe();
            this.statistics.shoesPlayed++;
        }
        // this.outputStatistics();
    };
    BlackjackSimulation.prototype.outputStatistics = function () {
        console.log("Shoes Played: ".concat(this.statistics.shoesPlayed));
        console.log("Hands Played: ".concat(this.statistics.handsPlayed));
        console.log("Dealer Wins: ".concat(this.statistics.dealerWins, " (").concat(((this.statistics.dealerWins / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Player Wins: ".concat(this.statistics.playerWins, " (").concat(((this.statistics.playerWins / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Stand Offs: ".concat(this.statistics.standOffs, " (").concat(((this.statistics.standOffs / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Dealer Blackjacks: ".concat(this.statistics.dealerBlackjacks, " (").concat(((this.statistics.dealerBlackjacks / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Player Blackjacks: ".concat(this.statistics.playerBlackjacks, " (").concat(((this.statistics.playerBlackjacks / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Dealer Busts: ".concat(this.statistics.dealerBusts, " (").concat(((this.statistics.dealerBusts / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Player Busts: ".concat(this.statistics.playerBusts, " (").concat(((this.statistics.playerBusts / this.statistics.handsPlayed) *
            100).toFixed(2), "%)"));
        console.log("Initial Money: ".concat(this.statistics.initialMoney));
        console.log("End Money: ".concat(this.statistics.endMoney));
        console.log("Average Bet per Hand: ".concat((this.statistics.totalBet / this.statistics.handsPlayed).toFixed(2)));
        console.log("Largest Bet in a Hand: ".concat(this.statistics.largestBet));
        console.log("Amount Won/Lost: ".concat(this.statistics.amountWonLost));
        console.log("Average Won/Lost per 100 Hands: ".concat(((this.statistics.amountWonLost / this.statistics.handsPlayed) *
            100).toFixed(2)));
    };
    return BlackjackSimulation;
}());
//THIS CODE GATHERS THE BASIC CUSTOMIZATIONS FROM THE bja_game_rules.ts (GameRules class) FILE. REQUIRES THE FILE TO BE IN THE SAME DIRECTORY!
//There are additional numerical customizations that can be made in the code itself.
//The code is not designed to play blackjack, it is designed to simulate the game and gather statistics.
//Developer would love to hear feedback, and is completely open to any suggestions or improvements.
var howManyShoesWillBePlayed = 10;
var simulation = new BlackjackSimulation(2, // numDecks
0.75, // penetration
true, // dealerHitsSoft17
3, // maxSplits
true, // doubleAfterSplit
1.5, // blackjackPayout
100000 // initialMoney
);
simulation.simulate(howManyShoesWillBePlayed);
