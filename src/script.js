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

    const modal = document.getElementById("modal");
    const modalContent = modal.querySelector(".modal-content");

    if (!modalContent) {
        console.error("❌ ERROR: Element with ID 'modal-content' not found.");
        return;
    }

    modalContent.innerHTML =`
        <span class= "close-btn">&times;</span>
        <h2>${criminal.title}</h2>
        <img src="${criminal.images?.[0]?.original || 'https://placehold.co/150'}" alt="${criminal.title}">
        <p><strong>Crime:</strong> ${criminal.subjects.join(",")}</p>
        <p>${criminal.description}</p>
        <a href= "${criminal.url}" target= "_blank">
            <button class="fbi-link-btn">View on FBI</button>
        </a>

        <button id= "reportBtn" class="report-btn">Report This Criminal</button>

        <!--hidding Report Form-->
        <form id= "reportForm" class="hidden">
            <h3>Report This Criminal</h3>
            <label for = "reporterName">Your Name:</label>
            <input type= "text" id= "reporterName" placehholder= "Enter your name" required>

            <label for="reportLoction">Last Seen Location:</label>
            <input type= "text" id="reportLocation" placeHolder= "Enter the last seen Location"required>

            <label for="reportDetails">Additional Details:</label>
            <textArea id="reportDetails" placeholder="Please provide more Informantion" required></textarea>
            <button type="submit" class="submit-report-btn">Submit Report</button>

        </form>
    `;

    modal.style.display = "block"; 

    //close button

    const closeButton = modalContent.querySelector(".close-btn");

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            console.log("Close button clicked!");
            modal.style.display = "none";
        });
    } else {
        console.error("Close button still not found! Check modal-content structure.");
    }

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Report Button Click
    document.getElementById("reportBtn").addEventListener("click", function(){
        document.getElementById("reportForm").classList.toggle("hidden");
    });

    //report form submission
    document.getElementById("reportForm").addEventListener("submit", function(event){
        event.preventDefault();

        const report = {
            criminalName: criminal.title,
            reporterName: document.getElementById("reporterName").value,
            location: document.getElementById("reportLocation").value,
            details: document.getElementById("reportDetails").value,
            date: new Date().toISOString(),

        };
        console.log("Report Submitted:", report); // You can replace this with an API call to save the report

        alert("your report has been submitted successfeully.");
        document.getElementById("reportForm").reset();
        document.getElementById("reportForm").classList.add("hidden");
    });
}
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

//Dark mode
// Check if dark mode was previously enabled
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    
}

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.modal.classList.toggle("dark-mode");

    // Save the preference in local storage
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});


// console.log(displayCriminals(criminals))
fetchCriminals();