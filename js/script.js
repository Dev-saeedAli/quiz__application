// Global selectors
const allDifficultyCards = Array.from(document.querySelectorAll(".difficulty__content .difficulty__content--cards"));
const categoriesOptions = document.querySelector(".header__categories #category");
let isSelected = false;
let currentLevel;
let currentCategoryId;
let currentQuestion = 0;
let choices = [];
const closeDifficulty = document.querySelector(".game-container__close .close");
const startGameBtn = document.querySelector(".startGame__wrapper--btn");

// closing the difficulty element
closeDifficulty.addEventListener("click", ()=> {
    document.querySelector(".header").classList.remove("none");
    document.querySelector(".difficulty").classList.remove("none");
    document.querySelector(".startGame").classList.add("none");
    document.querySelector(".game-container__close").classList.add("none");
})

document.querySelector(".next").addEventListener("click", ()=> {
    if(currentQuestion>9){
        localStorage.removeItem("questions")
        currentQuestion = 0;
        Array.from(questionContainer.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
            btn.remove()
       })
        startGame(JSON.parse(localStorage.getItem("questions")))
     
    }
    let questionContainer = document.querySelector(".questionContainer__wrapper");
    Array.from(questionContainer.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
        btn.remove()
   })
    choices = []
    currentQuestion++;
    startGame(JSON.parse(localStorage.getItem("questions")))
})

startGameBtn.addEventListener("click", async ()=> {
    document.querySelector(".header").classList.add("none");
    document.querySelector(".difficulty").classList.add("none");
    document.querySelector(".startGame").classList.add("none");
    document.querySelector(".game-container__close").classList.remove("none");
    document.querySelector(".questionContainer").classList.remove("none");
    await fetchData();
    await startGame(JSON.parse(localStorage.getItem("questions")));
});


const checkAnswers = (correctAnswer, element) => {


    Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
       if(btn.textContent === correctAnswer) {
        btn.classList.add("correct")
        btn.style.pointerEvents = "none"
    }

    if (correctAnswer === element.textContent) {
        element.classList.add("correct")
        element.classList.remove("wrong")
        btn.style.pointerEvents = "none"
    }else {
        element.classList.add("wrong")
        element.classList.remove("correct")
        btn.style.pointerEvents = "none"
        }
})

}


const startGame = (questions) => {
   
    if(questions !== "[]" || questions !== null) {
        let questionContainer = document.querySelector(".questionContainer__wrapper");
        questionContainer.querySelector('.questionContainer__wrapper--p1').innerText = `question ${currentQuestion + 1} of 10`;
        questionContainer.querySelector('.questionContainer__wrapper--p2').innerText = questions[currentQuestion].question.replaceAll("&quot;", "'");
            let buttons;
            const [a, b, c] = questions[currentQuestion].incorrect_answers
            choices.splice(0, 0, a, questions[currentQuestion].correct_answer, b, c);
            choices.forEach((choice) => {
               buttons = document.createElement("button");
               buttons.innerText = choice;
               buttons.classList.add("questionContainer__wrapper--btn")
               questionContainer.append(buttons)
            });

                Array.from(questionContainer.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
                btn.addEventListener("click", (e)=>{
                    checkAnswers(questions[currentQuestion].correct_answer , e.target)
                })
               })
        }
}

const fetchData  = async () => {
        if(currentLevel !== undefined && currentCategoryId !== undefined){
            try {
                const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${currentCategoryId}&difficulty=${currentLevel}&type=multiple`);
                const data = await response.json();
                await localStorage.getItem("questions") !== "" || localStorage.getItem("questions") !== null ? localStorage.setItem("questions", JSON.stringify(data.results)) : "[]"; 
            } catch(error) {
                console.log(error);
            }
        }
}

// if the category is selected
const currentCategory = (selectedCategoryId) => {
    isSelected = true;
    currentCategoryId = selectedCategoryId;
}
// conditional to check if user selected a categry value
const checkIfSelected = () => {
    alert("Please select the category that you need to play")
    isSelected = false;
}

// navigating to the difficulty page 
const confirmCategory = (level) => {
    isSelected = true;
    currentLevel = level;
    document.querySelector(".header").classList.add("none");
    document.querySelector(".game-container__close").classList.remove("none");
    document.querySelector(".difficulty").classList.add("none");
    document.querySelector(".startGame").classList.remove("none");
}

categoriesOptions.addEventListener("change", (e) => {
    // getting the selected category
        const selectedValueId = e.target.options[e.target.selectedIndex].dataset.id;
        e.target.value ? currentCategory(selectedValueId) : checkIfSelected();
 
});

allDifficultyCards.forEach((cards) => {
    cards.addEventListener("click", (e)=> {
        //if category is selected run confirmCategory if not run the checkifSelected 
        isSelected ? confirmCategory(cards.dataset.level) : checkIfSelected();
    });
});