const MyArray = ["6+H", "H", "-2-S", "S", "S", "H", "H", "H", "H", "H"];

const default_deck = [
  "A",
  "K ",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "A",
  "K ",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "A",
  "K ",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "A",
  "K ",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let secondArray = MyArray.splice;

function shuffle(array) {
  let copy = [],
    n = array.length,
    i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    copy.push(array.splice(i, 1)[0]);
  }

  console.log(copy);
}

shuffle(numbers);
const myString = "-2+HS";
const mySecString = "H";

// console.log(typeof parseInt(myString.slice(0, 2)));
// console.log(typeof myString.slice(2, 3));
// console.log(typeof myString.slice(3, 5));

converter = (string) => {
  if (string.length > 2) {
    let count = parseInt(string.slice(0, 2)) + " " + string.slice(2, 3);
    let firstStrategy = string.slice(4, 5);
    let secondStrategy = string.slice(5, 6);

    console.log(count, firstStrategy, secondStrategy);
  } else {
    console.log(string);
  }
};

// converter(myString);
// converter(mySecString);
