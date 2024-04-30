const invalidSpaceMessage = document.getElementById("invalid-space-message");
const spaceSlugInput = document.getElementById("space-slug-input");

document.getElementById("create-space-button").addEventListener("click", () => {
  const spaceId = spaceSlugInput.value;
  if (!/^(\w+-\w+-\w+)$/.test(spaceId) || spaceId.length < 5) {
    invalidSpaceMessage.textContent =
      "Invalid spaceId format. It should consist of three words separated by hyphens.";
    return;
  }
  window.location.href = `create/${spaceId}`;
});

spaceSlugInput.addEventListener("input", () => {
  invalidSpaceMessage.textContent = "";
});
