const startQuiz = () => {

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
let score = 0;
let gameEnded = false;
const closeDifficulty = document.querySelector(".game-container__close .close");
const startGameBtn = document.querySelector(".startGame__wrapper--btn");
const nextBtn = document.querySelector(".next");


// opening modal
document.querySelector(".header__categories--info").addEventListener("click", (e) => {
    document.querySelector(".header__overlay").classList.remove("none")
  });

  //closing the modal
document.querySelector(".header__modal__header--close").addEventListener("click", (e) => {
    document.querySelector(".header__overlay").classList.add("none")
  });

// canceling the game helper function if we press the close icon
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

// autocheck the answer if the user didnt select
const autoCorrect = () => {
    if(!gameEnded) {
    const correctAnswer = JSON.parse(localStorage.getItem("questions"))[currentQuestion]?.correct_answer
    document.querySelector(".next").classList.remove("none")
    Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
        btn.style.pointerEvents = "none";
       if(btn.textContent === correctAnswer) {
        btn.classList.add("correct")
    }
  })
}
}

// fetching data helper function
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

// quiz timer function 
const timerFunc = () => {
    timer = 10 + 1;
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

// next question btn 
nextBtn.addEventListener("click", ()=> {
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
        gameEnded = true;
        Toastify({
            text: `You have answered ${score} out of 10 questions`,
            className: "success",
            close: true,
            duration : "4000",
            position: "center",
            style: {
              background: "hsl(57, 98%, 43%)",
              fontSize : "17px"
            }
          }).showToast();
          score = 0
          document.querySelectorAll(".header__categories #category").forEach((category) => category.value = "")
          isSelected = false
          clearInterval(clearTime)
    }
    
    startGame(JSON.parse(localStorage.getItem("questions")))

})

// starting the quiz and fetching the data to be displayed
startGameBtn.addEventListener("click",  async()=> {
    document.querySelector(".next").classList.remove("none")
    document.querySelector(".header").classList.add("none");
    document.querySelector(".difficulty").classList.add("none");
    document.querySelector(".startGame").classList.add("none");
    document.querySelector(".game-container__close").classList.remove("none");
    document.querySelector(".game-container__close .timer").classList.remove("none");
    document.querySelector(".questionContainer").classList.remove("none");
    await nextBtn.classList.add("none")
     await fetchData();
     await startGame(JSON.parse(localStorage.getItem("questions")));
     await timerFunc()
});

// checking if the user select the correct answer and giving the bg colors 
const checkAnswers = (correctAnswer, element) => {
    clearInterval(clearTime)
    document.querySelector(".next").classList.remove("none")
    Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> {
       if(btn.textContent === correctAnswer) {
        btn.classList.add("correct")
        btn.style.pointerEvents = "none"
    }
    
})
    if (correctAnswer === element.textContent) {
        element.classList.add("correct")
        element.classList.remove("wrong")
        ++score
        Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> btn.style.pointerEvents = "none")
    }else {
        element.classList.add("wrong")
        element.classList.remove("correct")
        Array.from(document.querySelectorAll(".questionContainer__wrapper--btn")).forEach((btn)=> btn.style.pointerEvents = "none")
    }
}

// starting the game if user press the game btn and fetching the data
const startGame = (questions) => {
    closeDifficulty.addEventListener("click", ()=> {
        cancelGame() 
        location.reload()
    })
   
    if(!gameEnded && questions !== "[]" || questions !== null) {
        const removeHtmlEntities = /&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);?/ig;
        const removeUnicode = /[\uE000-\uF8FF]/g;
        let questionContainer = document.querySelector(".questionContainer__wrapper");
        document.querySelector('.questionContainerImg').setAttribute("src", `images/${currentLevel == "easy" ? "newbie": currentLevel == "medium"? "junior" : "intermidiate"}.jpg`)
        questionContainer.querySelector('.questionContainer__wrapper--p1').innerText = `question ${currentQuestion + 1} of 10`;
        questionContainer.querySelector('.questionContainer__wrapper--p2').innerText = questions[currentQuestion]?.question.replaceAll(removeHtmlEntities, "").replaceAll(removeUnicode, "");

        document.querySelector(".next").classList.add("none")
            let buttons;
            let filteredIncorrectAnswer = [];
            for(let incorrect of questions[currentQuestion].incorrect_answers){
                filteredIncorrectAnswer.push(incorrect.replaceAll(removeHtmlEntities, "").replaceAll(removeUnicode, ""))
            }
            const [a, b, c] = filteredIncorrectAnswer;
            choices.splice(0, 0, a, questions[currentQuestion].correct_answer.replaceAll(removeHtmlEntities, "").replaceAll(removeUnicode, ""), b, c);
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


// if the category is selected
const currentCategory = (selectedCategoryId) => {
    isSelected = true;
    currentCategoryId = selectedCategoryId;
}
// conditional to check if user selected a categry value is selected
const checkIfSelected = () => {
    const options = {
        background: "hsl(0, 100%, 66%)",
        display : "flex",
        alignItems : "center",
        justifyContent : "center",
        lineHeight: 1.7,
        fontSize : "17px",
        gap: "10px"
    }
    Toastify({
        text: "Please select a category to start playing",
        className: "error",
        close: true,
        duration : "2000",
        position: "center",
        style: options
      }).showToast();
    isSelected = false;
}

// navigating to the difficulty page 
const confirmCategory = (level) => {
    isSelected = true;
    currentLevel = level;
    gameEnded = false;
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
}

// if the category is selected continue else going to the checkifselected function
categoriesOptions.addEventListener("change", (e) => {
    // getting the selected category
        const selectedValueId = e.target.options[e.target.selectedIndex].dataset.id;
        e.target.value ? currentCategory(selectedValueId) : checkIfSelected();
 
});

// loops through all cards and choosing the difficulty level
allDifficultyCards.forEach((cards) => {
    cards.addEventListener("click", (e)=> {
        //if category is selected run confirmCategory if not run the checkifSelected 
        isSelected ? confirmCategory(cards.dataset.level) : checkIfSelected();
    });
});

// shuffling an array [Helper] [for adding inside the choices array to shuffle]
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

}

window.addEventListener("load", () => startQuiz())