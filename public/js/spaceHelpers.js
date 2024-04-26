export const scrollToBottom = () => {
  let d = $(".space-chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

export const updateDropdown = (usernamesArray) => {
  const usernamesSelect = document.getElementById("usernames-select");
  usernamesSelect.innerHTML = "";

  usernamesArray.forEach((username) => {
    if (!username) return;
    let option = document.createElement("option");
    option.value = username;
    option.text = username;
    usernamesSelect.appendChild(option);
  });
};
