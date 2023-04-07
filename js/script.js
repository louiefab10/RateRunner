const dropList = document.querySelectorAll(".drop-list select");
const apiKey = '802e8c90084fd47fe7ed51bf';
fromCurrency = document.querySelector(".from select");
toCurrency = document.querySelector(".to select");
getButton = document.querySelector("form button");
for(let i = 0; i < dropList.length; i++){
    for (currency_code in country_code){
        let selected;
        if(i == 0){
            selected = currency_code == "USD" ? "selected" : "";
        }
        else if(i == 1){
            selected = currency_code == "PHP" ? "selected" : "";
        }
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e => {
        loadFlag(e.target);
    });
}

function loadFlag(element){
    for (code in country_code){
        if(code == element.value){
            let currency_code = code.toLowerCase();
            let flagCode = code.substring(0, 2).toLowerCase();
            let imgTag = element.parentElement.querySelector("img");
            imgTag.src = `https://flagcdn.com/w80/${flagCode}.png`
        }
    }
}

window.addEventListener("load", e =>{
    runRate();
});

getButton.addEventListener("click", e =>{
    e.preventDefault();
    runRate();
});

const exchangeIcon = document.querySelector("form .icon");
exchangeIcon.addEventListener("click", () =>{
    let tmpCode = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tmpCode;
    loadFlag(fromCurrency);
    loadFlag(toCurrency);
    runRate();
});

function runRate(){
    const amount = document.querySelector(".amount input");
    const txtRate = document.querySelector(".rate");
    let amountVal = amount.value;
    if(amountVal == "" || amountVal == "0"){
        amount.value ="1"
        amountVal = 1;
    }
    txtRate.innerText = "Running...";
    let api = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency.value}`;
    fetch(api).then(response => response.json()).then(result => {
        let exchangeRate = result.conversion_rates[toCurrency.value];
        let totalRate = (amountVal * exchangeRate).toFixed(2);
        txtRate.innerText = `${amountVal} ${fromCurrency.value} = ${totalRate} ${toCurrency.value}`;
    }).catch(() => {
        txtRate.innerText = "Something went wrong.";
    });
}