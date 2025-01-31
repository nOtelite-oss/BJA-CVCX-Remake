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
  constructor(public rank: Rank) {}

  value(): number {
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

  constructor(
    private dealer: boolean,
    private card_one: PlayingCard,
    private card_two: PlayingCard,
    public handBet: number
  ) {
    this.is_dealer = dealer;
    this.hand_cards = [card_one, card_two];
    this.handSplited = 0;
    this.handBet = handBet;
  }

  public isSoft(): boolean {
    if (this.hand_cards[0].rank === "A" || this.hand_cards[1].rank === "A") {
      if (this.isSoft() === true || this.handValue() > 21) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  public handValue(): number {
    let value: number = 0;

    this.hand_cards.forEach((card) => {
      value += card.value();
    });

    if (value > 21 && this.isSoft()) {
      return value - 10;
    } else {
      return value;
    }
  }

  public canSplitable(): boolean {
    return (
      this.hand_cards.length === 2 &&
      this.hand_cards[0].rank === this.hand_cards[1].rank
    );
  }

  public hitCard(card: PlayingCard) {
    this.hand_cards.push(card);
  }
}

class Shoe {
  private cards: PlayingCard[] = [];

  private running_count: number = 0;

  private handsPlayedinShoe: number;

  private cardsPlayed: number = 0;

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

    while (this.cardsPlayed / (this.numDecks * 52) < this.penetration) {
      this.playHand();
    }
  }

  private trueCount(): number {
    return this.running_count / (this.numDecks - this.cardsPlayed / 52);
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

  shuffle() {
    this.cardsPlayed = 0;
    this.running_count = 0;

    let copy: PlayingCard[] = [],
      n: number = this.cards.length,
      i: number;

    while (n) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * n--);

      // And move it to thr new array. so its not picked again.
      copy.push(this.cards.splice(i, 1)[0]);
    }
    this.cards = copy;
  }

  dealCard(): PlayingCard {
    this.cardsPlayed += 1;
    return this.cards.pop()!;
  }

  remainingCards(): number {
    return this.cards.length;
  }

  private playHand() {
    // Implement the logic to play a single hand

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
    if (!dealer_hand.isSoft()) {
      while (dealer_hand.handValue() < 17) {
        dealer_hand.hitCard(this.dealCard());
      }
      return dealer_hand.handValue();
    } else {
      if (this.dealerHitsSoft17) {
        while (dealer_hand.handValue() <= 17) {
          dealer_hand.hitCard(this.dealCard());
        }
        return dealer_hand.handValue();
      } else {
        while (dealer_hand.handValue() < 17) {
          dealer_hand.hitCard(this.dealCard());
        }
        return dealer_hand.handValue();
      }
    }
  }

  private playerHandAlgorithm(
    player_hand: Hand,
    dealer_hand: Hand,
    dealer_hand_value: number
  ): Hand {
    let strategyCode = this.basicStrategy(player_hand, dealer_hand);
    let action = this.codeConverter(strategyCode);

    while (true) {
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

        this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
        this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);
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

        new_hand1.doubledDown = true;
        new_hand2.doubledDown = true;

        this.playerHandAlgorithm(new_hand1, dealer_hand, dealer_hand_value);
        this.playerHandAlgorithm(new_hand2, dealer_hand, dealer_hand_value);
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
      } else if (action === "M") {
        if (!player_hand.doubledDown) {
          player_hand.hitCard(this.dealCard());
          player_hand.handBet *= 2;
          player_hand.doubledDown = true;
          this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
        } else {
          return player_hand;
        }
      } else if (action === "H") {
        player_hand.hitCard(this.dealCard());
        this.playerHandAlgorithm(player_hand, dealer_hand, dealer_hand_value);
      } else {
        if (player_hand.handValue() > dealer_hand_value) {
          //player wins
        } else if (player_hand.handValue() < dealer_hand_value) {
          //dealer wins
        }
      }
      console.log("while loop worked" + "- " + this.handsPlayedinShoe);
    }
  }

  private bettingRamp(true_count: number): number {
    const bettingRatio = [
      0, 1, 2, 4, 5, 6, 8, 12, 16, 20, 25, 35, 50, 75, 100, 150, 200, 300, 500,
      750,
    ];
    const betingMultiplier = 1 / 3;
    const bettingArray = bettingRatio.map((x) => x * betingMultiplier);

    const revindCount = 1;

    const roundedCount = Math.round(true_count * 10);

    if (roundedCount <= 0) {
      return bettingArray[0];
    } else if (roundedCount >= 100) {
      return bettingArray[19];
    } else {
      return bettingArray[Math.round(roundedCount * 5) - revindCount];
    }
  }

  private codeConverter(code: string) {
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
    if (player_hand.canSplitable() === true) {
      return GameRules.pair_chart[(22 - player_hand.handValue()) / 2][
        dealer_hand.hand_cards[0].value() - 2
      ];
    } else if (!player_hand.isSoft()) {
      if (player_hand.handValue() > 17) {
        return "S";
      } else if (player_hand.handValue() < 8) {
        return "H";
      } else {
        return GameRules.hard_chart[17 - player_hand.handValue()][
          dealer_hand.hand_cards[0].value() - 2
        ];
      }
    } else if (dealer_hand.isSoft()) {
      if (player_hand.handValue() > 10) {
        return "S";
      } else if (player_hand.handValue() < 3) {
        return "H";
      } else {
        return GameRules.soft_chart[10 - player_hand.handValue()][
          dealer_hand.hand_cards[0].value() - 2
        ];
      }
    } else {
      console.log("somethink might went wrong in basicStrategy() section"); //hope it wont :D
      return "Error";
    }
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

  public setStatatistics() {
    this.statistics.handsPlayed = 1;
  }

  public simulate(numShoes: number) {
    for (let i = 0; i < numShoes; i++) {
      let shoe = new Shoe(
        numShoes,
        this.penetration,
        this.dealerHitsSoft17,
        this.maxSplits,
        this.doubleAfterSplit,
        this.blackjackPayout,
        this.initialMoney
      );
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

const simulation = new BlackjackSimulation(
  2, // numDecks
  0.75, // penetration
  true, // dealerHitsSoft17
  3, // maxSplits
  true, // doubleAfterSplit
  1.5, // blackjackPayout
  1000 // initialMoney
);
simulation.simulate(1);
