// Go to bottom of the file to see the main function that runs the simulation.

import { GameRules } from "./bja_game_rules";

type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

class PlayingCard {
  constructor(public rank: Rank) {
    this.rank = rank;
  }

  public value(): number {
    if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    } else if (this.rank === "A") {
      return 11;
    } else {
      return parseInt(this.rank, 10);
    }
  }
}

class Hand {
  public hand_cards: PlayingCard[];
  public readonly is_dealer: boolean;
  public handSplited: number;
  public doubledDown: boolean = false;
  public handValue: number;
  public handBet: number;
  private card_one: PlayingCard;
  private card_two: PlayingCard;

  constructor(
    private dealer: boolean,
    private cardOne: PlayingCard,
    private cardTwo: PlayingCard,
    private bet: number
  ) {
    this.card_one = cardOne;
    this.card_two = cardTwo;
    this.is_dealer = dealer;
    this.hand_cards = [this.card_one, this.card_two];
    this.handSplited = 0;
    this.handBet = bet;

    this.handValue = this.card_one.value() + this.card_two.value();

    let aceCount = this.hand_cards.filter((card) => card.rank === "A").length;
    while (this.handValue > 21 && aceCount > 0) {
      this.handValue -= 10;
      aceCount--;
    }
  }

  public isSoft(): boolean {
    if (this.handValue > 21) {
      return false;
    } else {
      if (this.hand_cards[0].rank === "A" || this.hand_cards[1].rank === "A") {
        return true;
      } else {
        return false;
      }
    }
  }

  public canSplit(): boolean {
    return (
      this.hand_cards.length === 2 &&
      this.hand_cards[0].rank === this.hand_cards[1].rank
    );
  }

  public hitCard(card: PlayingCard) {
    this.hand_cards.push(card);
    this.handValue += card.value();

    if (this.handValue > 21) {
      if (this.hand_cards.some((card) => card.rank === "A")) {
        this.handValue -= 10;
      }
    }
  }
}

class Shoe {
  private cards: PlayingCard[] = [];

  private running_count: number = 0;

  private handsPlayedinShoe: number = 0;

  constructor(
    private numDecks: number,
    private penetration: number,
    private dealerHitsSoft17: boolean,
    private maxSplits: number,
    private doubleAfterSplit: boolean,
    private blackjackPayout: number,
    private initialMoney: number
  ) {
    this.createShoe();
    this.shuffle();

    this.penetration = penetration;

    console.log("I Worked: shoe constructor"); // debug
  }

  public startShoe() {
    while (this.cards.length / (this.numDecks * 52) > this.penetration) {
      console.log("I Worked: playhand called"); // debug
      this.playHand();
    }
  }

  private trueCount(): number {
    return (
      (Math.round(this.running_count / (this.cards.length / 52)) * 10 ** 14) /
      10 ** 14
    );
  }

  private createShoe() {
    const ranks: Rank[] = [
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

    for (let i = 0; i < this.numDecks; i++) {
      for (const rank of ranks) {
        for (let i = 0; i < 4; i++) {
          this.cards.push(new PlayingCard(rank));
        }
      }
    }
  }

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

  shuffle() {
    this.running_count = 0;

    for (let i = this.cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  dealCard(): PlayingCard {
    let dealed_card = this.cards.pop()!;

    if (dealed_card.value() <= 6) {
      this.running_count++;
    } else if (dealed_card.value() >= 10) {
      this.running_count--;
    }

    return dealed_card;
  }

  remainingCards(): number {
    return this.cards.length;
  }

  private playHand() {
    // Implement the logic to play a single hand
    console.log("==============================hand"); // debug

    let opening_cards: PlayingCard[] = [
      this.dealCard(),
      this.dealCard(),
      this.dealCard(),
      this.dealCard(),
    ];

    let player_hand: Hand = new Hand(
      false,
      opening_cards[0],
      opening_cards[2],
      this.bettingRamp(this.trueCount())
    ); //dealing cards like the real way, have no idea if it changes anythink :D, prob no in long run i guess
    let dealer_hand: Hand = new Hand(
      true,
      opening_cards[1],
      opening_cards[3],
      this.bettingRamp(this.trueCount())
    );

    //dealer hand:
    let dealer_hand_value = this.dealerHandAlgorithm(dealer_hand);

    //players hand:
    this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);

    this.handsPlayedinShoe++;
  }

  private dealerHandAlgorithm(dealer_hand: Hand): number {
    console.log("I Worked: dealer algorithm called"); // debug
    if (!dealer_hand.isSoft()) {
      while (dealer_hand.handValue < 17) {
        dealer_hand.hitCard(this.dealCard());
      }
      return dealer_hand.handValue;
    } else {
      if (this.dealerHitsSoft17) {
        while (dealer_hand.handValue <= 17) {
          dealer_hand.hitCard(this.dealCard());
        }
        return dealer_hand.handValue;
      } else {
        while (dealer_hand.handValue < 17) {
          dealer_hand.hitCard(this.dealCard());
        }
        return dealer_hand.handValue;
      }
    }
  }

  private playerHandAlgorithm(
    player_hand: Hand,
    dealer_hand: Hand,
    dealer_hand_value: number
  ) {
    let strategyCode = this.basicStrategy(player_hand, dealer_hand);
    let action = this.codeConverter(strategyCode);

    console.log("I Worked: player algorithm"); // debug

    // debug trueC
    console.log(
      "-Hands played: " +
        this.handsPlayedinShoe +
        " action: " +
        action +
        " trueC: " +
        this.trueCount()
    ); //just to see if the loop works delete it later

    if (action === "Y" && player_hand.handSplited <= this.maxSplits) {
      let new_hand1 = new Hand(
        false,
        player_hand.hand_cards[0],
        this.dealCard(),
        this.bettingRamp(this.trueCount())
      );
      let new_hand2 = new Hand(
        false,
        player_hand.hand_cards[1],
        this.dealCard(),
        this.bettingRamp(this.trueCount())
      );

      new_hand1.handValue = player_hand.hand_cards[0].value();
      new_hand2.handValue = player_hand.hand_cards[1].value();

      this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
      this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);

      console.log("split"); // debug
    } else if (
      action === "B" &&
      player_hand.handSplited <= this.maxSplits &&
      this.doubleAfterSplit &&
      !player_hand.doubledDown
    ) {
      let new_hand1 = new Hand(
        false,
        player_hand.hand_cards[0],
        this.dealCard(),
        this.bettingRamp(this.trueCount() * 2)
      );
      let new_hand2 = new Hand(
        false,
        player_hand.hand_cards[1],
        this.dealCard(),
        this.bettingRamp(this.trueCount() * 2)
      );

      new_hand1.handValue = player_hand.hand_cards[0].value();
      new_hand2.handValue = player_hand.hand_cards[1].value();

      new_hand1.doubledDown = true;
      new_hand2.doubledDown = true;

      this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
      this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);
      console.log("double after split");
    } else if (action === "D") {
      if (!player_hand.doubledDown) {
        player_hand.hitCard(this.dealCard());
        player_hand.handBet *= 2;
        player_hand.doubledDown = true;
        this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
      } else {
        player_hand.hitCard(this.dealCard());
        this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
      }
    } else if (action === "M" && !player_hand.doubledDown) {
      player_hand.hitCard(this.dealCard());
      player_hand.handBet *= 2;
      player_hand.doubledDown = true;
      this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
    } else if (action === "H") {
      player_hand.hitCard(this.dealCard());
      this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
    } else {
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
      } else if (dealer_hand_value > 21) {
        //dealer bust
        //player wins
        console.log("dealer bust");
        console.log("player wins");
        return;
      } else if (player_hand.handValue > dealer_hand_value) {
        //player wins
        console.log("player wins");
        return;
      } else if (player_hand.handValue < dealer_hand_value) {
        //dealer wins
        console.log("dealer wins");
        return;
      } else {
        //stand off
        console.log("stand off");
        return;
      }
    }
  }

  private bettingRamp(true_count: number): number {
    const bettingRatio = GameRules.bettingRatio;
    const betingMultiplier = 1 / 3; //CUSTOMIZABLE
    const bettingArray = bettingRatio.map((x) => x * betingMultiplier);

    const revindCount = 1; //CUSTOMIZABLE

    const roundedCount = Math.round(true_count * 10);

    if (roundedCount <= 0) {
      return bettingArray[0];
    } else if (roundedCount >= 100) {
      return bettingArray[19];
    } else {
      return bettingArray[Math.round(roundedCount * 5) - revindCount];
    }
  }

  private codeConverter(code: string): string {
    console.log(code);

    if (code.length === 1) {
      return code;
    } else {
      let countNuber = parseInt(code.slice(0, 2));
      let highLow = code.slice(2, 3);
      let firstStrategy = code.slice(3, 4);
      let secondStrategy = code.slice(4, 5);

      if (highLow === "+" && this.trueCount() > countNuber) {
        return secondStrategy;
      } else if (highLow === "-" && this.trueCount() < countNuber) {
        return secondStrategy;
      } else {
        return firstStrategy;
      }
    }
  }
  private basicStrategy(player_hand: Hand, dealer_hand: Hand): string {
    let softTypeTest;
    if (player_hand.isSoft()) {
      softTypeTest = "S";
    } else {
      softTypeTest = "H";
    }

    // debug
    console.log(
      "BASIC STRATEGY CALLED: playerhand:" +
        softTypeTest +
        player_hand.handValue +
        " dealer cards: " +
        dealer_hand.hand_cards[0].value() +
        " " +
        dealer_hand.hand_cards[1].value()
    );
    if (player_hand.canSplit() === true) {
      console.log("can split");
      let splitCode: string =
        GameRules.pair_chart[(22 - player_hand.handValue) / 2][
          dealer_hand.hand_cards[0].value() - 2
        ];

      if (splitCode !== "N") {
        return splitCode;
      } else {
        if (!player_hand.isSoft()) {
          console.log("hard hand");
          if (player_hand.handValue >= 17) {
            return "S";
          } else if (player_hand.handValue < 8) {
            return "H";
          } else {
            return GameRules.hard_chart[16 - player_hand.handValue][
              dealer_hand.hand_cards[0].value() - 2
            ];
          }
        } else if (dealer_hand.isSoft()) {
          console.log("soft hand");
          if (player_hand.handValue >= 10) {
            return "S";
          } else if (player_hand.handValue < 3) {
            return "H";
          } else {
            return GameRules.soft_chart[9 - player_hand.handValue][
              dealer_hand.hand_cards[0].value() - 2
            ];
          }
        } else {
          console.log("somethink might went wrong in basicStrategy() section"); //hope it wont :D
          console.log("----------Error-----------");
          console.log(player_hand, dealer_hand);
          console.log("----------Error-----------");

          return "Error"; // debug
        }
      }
    }
    return "BASIC STRATEGY SECTION COULD CATCH ANY IF STATEMENTS"; // Default return statement
  }
}

class BlackjackSimulation {
  private statistics: {
    shoesPlayed: number;
    handsPlayed: number;
    dealerWins: number;
    playerWins: number;
    standOffs: number;
    dealerBlackjacks: number;
    playerBlackjacks: number;
    dealerBusts: number;
    playerBusts: number;
    initialMoney: number;
    endMoney: number;
    totalBet: number;
    avarageBet: number;
    largestBet: number;
    amountWonLost: number;
  } = {
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

  constructor(
    private numDecks: number,
    private penetration: number,
    private dealerHitsSoft17: boolean,
    private maxSplits: number,
    private doubleAfterSplit: boolean,
    private blackjackPayout: number,
    private initialMoney: number
  ) {
    this.statistics.initialMoney = initialMoney;
    this.statistics.endMoney = initialMoney;
  }

  public setStatistics(
    player_hand: Hand,
    dealer_hand: Hand,
    player_won: boolean,
    player_blackjack: boolean,
    player_bust: boolean,
    dealer_bust: boolean,
    hand_bet: number,
    true_count_of_bet: number
  ) {
    this.statistics.handsPlayed++;
    this.statistics.totalBet += player_hand.handBet;

    if (player_won) {
      this.statistics.playerWins++;
      if (player_blackjack) {
        this.statistics.playerBlackjacks++;
      }
    } else if (player_bust) {
      this.statistics.playerBusts++;
    }

    if (dealer_bust) {
      this.statistics.dealerBusts++;
    }
  }

  public simulate(numShoes: number) {
    for (let i = 0; i < numShoes; i++) {
      let shoe = new Shoe(
        this.numDecks,
        this.penetration,
        this.dealerHitsSoft17,
        this.maxSplits,
        this.doubleAfterSplit,
        this.blackjackPayout,
        this.initialMoney
      );

      shoe.startShoe();

      this.statistics.shoesPlayed++;
    }
    // this.outputStatistics();
  }

  private outputStatistics() {
    console.log(`Shoes Played: ${this.statistics.shoesPlayed}`);
    console.log(`Hands Played: ${this.statistics.handsPlayed}`);
    console.log(
      `Dealer Wins: ${this.statistics.dealerWins} (${(
        (this.statistics.dealerWins / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Player Wins: ${this.statistics.playerWins} (${(
        (this.statistics.playerWins / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Stand Offs: ${this.statistics.standOffs} (${(
        (this.statistics.standOffs / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Dealer Blackjacks: ${this.statistics.dealerBlackjacks} (${(
        (this.statistics.dealerBlackjacks / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Player Blackjacks: ${this.statistics.playerBlackjacks} (${(
        (this.statistics.playerBlackjacks / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Dealer Busts: ${this.statistics.dealerBusts} (${(
        (this.statistics.dealerBusts / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Player Busts: ${this.statistics.playerBusts} (${(
        (this.statistics.playerBusts / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}%)`
    );
    console.log(`Initial Money: ${this.statistics.initialMoney}`);
    console.log(`End Money: ${this.statistics.endMoney}`);
    console.log(
      `Average Bet per Hand: ${(
        this.statistics.totalBet / this.statistics.handsPlayed
      ).toFixed(2)}`
    );
    console.log(`Largest Bet in a Hand: ${this.statistics.largestBet}`);
    console.log(`Amount Won/Lost: ${this.statistics.amountWonLost}`);
    console.log(
      `Average Won/Lost per 100 Hands: ${(
        (this.statistics.amountWonLost / this.statistics.handsPlayed) *
        100
      ).toFixed(2)}`
    );
  }
}

//THIS CODE GATHERS THE BASIC CUSTOMIZATIONS FROM THE bja_game_rules.ts (GameRules class) FILE. REQUIRES THE FILE TO BE IN THE SAME DIRECTORY!
//There are additional numerical customizations that can be made in the code itself.

//The code is not designed to play blackjack, it is designed to simulate the game and gather statistics.
//Developer would love to hear feedback, and is completely open to any suggestions or improvements.

const howManyShoesWillBePlayed: number = 10;

const simulation = new BlackjackSimulation(
  2, // numDecks
  0.75, // penetration
  true, // dealerHitsSoft17
  3, // maxSplits
  true, // doubleAfterSplit
  1.5, // blackjackPayout
  100000 // initialMoney
);

simulation.simulate(howManyShoesWillBePlayed);
