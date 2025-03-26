//API url

const API = "https://api.fbi.gov/wanted/v1/list";

//getting the eleements
const profile = document.getElementById("profiles");
const searchBar = document.getElementById("input");
const crimeFilter = document.getElementById("crimeFilter");
const darkMode = document.getElementById("darkModeToggle");

// loadmore button
const loadMoreBtn = document.createElement("button");
loadMoreBtn.id = "load-more";
loadMoreBtn.textContent = "Next";
document.body.appendChild(loadMoreBtn);

//loadprev button
const loadPrevBtn = document.createElement("button");
loadPrevBtn.id = "load-prev";
loadPrevBtn.textContent = "Previous";
loadPrevBtn.style.display = "none";
document.body.appendChild(loadPrevBtn);

//modal for view more button
const modal = document.createElement("div");
modal.id = "modal";
modal.style.display = "none";
modal.innerHTML = `
    <div class = "modal-content">
        <span class = "close">&times;</span>
        <img id = "modal-image" src ="" alt = "criminal Image">
        <h2 id = "modal-title"></h2>
        <p id = "modal-crime"></p>
        <p id = "modal-description"></p>
    <div>
`
document.body.appendChild(modal);

let allCriminals = [];
let loadIndex = 0;
const displaySize = 9;

//fetching data form the API
async function fetchCriminals(){
    try{
        const response = await fetch(API);
        const data = await response.json();
        allCriminals = data.items || [];
      

        displayCriminals();

        updateButtons();

    } catch (error) {
        console.error("error fetching data:", error);
    }
}
// display the profile on the frontend
function displayCriminals(){
    profile.innerHTML = "";
    const criminalsToShow = allCriminals.slice(loadIndex, loadIndex + displaySize);

    criminalsToShow.forEach(criminal => {
        const criminalCard = document.createElement("div");
        criminalCard.classList.add("criminal-card");

        criminalCard.innerHTML = `
            <img src= "${criminal.images?.[0]?.original || 'https://placehold.co/150'}" alt="${criminal.title}">
            <h3>${criminal.title}</h3>
            <p><strong>Crime:</strong>${criminal.subjects.join(",")}</p>
            <p>${criminal.description.substring(0, 100)}...</p>
            <button class = "view-more-btn" data-id="${criminal.uid}">view more </button>
        `;

        profile.appendChild(criminalCard);
        
    });

    updateButtons();
}

// open modal
function openModal(criminal){
    document.getElementById("modal-title").textContent = criminal.title;
    document.getElementById("modal-crime").textContent = `crime: ${criminal.subjects?.join(",") || "N/A"}`;
    document.getElementById("modal-description").textContent = criminal.description || "No description is found";
    document.getElementById("modal-image").src = criminal.images?.[0]?.original || 'https://placehold.co/150';

    // const modal = document.getElementById("modal");
    // const modalContent = document.getElementById("modal-content");

    // let modalFooter = document.getElementById("modal-footer");
    // // console.log(modalFooter)
    // if (!modalFooter){
    //     modalFooter = document.createElement("div");
    //     modalFooter.id = "modal-footer";
    //     modalContent.appendChild(modalFooter);
    // }
    // modalFooter.innerHTML = "";

    // const fbiButton = document.createElement("a");
    // fbiButton.href = criminal.url;
    // fbiButton.target = "_blank";
    // fbiButton.innerHTML = `<button class="fbi-link-btn">View on FBI Website</button>`;

    // modalFooter.appendChild(fbiButton);

    modal.style.display = "block"; 
}

//close modal
document.querySelector(".close").addEventListener("click", function() {
    modal.style.display = "none"; 
});

// event llistener for view more 
profile.addEventListener("click", (event) =>{
    if (event.target.classList.contains("view-more-btn")){
        const criminalId = event.target.dataset.id;
        const criminal = allCriminals.find(c => c.uid === criminalId);
        if (criminal){
            openModal(criminal);
        }else {
            console.error("Criminal not found:", criminalId);
        }
    }
});
// button on frontend visibility
function updateButtons(){
    loadMoreBtn.style.display = loadIndex + displaySize >= allCriminals.length ? "none" : "inline";
    loadPrevBtn.style.display = loadIndex === 0 ? "none" : "block"; //hide previous button on the first display
    
}
// loadPrev functionality
loadPrevBtn.addEventListener("click", function(){
    if (loadIndex - displaySize >= 0){
        loadIndex -= displaySize;
        displayCriminals();
    }
});

//loadmore functionality
loadMoreBtn.addEventListener("click", function(){
    if (loadIndex + displaySize < allCriminals.length){
        loadIndex += displaySize;
        displayCriminals();
    }
});


//search functionality
searchBar.addEventListener("input", function(){
    const searchItem = searchBar.value.toLowerCase();
    const criminalCards = document.querySelectorAll(".criminal-card");

    criminalCards.forEach(card => {
        const name = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = name.includes(searchItem) ? "block" : "none";
    });
});

//filter functionality
crimeFilter.addEventListener("change", function(){
    const selectCrime = crimeFilter.value.toLowerCase();
    const criminalCards = document.querySelectorAll(".criminal-card");

    criminalCards.forEach(card =>{
        const crimeText = card.querySelector("p strong").nextSibling.textContent.toLowerCase();
        card.style.display = crimeText.includes(selectCrime) || selectCrime === "" ? "block" : "none";
    });
});

// //Dark mode
// darkMode.addEventListener("click", function(){
//     document.body.classList.toggle("dark-mode");
// });



// console.log(displayCriminals(criminals))
fetchCriminals();