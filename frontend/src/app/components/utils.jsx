

export const showAlert = (alertText) => {

    const messageDiv = document.createElement('div');
    messageDiv.textContent = alertText;
    messageDiv.className = "fixed top-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 text-sm lg-p6 lg:text-md  bg-[#D7D7EA] text-[#242F5C] rounded-2xl shadow-lg z-50"; // Tailwind classes
    document.body.appendChild(messageDiv); // Add the message div to the body

    // Hide the message after 2 seconds
    setTimeout(() => {
      messageDiv.remove(); // Remove the div from the DOM
    }, 2000);
}