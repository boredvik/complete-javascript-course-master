'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-24T10:17:24.185Z',
    '2025-07-26T17:01:17.194Z',
    '2025-07-28T23:36:17.929Z',
    '2025-07-29T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2025-07-20T14:43:26.374Z',
    '2025-07-23T18:49:59.371Z',
    '2025-07-25T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// Internationalizing the dates
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs(day2 - day1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

// Internationalizing the currency
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovesDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates[i],
  }));

  // const movs = sort
  //   ? acc.movements.slice().sort((a, b) => a - b)
  //   : acc.movements;

  if (sort) {
    combinedMovesDates.sort((a, b) => a.movement - b.movement);
  }

  combinedMovesDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementDate);

    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMovement = formatCur(movement, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
  // `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  // `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
  // `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
  // `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  let tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    // in each call , print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds stop timer & logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();
      containerApp.style.opacity = 0;
    }

    // Decrease 1sec
    time--;
  };

  //set time to 50 min
  let time = 300;

  //call the timer every second
  const timer = setInterval(tick, 1000);

  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGIN IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// LOGIN
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const date = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth()}`.padStart(2, '0');
    // const year = now.getYear();
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const min = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${date}/${month}/${year},  ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// TRANSFER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
const us = [
  { naam: 'Vikrant', age: 30, gender: 'male' },
  { naam: 'Vishal', age: 18, gender: 'male' },
  { naam: 'Shanti ', age: 84, gender: 'female' },
  { naam: 'Hari Om', age: 68, gender: 'female' },
  { naam: 'Laxmi Raj', age: 75, gender: 'male' },
  { naam: 'Sarita', age: 51, gender: 'female' },
  { naam: 'Ajeet', age: 58, gender: 'male' },
];
/*
console.log(us);

us.sort((a, b) => a.name.localeCompare(b.name));
console.log(us.toSorted((a, b) => a.age - b.age));

const { male, female } = Object.groupBy(us, us =>
  us.gender === 'male' ? 'male' : 'female'
);
console.log(male, female);

const { Adult, Child } = Object.groupBy(us, us =>
  Number(us.age) > 18 ? 'Adult' : 'Child'
);
console.log(Adult, Child);

Converting and Checking Numbers

console.log(21 == 21.0);
console.log(0.1 + 0.2);
console.log(0.7 + 0.2);

console.log(Number.parseInt('23d'));
console.log(Number.parseInt('35rem', 10));
console.log(Number.parseInt('35.7rem', 10));

console.log(Number.parseFloat('35.7rem', 10));

console.log(Number.isNaN(56));
console.log(Number.isNaN(56 / 0));
console.log(Number.isNaN('a' - 2));

console.log(Number.isFinite(56 / 0));
console.log(Number.isFinite('56'));
console.log(Number.isFinite('56x'));

console.log(Number.isInteger(56));
console.log(Number.isInteger('56'));
console.log(Number.isInteger(1.7));

MAth and Rounding
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(50, 73, '85', '34', 67, 18, 34, 52));
console.log(Math.min(50, 73, '85', '34', 67, 18, 34, 52));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
console.log(randomInt(10, 20));
console.log(randomInt(0, 3));

console.log(Math.ceil(34.3));
console.log(Math.ceil(34.8));

console.log(Math.round(34.3));
console.log(Math.round(34.8));

console.log(Math.floor(-34.3));
console.log(Math.floor(-34.8));

console.log(Math.trunc(-34.3));
console.log(Math.trunc(-34.9));

console.log(5 % 2);
console.log(5 / 2);
console.log(8 % 3);
console.log(8 / 3);

const isEven = num => num % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'green';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

Numeric Seperator
const a = 123_234;
console.log(a);

console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 - 1);
console.log(2 ** 53 + 3);

const now = new Date();
console.log(now);

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142237180000));
console.log(Date.now());
console.log(new Date(Date.now()));

future.setFullYear(2040);

console.log(future);

console.log(new Date(future.setMonth(10)));
console.log(new Date(future.setDate(17)));
console.log(new Date(future.setHours(22)));
console.log(new Date(future.setMinutes(6)));
console.log(new Date(future.setSeconds(55)));
*/
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future);
// const clcDaysPassed = (day1, day2) =>
//   Math.abs(day2 - day1) / (1000 * 60 * 60 * 24);
// const days1 = clcDaysPassed(new Date(2037, 10, 14), new Date(2037, 10, 4));
// console.log(days1);
// const num = 623123.12;
// const options = {
//   style: 'currency',
//   currency: 'INR',
// };

// console.log('US', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany', new Intl.NumberFormat('de-DE', options).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

// const ingridients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} & ${ing2} 🍕`),
//   3000,
//   ...ingridients
// );

// if (ingridients.includes('spinach')) {
//   clearTimeout(pizzaTimer);
// }

// const now = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'numeric',
//   year: 'numeric',
// };
// const locale = navigator.language;

// new Intl.DateTimeFormat(navigator.language, options).format(now);

// setInterval(function () {
//   const now = new Date();
//   console.log(new Intl.DateTimeFormat(navigator.language, options).format(now));
// }, 1000);
