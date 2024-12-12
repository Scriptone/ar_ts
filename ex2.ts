"use strict";
/*
Author: Scriptone
Description: This code handles a floating draggable window in a web application. It uses Vue 3 Composition API to manage the window position and drag events.
created:  2024/12/12
*/
//The following code resides in a vue component but for the scope of this application this is not relevant
//Furthermore, there are undefined imports because I'm using an auto import extension in my editor, its also not relevant for the sophistication of this application
const modelValue = defineModel(); // Custom model binding, this model is passed down to the component (for context)
const draggable = useTemplateRef("draggable"); //This references the draggable element in the template
const initialPosition = localStorage.getItem("position")
  ? JSON.parse(localStorage.getItem("position"))
  : { x: 50, y: 50 }; // Initial position of the draggable window, we want it saved for UX purposes, users will likely want to keep the window at the previous location
// Ensure initial positions are within 10% to 90% of the screen width and height. This is to prevent the window from being completely out of view
initialPosition.x = Math.min(90, Math.max(10, initialPosition.x));
initialPosition.y = Math.min(90, Math.max(10, initialPosition.y));
const position = reactive(initialPosition); // Reactive position object to keep track of the window position
let isDragging = false;
let offset = { x: 0, y: 0 };
// Event handlers for dragging the window
const onMouseDown = (event) => {
  // Check if the draggable element is set and if the user is allowed to drag it
  isDragging = true;
  const currentX = (position.x / 100) * window.innerWidth;
  const currentY = (position.y / 100) * window.innerHeight;
  offset.x = event.clientX - currentX;
  offset.y = event.clientY - currentY;
  document.addEventListener("mousemove", onMouseMove); // Listen for mouse move events
  document.addEventListener("mouseup", onMouseUp); // Listen for mouse up events
};
const onMouseMove = (event) => {
  // If the user is not dragging or the draggable element is not set, return
  if (!(isDragging && draggable.value)) return;
  const newX = event.clientX - offset.x;
  const newY = event.clientY - offset.y;
  let xPercent = (newX / window.innerWidth) * 100;
  let yPercent = (newY / window.innerHeight) * 100;
  // Constrain positions to 10% - 90% for both x and y
  position.x = Math.min(90, Math.max(10, xPercent));
  position.y = Math.min(90, Math.max(10, yPercent));
  draggable.value.style.left = `${position.x}%`;
  draggable.value.style.top = `${position.y}%`;
};
const onMouseUp = () => {
  // Cleanup event listeners and save the new position to local storage
  isDragging = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  localStorage.setItem("position", JSON.stringify(position));
};
const close = () => {
  // Hide the draggable element when the close button is clicked (referenced from the unprovided template)
  draggable.value.style.setProperty("display", "none");
};
//When the component is mounted, set the initial position of the draggable element
onMounted(() => {
  if (!draggable.value) return;
  const currentX = (position.x / 100) * window.innerWidth;
  const currentY = (position.y / 100) * window.innerHeight;
  draggable.value.style.left = `${currentX}px`;
  draggable.value.style.top = `${currentY}px`;
});

return {
  modelValue,
  position,
  onMouseDown,
  close,
};
