const apiKey = '802e8c90084fd47fe7ed51bf';
const conversionTypes = {
  currency: {
    name: "Currency",
    units: {}, 
    hasFlags: true,
    apiEndpoint: `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`,
    defaultFrom: "USD",
    defaultTo: "PHP"
  },
  length: {
    name: "Length",
    units: {
      m: { name: "Meters", symbol: "m" },
      km: { name: "Kilometers", symbol: "km" },
      cm: { name: "Centimeters", symbol: "cm" },
      mm: { name: "Millimeters", symbol: "mm" },
      ft: { name: "Feet", symbol: "ft" },
      in: { name: "Inches", symbol: "in" },
      yd: { name: "Yards", symbol: "yd" },
      mi: { name: "Miles", symbol: "mi" }
    },
    hasFlags: false,
    conversionRates: {
      m: 1,
      km: 0.001,
      cm: 100,
      mm: 1000,
      ft: 3.28084,
      in: 39.3701,
      yd: 1.09361,
      mi: 0.000621371
    },
    defaultFrom: "m",
    defaultTo: "ft"
  },
  weight: {
    name: "Weight",
    units: {
      kg: { name: "Kilograms", symbol: "kg" },
      g: { name: "Grams", symbol: "g" },
      lb: { name: "Pounds", symbol: "lb" },
      oz: { name: "Ounces", symbol: "oz" },
      ton: { name: "Metric Tons", symbol: "t" },
      st: { name: "Stones", symbol: "st" }
    },
    hasFlags: false,
    conversionRates: {
      kg: 1,
      g: 1000,
      lb: 2.20462,
      oz: 35.274,
      ton: 0.001,
      st: 0.157473
    },
    defaultFrom: "kg",
    defaultTo: "lb"
  },
  volume: {
    name: "Volume",
    units: {
      l: { name: "Liters", symbol: "L" },
      ml: { name: "Milliliters", symbol: "mL" },
      gal: { name: "Gallons", symbol: "gal" },
      qt: { name: "Quarts", symbol: "qt" },
      pt: { name: "Pints", symbol: "pt" },
      cup: { name: "Cups", symbol: "cup" },
      floz: { name: "Ounces", symbol: "oz" }
    },
    hasFlags: false,
    conversionRates: {
      l: 1,
      ml: 1000,
      gal: 0.264172,
      qt: 1.05669,
      pt: 2.11338,
      cup: 4.22675,
      floz: 33.814
    },
    defaultFrom: "l",
    defaultTo: "gal"
  },
  time: {
    name: "Time",
    units: {
        s: { name: "Seconds", symbol: "s" },
        ms: { name: "Milliseconds", symbol: "ms" },
        micros: { name: "Microseconds", symbol: "µs" },
        ns: { name: "Nanoseconds", symbol: "ns" },
        min: { name: "Minutes", symbol: "min" },
        h: { name: "Hours", symbol: "h" },
        d: { name: "Days", symbol: "d" },
        wk: { name: "Weeks", symbol: "wk" },
        mo: { name: "Months", symbol: "mo" },
        yr: { name: "Years", symbol: "yr" }
    },
    hasFlags: false,
    conversionRates: {
        s: 1,
        ms: 1000,
        micros: 1000000,
        ns: 1000000000,
        min: 0.0166666667,
        h: 0.0002777778,
        d: 0.0000115741,
        wk: 0.0000016534,
        mo: 0.0000003802570537, 
        yr: 0.00000003168808781
    },
    defaultFrom: "s",
    defaultTo: "min"
  }
};

let conversionTypeSelect;
const fromCurrency = document.querySelector(".from select");
const toCurrency = document.querySelector(".to select");
const getButton = document.querySelector("form button");
const textBox = document.getElementById("txtBox");
const exchangeIcon = document.querySelector("form .icon");
const txtRate = document.querySelector(".rate");

let currentType = 'currency';

function init() {
  if (typeof country_code !== 'undefined') {
    for (let currency_code in country_code) {
      conversionTypes.currency.units[currency_code] = {
        name: country_code[currency_code],
        flag: currency_code.substring(0, 2).toLowerCase()
      };
    }
  }
  
  createConversionTypeSelector();
  setupEventListeners();
  loadConversionType(currentType);
}

// Create conversion type selector
function createConversionTypeSelector() {
  const container = document.querySelector('.container');
  const typeSelector = document.createElement('div');
  typeSelector.className = 'conversion-type';
  typeSelector.innerHTML = `
    <div class="type-selector">
      <p>Conversion Type:</p>
      <select id="conversionType">
        ${Object.keys(conversionTypes).map(type => 
          `<option value="${type}">${conversionTypes[type].name}</option>`
        ).join('')}
      </select>
    </div>
  `;
  container.insertBefore(typeSelector, container.firstChild);
  conversionTypeSelect = document.getElementById('conversionType');
}


function setupEventListeners() {
  conversionTypeSelect.addEventListener('change', (e) => {
    currentType = e.target.value;
    loadConversionType(currentType);
  });

  // Your existing exchange icon functionality
  exchangeIcon.addEventListener("click", () => {
    let tmpCode = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tmpCode;
    
    if (conversionTypes[currentType].hasFlags) {
      loadFlag(fromCurrency);
      loadFlag(toCurrency);
    }
    runConversion();
  });

  getButton.addEventListener("click", e => {
    e.preventDefault();
    runConversion();
  });

  textBox.addEventListener("input", function(){
    var input = document.getElementById('txtBox').value;
    if(!/^[0-9,.]*$/.test(input)){
      if(alert('Please only enter numbers.')){}
      else window.location.reload();
    }
    else{
      debounce(runConversion, 500)();
    }
  });

  fromCurrency.addEventListener("change", e => {
    if (conversionTypes[currentType].hasFlags) {
      loadFlag(e.target);
    }
    runConversion();
  });

  toCurrency.addEventListener("change", e => {
    if (conversionTypes[currentType].hasFlags) {
      loadFlag(e.target);
    }
    runConversion();
  });
}

function loadConversionType(type) {
  const config = conversionTypes[type];
  
  fromCurrency.innerHTML = '';
  toCurrency.innerHTML = '';
  
  // Populate dropdowns
  Object.keys(config.units).forEach(unitCode => {
    const unit = config.units[unitCode];
    let optionText, selected1 = '', selected2 = '';
    
    if (config.hasFlags) {
      optionText = `${unitCode}`;
      selected1 = unitCode === config.defaultFrom ? 'selected' : '';
      selected2 = unitCode === config.defaultTo ? 'selected' : '';
    } else {
      optionText = `${unit.name} (${unit.symbol || unitCode})`;
      selected1 = unitCode === config.defaultFrom ? 'selected' : '';
      selected2 = unitCode === config.defaultTo ? 'selected' : '';
    }
    
    fromCurrency.innerHTML += `<option value="${unitCode}" ${selected1}>${optionText}</option>`;
    toCurrency.innerHTML += `<option value="${unitCode}" ${selected2}>${optionText}</option>`;
  });

  // Handle flags visibility
  const fromFlag = document.querySelector('.from img');
  const toFlag = document.querySelector('.to img');
  
  if (config.hasFlags) {
    fromFlag.style.display = 'block';
    toFlag.style.display = 'block';
    loadFlag(fromCurrency);
    loadFlag(toCurrency);
  } else {
    fromFlag.style.display = 'none';
    toFlag.style.display = 'none';
  }

  // Update button text
  getButton.textContent = type === 'currency' ? 'Run Rate' : 'Convert';

  // Clear previous results
  txtRate.innerHTML = '';
  
  // Perform initial conversion if there's a value
  if (textBox.value) {
    runConversion();
  }
}

// Your existing loadFlag function (preserved as-is)
function loadFlag(element){
  if (currentType !== 'currency') return;
  
  for (code in country_code){
    if(code == element.value){
      let currency_code = code.toLowerCase();
      let flagCode = code.substring(0, 2).toLowerCase();
      let imgTag = element.parentElement.querySelector("img");
      imgTag.src = `https://flagcdn.com/w80/${flagCode}.png`
    }
  }
}

// Main conversion function (replaces your runRate function)
function runConversion(){
  const amount = document.querySelector(".amount input");
  let amountVal = parseFloat(amount.value);
  
  if (isNaN(amountVal) || amountVal <= 0) {
    txtRate.innerText = '';
    return;
  }

  const config = conversionTypes[currentType];
  const fromUnit = fromCurrency.value;
  const toUnit = toCurrency.value;

  if (currentType === 'currency') {
    txtRate.innerText = "Running...";
    let api = `${config.apiEndpoint}${fromUnit}`;
    
    fetch(api).then(response => response.json()).then(result => {
      let exchangeRate = result.conversion_rates[toUnit];
      let totalRate = (amountVal * exchangeRate).toFixed(2);
      txtRate.innerText = `${amountVal} ${fromUnit} = ${totalRate} ${toUnit}`;
    }).catch(() => {
      txtRate.innerText = "Something went wrong.";
    });
  } else {
    try {
      const result = convertUnits(amountVal, fromUnit, toUnit, config.conversionRates);
      const fromUnitName = config.units[fromUnit].name;
      const toUnitName = config.units[toUnit].name;
      const formattedResult = result.toFixed(6).replace(/\.?0+$/, ''); 
      txtRate.innerText = `${amountVal} ${fromUnitName} = ${formattedResult} ${toUnitName}`;
    } catch (error) {
      txtRate.innerText = "Conversion error.";
    }
  }
}

function convertUnits(amount, from, to, rates) {
  if (from === to) return amount;
  
  const baseAmount = amount / rates[from];
  return baseAmount * rates[to];
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.addEventListener("load", e => {
  runConversion();
});

document.addEventListener('DOMContentLoaded', init);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}