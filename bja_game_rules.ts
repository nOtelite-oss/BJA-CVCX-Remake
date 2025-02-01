export class GameRules {
  public static default_deck: string[];
  public static hard_chart: string[][];
  public static soft_chart: string[][];
  public static pair_chart: string[][];
  public static bettingRatio: number[];

  static betting_config_one() {
    GameRules.bettingRatio = [
      0, 1, 2, 4, 5, 6, 8, 12, 16, 20, 25, 35, 50, 75, 100, 150, 200, 300, 500,
      750,
    ];
  }

  static configration_one() {
    // prettier-ignore
    GameRules.default_deck = [
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
      "A","K ","Q","J","10","9","8","7","6","5","4","3","2",
    ];

    GameRules.hard_chart = [
      //S: stand  H: hit  D: double down if allowed otherwise hit || Numbers reffers deviations. E.g. +4+HS (4 +) means normaly hit but if true count is 4 or higher you stand.
      //2    3    4    5    6    7    8    9    10   A
      ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], //17  H17
      ["S", "S", "S", "S", "S", "H", "H", "+4+HS", "+0+HS", "+3+HS"], //16  H16
      ["S", "S", "S", "S", "S", "H", "H", "H", "+4+HS", "+5+HS"], //15   H15
      ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], //14  H14
      ["-1-SH", "S", "S", "S", "S", "H", "H", "H", "H", "H"], //13  H13
      ["+3+HS", "+2+HS", "+0-SH", "S", "S", "H", "H", "H", "H", "H"], //12  H12
      ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"], //11  H11
      ["D", "D", "D", "D", "D", "D", "D", "D", "+4+HD", "+3+HD"], //10  H10
      ["+1+HD", "D", "D", "D", "D", "D", "+3+HD", "H", "H", "H"], //9 H9
      ["H", "H", "H", "H", "H", "+2+HD", "H", "H", "H", "H"], //8  H8
    ];
    GameRules.soft_chart = [
      //S: stand  H: hit  D: double down if allowed otherwise hit  M: double down if allowed otherwise stand
      //2    3    4    5    6    7    8    9    10   A
      ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], //A9  S10
      ["S", "S", "+3+SH", "+1+SH", "+0-SH", "S", "S", "S", "S", "S"], //A8  S9
      ["M", "M", "M", "M", "M", "S", "S", "H", "H", "H"], //A7  S8
      ["+1+HN", "D", "D", "D", "D", "H", "H", "H", "H", "H"], //A6  S7
      ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"], //A5  S6
      ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"], //A4  S5
      ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"], //A3  S4
      ["H", "H", "H", "M", "M", "H", "H", "H", "H", "H"], //A2  S3
    ];

    // Y: split  B: Split if double down offered after  N: dont split
    GameRules.pair_chart = [
      //2    3    4    5    6    7    8    9    10   A
      ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"], //AA
      ["N", "N", "+6+NY", "+5+NY", "+4+NY", "N", "N", "N", "N", "N"], //TT
      ["Y", "Y", "Y", "Y", "Y", "N", "Y", "Y", "N", "N"], //99
      ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"], //88
      ["Y", "Y", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //77
      ["B", "Y", "Y", "Y", "Y", "N", "N", "N", "N", "N"], //66
      ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"], //55
      ["N", "N", "N", "B", "B", "N", "N", "N", "N", "N"], //44
      ["B", "B", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //33
      ["B", "B", "Y", "Y", "Y", "Y", "N", "N", "N", "N"], //22
    ];
  }
}

GameRules.configration_one();
GameRules.betting_config_one();
