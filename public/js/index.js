document
  .getElementById("create-space-button")
  .addEventListener("click", function () {
    const spaceId = document.getElementById("space-slug-input").value;
    window.location.href = `create/${spaceId}`;
  });
