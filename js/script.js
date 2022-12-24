// Global selectors
const allDifficultyCards = Array.from(document.querySelectorAll(".difficulty__content .difficulty__content--cards"));
const categoriesOptions = document.querySelector(".header__categories #category");
let isSelected = false;
let currentLevel;
let currentCategoryId;
let currentQuestion = 0;
let choices = [];
let timer = 10;
let clearTime;
const closeDifficulty = document.querySelector(".game-container__close .close");
const startGameBtn = document.querySelector(".startGame__wrapper--btn");

const cancelGame = () => {
    document.querySelector(".questionContainer").classList.add("none"),
    document.querySelector(".header").classList.remove("none"),
    document.querySelector(".difficulty").classList.remove("none"),
    document.querySelector(".startGame").classList.add("none"),
    document.querySelector(".game-container__close").classList.add("none")
};

// closing the difficulty element
closeDifficulty.addEventListener("click", ()=> {
    cancelGame()
    const questionContainer = document.querySelector(".questionContainer")
    choices = []
    Array.from(questionContainer.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
        btn.remove();
   })
})

const autoCorrect = () => {
    const correctAnswer = JSON.parse(localStorage.getItem("questions"))[currentQuestion]?.correct_answer
    document.querySelector(".next").classList.remove("none")
    Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
        btn.style.pointerEvents = "none";
       if(btn.textContent === correctAnswer) {
        btn.classList.add("correct")
    }
  })
}

const timerFunc = () => {
    timer = 10;
    clearTime = setInterval(() => {
        const next = document.querySelector(".timer");
        if(timer > 10) {
            --timer
            timer = timer
        }else if(timer > 0) {
             --timer
            timer = "0" + timer
        } else {
            clearInterval(clearTime)
           autoCorrect()
        }
        next.dataset.timer = timer;
        next.innerText = next.dataset.timer
    }, 1000)
}

document.querySelector(".next").addEventListener("click", ()=> {
    timerFunc()
    let questionContainer = document.querySelector(".questionContainer");
    choices = []
    Array.from(questionContainer.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
        btn.remove()
    })
    ++currentQuestion;
    if(currentQuestion >= 10){
        document.querySelector(".header").classList.remove("none");
        document.querySelector(".difficulty").classList.remove("none");
        document.querySelector(".startGame").classList.add("none");
        document.querySelector(".game-container__close").classList.add("none");
        questionContainer.classList.add("none")
        localStorage.removeItem("questions")
        currentQuestion = 0;
    }
    
    startGame(JSON.parse(localStorage.getItem("questions")))
})

startGameBtn.addEventListener("click",  async()=> {
    document.querySelector(".next").classList.remove("none")
    document.querySelector(".header").classList.add("none");
    document.querySelector(".difficulty").classList.add("none");
    document.querySelector(".startGame").classList.add("none");
    document.querySelector(".game-container__close").classList.remove("none");
    document.querySelector(".game-container__close .next").classList.remove("none");
    document.querySelector(".game-container__close .timer").classList.remove("none");
    document.querySelector(".questionContainer").classList.remove("none");
     await fetchData();
     await startGame(JSON.parse(localStorage.getItem("questions")));
     await timerFunc()
});


const checkAnswers = (correctAnswer, element) => {
    clearInterval(clearTime)
    document.querySelector(".next").classList.remove("none")
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
    closeDifficulty.addEventListener("click", ()=> {
        cancelGame() 
        location.reload()
    })
   
    if(questions !== "[]" || questions !== null) {
        let questionContainer = document.querySelector(".questionContainer__wrapper");
        document.querySelector('.questionContainerImg').setAttribute("src", `images/${currentLevel == "easy" ? "newbie": currentLevel == "medium"? "junior" : "intermidiate"}.jpg`)
        questionContainer.querySelector('.questionContainer__wrapper--p1').innerText = `question ${currentQuestion + 1} of 10`;
        questionContainer.querySelector('.questionContainer__wrapper--p2').innerText = questions[currentQuestion]?.question.replaceAll("&quot;", "'");

        document.querySelector(".next").classList.add("none")
            let buttons;
            const [a, b, c] = questions[currentQuestion].incorrect_answers
            choices.splice(0, 0, a, questions[currentQuestion].correct_answer, b, c);
            const shuffledChoice = shuffle(choices)
            shuffledChoice.forEach((choice) => {
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
    let startGameWrapper = document.querySelector(".startGame__wrapper");
    document.querySelector(".header").classList.add("none");
    document.querySelector(".game-container__close").classList.remove("none");
    document.querySelector(".game-container__close .next").classList.add("none");
    document.querySelector(".game-container__close .timer").classList.add("none");
    document.querySelector(".difficulty").classList.add("none");
    document.querySelector(".startGame").classList.remove("none");
  
    document.querySelector('.startGameImg').setAttribute("src", `images/${currentLevel == "easy" ? "newbie": currentLevel == "medium"? "junior" : "intermidiate"}.jpg`)
    startGameWrapper.querySelector('.startGame__wrapper--p1').innerText = currentLevel == "easy" ? "Level 1" : currentLevel == "medium" ? "Level 2" :  "Level 3" ;
    startGameWrapper.querySelector('h3').innerText = currentLevel == "easy" ? "Travel Newbie" : currentLevel == "medium" ? "Junior" :  "Intermidiate"
    startGameWrapper.querySelector('.startGame__wrapper--p2').innerText = `Do you feel confident? Here you'll challenge one of our most ${currentLevel == "easy" ? "easiest" : currentLevel == "medium" ? "junior level" :  "intermediate" } questions!`
    console.log(typeof currentLevel)
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

// shuffling an array [Helper]
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }