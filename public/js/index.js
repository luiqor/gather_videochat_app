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

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const date = now.toLocaleDateString(undefined, options);
  const time =
    now.getHours().toString().padStart(2, "0") +
    " : " +
    now.getMinutes().toString().padStart(2, "0");

  document.getElementById("date").textContent = date;
  document.getElementById("time").textContent = time;
}

window.onload = () => {
  updateDateTime();
  setInterval(updateDateTime, 60000);
};
