// manages the funtionality of the budget featur 
var budgetController = (function () {

	var Expense = function (id, description, amt) {
		this.id = id;
		this.description = description;
		this.amt = amt;
		this.percentage = -1;
	};

	Expense.prototype.calcItemPercentage = function (totalIncome) {

		if (totalIncome > 0) {
			this.percentage = Math.round((this.amt / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var Income = function (id, description, amt) {
		this.id = id;
		this.description = description;
		this.amt = amt;
	};

	var calcTotal = function (type) {
		var sum = 0;
		data.items[type].forEach(function (curr) {
			sum += curr.amt;
		});
		data.totals[type] = sum;

	};

	var data = {
		items: {
			exp: [],
			inc: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1

	}

	return {
		addItem: function (type, des, amt) {
			var newItem, ID;

			// Create ID based on type and push ID into the data structure
			if (data.items[type].length > 0) {
				ID = data.items[type][data.items[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type == 'exp') {
				newItem = new Expense(ID, des, amt);
			} else if (type == 'inc') {
				newItem = new Income(ID, des, amt);
			}

			data.items[type].push(newItem);
			// returns the new element 
			return newItem;

		},

		deleteItem: function (type, id) {
			var ids, index;

			ids = data.items[type].map(function (current) {
				return current.id;

			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.items[type].splice(index, 1);
			}

		},

		calcBudget: function () {
			//calc total income and total expense 
			calcTotal('exp');
			calcTotal('inc');

			//calc budget (inc - exp)
			data.budget = data.totals.inc - data.totals.exp;

			//percentage of income spent per expense
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}

		},

		calcPercent: function () {

			data.items.exp.forEach(function (cur) {
				cur.calcItemPercentage(data.totals.inc);
			});

		},

		getPercentages: function () {
			var allPercents = data.items.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPercents;
		},

		getBudget: function () {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalIncome: data.totals.inc,
				totalExpense: data.totals.exp
			};
		},

		testing: function () {
			console.log(data);
		}
	};

})();




// manages UI
var uiController = (function () {


	DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputAmt: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentLabel: '.item__percentage',
		dateLabel: '.budget__title--month'

	};
	var formatNum = function (num, type) {
		var int, dec, numSplit, type;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
		}

		dec = numSplit[1];

		type == 'exp' ? sign = '-' : sign = '+'

		return (type == 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

	};


	var nodeListForEach = function (list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}

	};



	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //returns inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				amt: parseFloat(document.querySelector(DOMstrings.inputAmt).value)
			};
		},

		addListItem: function (obj, type) {
			var html, new_html
			// create HTML string with placeholder

			if (type == 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%amt%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type == 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">-%amt%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// replace placeholder
			new_html = html.replace('%id%', obj.id)
			new_html = new_html.replace('%description%', obj.description);
			new_html = new_html.replace('%amt%', formatNum(obj.amt, type));

			// Insert string into HTML 
			document.querySelector(element).insertAdjacentHTML('beforeend', new_html);
		},

		deleteListItem: function (selector) {
			var el = document.getElementById(selector);
			el.parentNode.removeChild(el);

		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputAmt);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (curr, i, arr) {
				curr.value = '';
			});

			fieldsArr[0].focus();
		},

		displayBudget: function (obj) {
			var type;

			obj.budget > 0 ? type = 'inc' : 'exp';


			document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.totalIncome, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNum(obj.totalExpense, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '-';
			}
		},

		displayPercentages: function (percentages) {

			var fields = document.querySelectorAll(DOMstrings.expensesPercentLabel);

			nodeListForEach(fields, function (cur, index) {

				if (percentages[index] > 0) {
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '-';
				}
			});
		},

		displayMonth: function () {
			var now, year, month;

			now = new Date();

			months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changeType: function () {

			var fields = document.querySelectorAll(
				DOMstrings.inputType + "," +
				DOMstrings.inputDescription + "," +
				DOMstrings.inputAmt
			);

			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMstrings: function () {
			return DOMstrings

		}

	};

})();


// Global App 
var dataController = (function (budgetCtr, UIctr) {

	var setupEventlisenter = function () {
		var DOM = UIctr.getDOMstrings();
		document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAdditem);

		document.addEventListener('keypress', function (e) {
			if (e.keyCode == 13 || e.which == 13) {
				ctrlAdditem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOMstrings.inputType).addEventListener('change', UIctr.changeType)

	};

	var updateBudget = function () {

		//calc budget 
		budgetCtr.calcBudget();

		//returns budget
		var budget = budgetCtr.getBudget();

		//display changes in the UI
		UIctr.displayBudget(budget);

	};

	var updatePercentages = function () {

		// calc percentage 
		budgetCtr.calcPercent();

		// returns percentage 
		var percentages = budgetCtr.getPercentages();

		// update UI 
		UIctr.displayPercentages(percentages);

	};


	var ctrlAdditem = function () {
		var input, newItem;

		//user input field
		input = UIctr.getInput();

		if (input.description !== '' && !isNaN(input.amt) && input.amt > 0) {
			//add item from the budget ctrl
			newItem = budgetCtr.addItem(input.type, input.description, input.amt);

			//add item to the UI 
			UIctr.addListItem(newItem, input.type);

			// clearing fiels
			UIctr.clearFields();

			//Calc & udpate the budget
			updateBudget();

			// update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function (e) {
		var itemID, splitID, type, ID;

		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-')
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// delete the item from the data structure 
			budgetCtr.deleteItem(type, ID);

			// delete item from the UI
			UIctr.deleteListItem(itemID);

			// update and show new budget
			updateBudget();


			// update percentage
			updatePercentages();
		}
	};

	return {
		init: function () {
			UIctr.displayBudget({
				budget: 0,
				percentage: 0,
				totalIncome: 0,
				totalExpense: 0
			});
			setupEventlisenter();
			UIctr.displayMonth();
		}
	};


})(budgetController, uiController);

dataController.init();