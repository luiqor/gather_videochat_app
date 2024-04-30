document
  .getElementById("join-space-button")
  .addEventListener("click", function () {
    const spaceId = document.getElementById("space-slug-input").value;
    window.location.href = `${spaceId}`;
  });
