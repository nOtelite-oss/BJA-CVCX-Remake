import { GameRules } from "./bja_game_rules";

class Blackjack_Game {
  constructor() {
    //         GAME SETTINGS
    this.shoes_per_sim = 1;
    this.deck_count = 6;
    this.deck_penetration = 80 / 100;

    this.starting_money = 1000;

    //        SIMULATION DATA
    this.cardCount = [];
    this.trueCount = [];

    this.playerWon = [];
    this.dealerWon = [];

    this.playerBusted = [];
    this.dealerBusted = [];

    //basic strategy
    this.hard_strategy = GameRules.hard_strategy;
    this.soft_strategy = GameRules.soft_strategy;
    this.pair_strategy = GameRules.pair_strategy;

    this.default_deck = GameRules.default_deck;
  }

  shuffle(array) {
    let copy = [],
      n = array.length,
      i;

    // While there remain elements to shuffle…
    while (n) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * n--);

      // And move it to the new array.
      copy.push(array.splice(i, 1)[0]);
    }

    return copy;
  }
}
