function copyBackgroundColor(id) {
  // Get the element by its ID
  const element = document.getElementById(id);

  // Get the inline style of the element
  const inlineStyle = element.style.background;

  // Check if the background is a linear gradient
  const isLinearGradient = inlineStyle.includes("linear-gradient");

  let backgroundColor;

  if (isLinearGradient) {
    // If it's a linear gradient, keep the original style
    backgroundColor = inlineStyle;
  } else {
    // If it's a solid color, extract the color value
    backgroundColor = inlineStyle.replace("background: ", "");
  }

  // Convert RGB color values to hexadecimal notation
  backgroundColor = backgroundColor.replace(
    /rgb\((\d+), (\d+), (\d+)\)/g,
    (match, r, g, b) => {
      return (
        "#" +
        (+r).toString(16).padStart(2, "0") +
        (+g).toString(16).padStart(2, "0") +
        (+b).toString(16).padStart(2, "0")
      );
    }
  );

  // Copy the background color to the clipboard
  navigator.clipboard.writeText(backgroundColor);
}
