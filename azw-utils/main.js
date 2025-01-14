document.getElementById("text-input").addEventListener("input", function () {
  // Get the text input value
  let inputText = document.getElementById("text-input").value;

  // Remove lines with no text (empty lines)
  let outputText = inputText
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");

  // Insert the cleaned text into the output textarea
  document.querySelector(".text-output textarea").value = outputText;
});

// Function to copy text to the clipboard and highlight it
function copyToClipboard() {
  let outputTextarea = document.querySelector(".text-output textarea");

  // Ensure the outputTextarea is a valid element
  if (outputTextarea) {
    let outputText = outputTextarea.value;

    // Highlight the text in the textarea
    outputTextarea.select();
    outputTextarea.setSelectionRange(0, outputText.length); // For mobile devices

    // Check if the Clipboard API is available
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(outputText)
        .then(function () {
          // Show the message
          document.getElementById("message").textContent = "Text Copied To Clipboard";

          // Clear the message after 2 seconds
          setTimeout(() => {
            document.getElementById("message").textContent = "";
          }, 3000);
        })
        .catch(function (err) {
          // Error handling in case clipboard API fails
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback to execCommand for browsers without Clipboard API support
      document.execCommand("copy");
      document.getElementById("message").textContent = "Text Copied To Clipboard";
    }
  }
}

// Adding the copy function to the click event in the output textarea
document.querySelector(".text-output textarea").addEventListener("click", function () {
  // Ensure the textarea element is selected
  if (this && this.select) {
    // Highlight the text in the textarea on click
    this.select();
    this.setSelectionRange(0, this.value.length); // For mobile devices
  }

  // Trigger copy to clipboard after selecting text
  copyToClipboard();
});
