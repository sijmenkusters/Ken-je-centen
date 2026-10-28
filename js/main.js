function zoeken() {
    let zoekterm = document.getElementById("zoekveld").value;

    if (zoekterm.trim() !== "") {
        window.location.href =
            "https://www.google.com/search?q=" + encodeURIComponent(zoekterm);
    }
}

const START_BUDGET = 200;
const TOTAL_PRODUCTS = 5;
const TIME_LIMIT = 15;

const products = [
    {
        name: "Sneakers",
        category: "Schoenen",
        originalPrice: 120,
        salePrice: 72,
        image: "assets/yzyredoctober.jxl",
        alt: "Rode sneakers"
    },
    {
        name: "Draadloze koptelefoon",
        category: "Elektronica",
        originalPrice: 80,
        salePrice: 48,
        image: "assets/headphones.jpg",
        alt: "Koptelefoon"
    },
    {
        name: "Rugzak",
        category: "Accessoires",
        originalPrice: 65,
        salePrice: 39,
        image: "assets/130130130.webp",
        alt: "Rugzak"
    },
    {
        name: "Zonnebril",
        category: "Accessoires",
        originalPrice: 50,
        salePrice: 30,
        image: "assets/sunglasses.jpg",
        alt: "Zonnebril"
    },
    {
        name: "Jas",
        category: "Kleding",
        originalPrice: 150,
        salePrice: 90,
        image: "assets/puffer.jpg",
        alt: "Jas"
    }
];

const $ = (selector) => document.querySelector(selector);

const startScreen = $("#startscherm");
const quizScreen = $("#quizscherm");
const resultScreen = $("#resultaatscherm");

let gameProducts = [];
let currentIndex = 0;
let budget = START_BUDGET;
let spent = 0;
let purchases = [];
let currentAnswer = null;
let answerLocked = false;
let purchaseLocked = false;
let timerInterval = null;
let secondsLeft = TIME_LIMIT;

function money(amount) {
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR"
    }).format(amount);
}

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function discountPercent(product) {
    return Math.round(
        (1 - product.salePrice / product.originalPrice) * 100
    );
}

function startGame() {
    clearInterval(timerInterval);

    gameProducts = shuffle(products).slice(0, TOTAL_PRODUCTS);
    currentIndex = 0;
    budget = START_BUDGET;
    spent = 0;
    purchases = [];

    startScreen.hidden = true;
    resultScreen.hidden = true;
    quizScreen.hidden = false;

    showProduct();
}

function showProduct() {
    clearInterval(timerInterval);

    currentAnswer = null;
    answerLocked = false;
    purchaseLocked = false;
    secondsLeft = TIME_LIMIT;

    const product = gameProducts[currentIndex];
    const discount = discountPercent(product);

    $("#voortgang").textContent =
        `PRODUCT ${currentIndex + 1} VAN ${TOTAL_PRODUCTS}`;

    $("#voortgangvulling").style.width =
        `${(currentIndex / TOTAL_PRODUCTS) * 100}%`;

    $("#budget").textContent = money(budget);

    $("#productafbeelding").src = product.image;
    $("#productafbeelding").alt = product.alt;
    $("#productcategorie").textContent = product.category;
    $("#productnaam").textContent = product.name;

    // Vul de prijs- en kortingsinformatie in,
    // maar verberg deze zolang de gebruiker nog moet raden.
    $("#oudeprijs").textContent = money(product.originalPrice);
    $("#aanbiedingsprijs").textContent = money(product.salePrice);
    $("#kortingsbadge").textContent = `-${discount}%`;
    $("#kortingstekst").textContent =
        `Je betaalt ${money(product.salePrice)} in plaats van ` +
        `${money(product.originalPrice)}.`;

    $("#oudeprijs").hidden = true;
    $("#kortingsbadge").hidden = true;
    $("#kortingstekst").hidden = true;

    $("#prijsvraag").hidden = false;
    $("#koopkeuze").hidden = true;
    $("#antwoordfeedback").hidden = true;
    $("#keuzefeedback").hidden = true;
    $("#volgendeknop").hidden = true;

    $("#antwoordfeedback").classList.remove("feedback-goed");

    $("#koopknop").disabled = false;
    $("#overslaanknop").disabled = false;

    createPriceOptions(product);
    startTimer();
}

function createPriceOptions(product) {
    const container = $("#prijsopties");
    container.replaceChildren();


    const wrongPrices = shuffle([
        product.originalPrice - 20,
        product.originalPrice - 10,
        product.originalPrice + 10,
        product.originalPrice + 20,
        product.originalPrice + 30,
        product.originalPrice - 30
    ].filter(price =>
        price > 0 && price !== product.originalPrice
    )).slice(0, 3);

    const options = shuffle([
        product.originalPrice,
        ...wrongPrices
    ]);

    options.forEach(price => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "prijsoptie";
        button.textContent = money(price);

        button.addEventListener("click", () => {
            chooseAnswer(price);
        });

        container.appendChild(button);
    });
}

function startTimer() {
    $("#timerstatus")?.remove();

    const timer = document.createElement("p");
    timer.id = "timerstatus";
    timer.className = "timerstatus";
    timer.setAttribute("aria-live", "polite");
    timer.textContent = `Tijd om te raden: ${secondsLeft} seconden`;

    $("#prijsvraag").insertBefore(
        timer,
        $("#prijsopties")
    );

    timerInterval = setInterval(() => {
        secondsLeft--;

        timer.textContent =
            `Tijd om te raden: ${secondsLeft} seconden`;

        if (secondsLeft <= 3) {
            timer.classList.add("timer-bijna-om");
        }

        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            chooseAnswer(null);
        }
    }, 1000);
}

function chooseAnswer(price) {
    if (answerLocked) return;

    answerLocked = true;
    clearInterval(timerInterval);

    currentAnswer = price;

    const product = gameProducts[currentIndex];
    const correct = price === product.originalPrice;

    const buttons = $("#prijsopties").querySelectorAll("button");

    buttons.forEach(button => {
        button.disabled = true;

        const value = Number(
            button.textContent
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
        );

        if (value === product.originalPrice) {
            button.classList.add("antwoord-goed");
        } else if (price !== null && value === price) {
            button.classList.add("antwoord-fout");
        }
    });


    $("#oudeprijs").hidden = false;
    $("#kortingsbadge").hidden = false;
    $("#kortingstekst").hidden = false;

    const feedback = $("#antwoordfeedback");
    feedback.hidden = false;

    if (price === null) {
        feedback.textContent =
            `De tijd is om. De oorspronkelijke prijs was ` +
            `${money(product.originalPrice)}.`;
    } else if (correct) {
        feedback.textContent =
            `Goed gedaan! De oorspronkelijke prijs was ` +
            `${money(product.originalPrice)}.`;

        feedback.classList.add("feedback-goed");
    } else {
        feedback.textContent =
            `Niet helemaal. De oorspronkelijke prijs was ` +
            `${money(product.originalPrice)}. Het verschil met de ` +
            `aanbiedingsprijs is ${money(
                product.originalPrice - product.salePrice
            )}.`;

        feedback.classList.remove("feedback-goed");
    }

    showPurchaseChoice(product);
}

function showPurchaseChoice(product) {
    $("#koopkeuze").hidden = false;

    $("#koopuitleg").textContent =
        `Je betaalt ${money(product.salePrice)} als je dit product koopt. ` +
        `Denk even na: zou je dit product ook willen als er geen korting was?`;

    const canAfford = budget >= product.salePrice;
    const buyButton = $("#koopknop");

    buyButton.disabled = !canAfford;
    buyButton.textContent = canAfford
        ? `Koop voor ${money(product.salePrice)}`
        : "Niet genoeg budget";

    $("#keuzefeedback").hidden = true;

    $("#prijsvraag").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function choosePurchase(buy) {
    if (purchaseLocked) return;

    purchaseLocked = true;

    const product = gameProducts[currentIndex];
    const feedback = $("#keuzefeedback");

    if (buy && budget >= product.salePrice) {
        budget -= product.salePrice;
        spent += product.salePrice;
        purchases.push(product);

        feedback.textContent =
            `Je hebt ${product.name} gekocht voor ` +
            `${money(product.salePrice)}. Er blijft ` +
            `${money(budget)} over.`;

        feedback.className = "keuzefeedback feedback-goed";
    } else {
        feedback.textContent =
            `Je hebt ${product.name} overgeslagen. Je houdt ` +
            `${money(budget)} in je budget.`;

        feedback.className = "keuzefeedback";
    }

    feedback.hidden = false;
    $("#budget").textContent = money(budget);

    $("#koopknop").disabled = true;
    $("#overslaanknop").disabled = true;

    const nextButton = $("#volgendeknop");
    nextButton.hidden = false;
    nextButton.textContent =
        currentIndex === TOTAL_PRODUCTS - 1
            ? "Bekijk mijn resultaat"
            : "Volgend product";
}

function nextProduct() {
    if (!purchaseLocked) return;

    currentIndex++;

    $("#voortgangvulling").style.width =
        `${(currentIndex / TOTAL_PRODUCTS) * 100}%`;

    if (currentIndex >= TOTAL_PRODUCTS) {
        showResults();
        return;
    }

    $("#koopknop").disabled = false;
    $("#overslaanknop").disabled = false;

    showProduct();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showResults() {
    clearInterval(timerInterval);

    quizScreen.hidden = true;
    resultScreen.hidden = false;

    $("#eindstartbudget").textContent = money(START_BUDGET);
    $("#einduitgegeven").textContent = money(spent);
    $("#eindover").textContent = money(budget);

    $("#eindtitel").textContent =
        budget >= START_BUDGET / 2
            ? "Goed nagedacht over je geld!"
            : "Je budget is flink geslonken!";

    $("#eindintro").textContent =
        `Je begon met ${money(START_BUDGET)} en kocht ` +
        `${purchases.length} van de ${TOTAL_PRODUCTS} producten. ` +
        `Je hebt ${money(spent)} uitgegeven en ` +
        `${money(budget)} overgehouden.`;

    const boughtList = $("#gekochteproducten");
    boughtList.replaceChildren();

    if (purchases.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "Je hebt niets gekocht en je volledige budget bewaard.";

        boughtList.appendChild(message);
    } else {
        purchases.forEach(product => {
            const item = document.createElement("article");
            item.className = "gekocht-product";

            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.alt;

            const info = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = product.name;

            const price = document.createElement("p");
            price.textContent = money(product.salePrice);

            info.append(name, price);
            item.append(image, info);
            boughtList.appendChild(item);
        });
    }

    const learning = $("#leerpunt");
    learning.replaceChildren();

    const points = [
        `Je hebt ${money(spent)} uitgegeven. Dat geld kun je niet ` +
        `meer gebruiken voor iets anders.`,

        `Je hebt ${money(budget)} over. Niet kopen is ook een ` +
        `keuze: geld bewaren geeft je later meer mogelijkheden.`,

        "Een korting is geen besparing als je iets koopt dat je " +
        "eigenlijk niet nodig hebt. Je geeft nog steeds geld uit.",

        "Vraag jezelf bij een aanbieding af: zou ik dit ook kopen " +
        "voor deze prijs als er geen kortingslabel op stond?"
    ];

    points.forEach(text => {
        const p = document.createElement("p");
        p.textContent = text;
        learning.appendChild(p);
    });

    resultScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function restartGame() {
    startGame();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

$("#startknop").addEventListener("click", startGame);

$("#koopknop").addEventListener("click", () => {
    choosePurchase(true);
});

$("#overslaanknop").addEventListener("click", () => {
    choosePurchase(false);
});

$("#volgendeknop").addEventListener("click", nextProduct);

$("#opnieuwknop").addEventListener("click", restartGame);
