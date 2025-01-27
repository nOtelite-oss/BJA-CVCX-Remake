import { GameRules } from "./bja_game_rules";

type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

class PlayingCard {
    constructor(public rank: Rank) {}
    
    value(): number {
        if (['J', 'Q', 'K'].includes(this.rank)) {
            return 10;
        } else if (this.rank === 'A') {
            return 11;
        } else {
            return parseInt(this.rank, 10);
        }
    }
}

class Hand {
    public hand_cards: PlayingCard[];
    public readonly is_dealer: boolean;

    constructor(private dealer:boolean, private card_one: PlayingCard, private card_two: PlayingCard) {
        this.is_dealer = dealer;
        this.hand_cards = [card_one,card_two];
    }
    
    public isSoft(): boolean {
        if (this.hand_cards[0].rank === 'A' || this.hand_cards[1].rank === 'A') {
            if( this.isSoft() === true || this.handValue() > 21) {
                return false;
            }
            else {
                return true
            }
        }
        else {
            return false;
        }
    }

    public handValue(): number {
        let value: number = 0;

        this.hand_cards.forEach(card => {
            value += card.value()
        });

        if(value > 21 && this.isSoft()) {
            return value - 10;
        }

        else{
            return value;
        }
    }

    public canSplitable(): boolean {
        return this.hand_cards.length === 2 && this.hand_cards[0].rank === this.hand_cards[1].rank;
    }

    public hitCard(card: PlayingCard) {
        this.hand_cards.push(card)
    }
}

class Shoe {
    private cards: PlayingCard[] = [];

    private running_count: number;
    private true_count: number;

    private decks_remaining: number;
    private handsPlayedinShoe: number;

    private cardsPlayed: number = 0;

    constructor(private numDecks: number, private penetration: number) {
        this.createShoe();
        this.shuffle();

        this.penetration = penetration;

        this.running_count = 0;
        this.true_count = this.running_count / this.decks_remaining;

        // while (this.cardsPlayed / (this.numDecks * 52) < this.penetration) {
        //     this.playHand();
        // }    TODO: implement cards played then apply this here

        this.playHand();

    }

    private createShoe() {
        const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (let i = 0; i < this.numDecks; i++) {
            for (const rank of ranks) {
                for (let i=0; i<4; i++) {
                    this.cards.push(new PlayingCard(rank));
                }
            }
        }
    }

    shuffle() {
        this.cardsPlayed = 0;

        let copy: PlayingCard[] = [],
          n: number = this.cards.length,
          i: number;
    
        while (n) {
          // Pick a remaining element…
          i = Math.floor(Math.random() * n--);
    
          // And move it to thr new array. Boylece tam rastgele oluyor.
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

        let opening_cards: PlayingCard[] = [this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard()];

        let player_hand: Hand = new Hand(false, opening_cards[0], opening_cards[2]); //dealing cards like the real way, have no idea if it changes anythink :D, prob no in long run i guess
        let dealer_hand: Hand = new Hand(true, opening_cards[1], opening_cards[3]);

        
        
    }

    private basicStrategy(player_hand: Hand , dealer_hand: Hand) {
        if(player_hand.canSplitable() === true) {
            return GameRules.pair_chart[(22 - player_hand.handValue())/2][dealer_hand.hand_cards[0].value() - 2]
        }

        else if(dealer_hand.isSoft() === false) {
            if(player_hand.handValue() > 17) {
                return "S"
            }

            else if(player_hand.handValue() < 8) {
                return "H"
            }

            else {
                return GameRules.hard_chart[17 - player_hand.handValue()][dealer_hand.hand_cards[0].value() - 2]
            }
        }
        else if(dealer_hand.isSoft() === true){
            if(player_hand.handValue() > 10) {
                return "S";
            }
            else if(player_hand.handValue() < 3) {
                return "H"
            }
            else {
                return GameRules.soft_chart[10 - player_hand.handValue()][dealer_hand.hand_cards[0].value() - 2]
            }
        }

        else {
            console.log('somethink might went wrong in basicStrategy() section') //hope it wont :D
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
        amountWonLost: 0
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
            let shoe = new Shoe(numShoes, this.penetration);
            this.statistics.shoesPlayed++;

        }
        // this.outputStatistics(); 
    }

    private outputStatistics() {
        console.log(`Shoes Played: ${this.statistics.shoesPlayed}`);
        console.log(`Hands Played: ${this.statistics.handsPlayed}`);
        console.log(`Dealer Wins: ${this.statistics.dealerWins} (${(this.statistics.dealerWins / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Player Wins: ${this.statistics.playerWins} (${(this.statistics.playerWins / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Stand Offs: ${this.statistics.standOffs} (${(this.statistics.standOffs / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Dealer Blackjacks: ${this.statistics.dealerBlackjacks} (${(this.statistics.dealerBlackjacks / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Player Blackjacks: ${this.statistics.playerBlackjacks} (${(this.statistics.playerBlackjacks / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Dealer Busts: ${this.statistics.dealerBusts} (${(this.statistics.dealerBusts / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Player Busts: ${this.statistics.playerBusts} (${(this.statistics.playerBusts / this.statistics.handsPlayed * 100).toFixed(2)}%)`);
        console.log(`Initial Money: ${this.statistics.initialMoney}`);
        console.log(`End Money: ${this.statistics.endMoney}`);
        console.log(`Average Bet per Hand: ${(this.statistics.totalBet / this.statistics.handsPlayed).toFixed(2)}`);
        console.log(`Largest Bet in a Hand: ${this.statistics.largestBet}`);
        console.log(`Amount Won/Lost: ${this.statistics.amountWonLost}`);
        console.log(`Average Won/Lost per 100 Hands: ${(this.statistics.amountWonLost / this.statistics.handsPlayed * 100).toFixed(2)}`);
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