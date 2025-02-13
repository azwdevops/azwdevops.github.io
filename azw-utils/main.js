let currentMode = "removeNewLines";
let pages = [];
let currentPage = 0;

function setMode(mode, clickedItem) {
  if (mode === "splitPages") {
    document.getElementById("set-character-limit").classList.remove("hide");
  } else {
    document.getElementById("set-character-limit").classList.add("hide");
  }
  currentMode = mode;
  document.getElementById("text-input").value = "";
  document.getElementById("text-output").value = "";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("char-count").textContent = "Character Count: 0";
  pages = [];
  currentPage = 0;

  // Get all li items within the ul
  const listItems = document.querySelectorAll(".utils-list li");

  // Remove the active class from all li items
  listItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Add the active class to the clicked li
  clickedItem.classList.add("active");
}

document.getElementById("text-input").addEventListener("input", function () {
  let inputText = this.value;
  let outputText = inputText
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
  document.getElementById("char-count").textContent = `Character Count: ${outputText.length}`;
  let charLimit = parseInt(document.getElementById("char-limit").value, 10) || 3000;

  if (currentMode === "removeNewLines") {
    document.getElementById("text-output").value = outputText;
  } else if (currentMode === "splitPages") {
    pages = splitTextIntoPages(outputText.replace(/\n/g, ""), charLimit);
    currentPage = 0;
    displayPage();
  }
});

function splitTextIntoPages(text, charLimit) {
  let result = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + charLimit, text.length);
    if (end < text.length) {
      let lastPeriod = text.lastIndexOf(".", end);
      if (lastPeriod > start) {
        end = lastPeriod + 1;
      }
    }
    result.push(text.substring(start, end).trim());
    start = end;
  }
  return result;
}

function displayPage() {
  if (pages.length > 0) {
    document.getElementById("text-output").value = pages[currentPage];
    document.getElementById("char-count").textContent = `Character Count: ${pages[currentPage].length}`;
    updatePagination();
  } else {
    document.getElementById("text-output").value = "";
    document.getElementById("pagination").innerHTML = "";
  }
}

function updatePagination() {
  let pagination = document.getElementById("pagination");
  pagination.innerHTML = `Page ${currentPage + 1} of ${pages.length} `;
  if (pages.length > 1) {
    pagination.innerHTML += `<button onclick="prevPage()">Prev</button>`;
    pagination.innerHTML += `<button onclick="nextPage()">Next</button>`;
  }
}

function nextPage() {
  if (currentPage < pages.length - 1) {
    currentPage++;
    displayPage();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    displayPage();
  }
}

document.getElementById("text-output").addEventListener("click", function () {
  this.select();
  navigator.clipboard.writeText(this.value).then(() => {
    document.getElementById("message").textContent = "Text Copied To Clipboard";
    setTimeout(() => (document.getElementById("message").textContent = ""), 2000);
  });
});
