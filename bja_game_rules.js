export class GameRules {
  constructor() {
    // prettier-ignore
    this.default_deck = [
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
    ];

    this.hard_strategy = [
      //S: stand  H: hit  D: double down if allowed otherwise hit
      //2    3    4    5    6    7    8    9    10   A
      ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], //17
      ["S", "S", "S", "S", "S", "H", "H", "4+H", "0+H", "3+H"], //16
      ["S", "S", "S", "S", "S", "H", "H", "H", "4+H", "5+H"], //15
      ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], //14
      ["-1-S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], //13
      ["3+H", "2+H", "0-S", "S", "S", "H", "H", "H", "H", "H"], //12
      ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"], //11
      ["D", "D", "D", "D", "D", "D", "D", "D", "4+H", "3+H"], //10
      ["1+H", "D", "D", "D", "D", "D", "3+H", "H", "H", "H"], //9
      ["H", "H", "H", "H", "H", "2+H", "H", "H", "H", "H"], //8
    ];
    this.soft_strategy = [
      //S: stand  H: hit  M: double down if allowed otherwise hit  N: double down if allowed otherwise stand
      //2    3    4    5    6    7    8    9    10   A
      ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], //A9
      ["S", "S", "3+S", "1+S", "0-S", "S", "S", "S", "S", "S"], //A8
      ["N", "N", "N", "N", "N", "S", "S", "H", "H", "H"], //A7
      ["1+H", "M", "M", "M", "M", "H", "H", "H", "H", "H"], //A6
      ["H", "H", "M", "M", "M", "H", "H", "H", "H", "H"], //A5
      ["H", "H", "M", "M", "M", "H", "H", "H", "H", "H"], //A4
      ["H", "H", "H", "M", "M", "H", "H", "H", "H", "H"], //A3
      ["H", "H", "H", "M", "M", "H", "H", "H", "H", "H"], //A2
    ];

    // Y: split  D: Split if double down offered after  N: dont split
    this.pair_strategy = [
      //2    3    4    5    6    7    8    9    10   A
      ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"], //AA
      ["N", "N", "6+N", "5+N", "4+N", "N", "N", "N", "N", "N"], //TT
      ["Y", "Y", "Y", "Y", "Y", "N", "Y", "Y", "N", "N"], //99
      ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"], //88
      ["Y", "Y", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //77
      ["D", "Y", "Y", "Y", "Y", "N", "N", "N", "N", "N"], //66
      ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"], //55
      ["N", "N", "N", "D", "D", "N", "N", "N", "N", "N"], //44
      ["D", "D", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //33
      ["D", "D", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //22
    ];
  }
}
