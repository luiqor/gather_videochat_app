export const scrollToBottom = () => {
  let d = $(".space-chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

export const updateDropdown = (usernamesArray) => {
  const usernamesSelect = document.getElementById("usernames-select");
  usernamesSelect.innerHTML = "";

  let defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "Everyone";
  usernamesSelect.appendChild(defaultOption);

  usernamesArray.forEach((username) => {
    if (!username) return;
    let option = document.createElement("option");
    option.value = username;
    option.text = username;
    usernamesSelect.appendChild(option);
  });
};

export const sendMessage = (inputMssg, socket) => {
  const usersDropdown = document.getElementById("usernames-select");
  const receiver = usersDropdown ? usersDropdown.value : undefined;
  socket.emit(
    "message",
    inputMssg.value,
    SPACE_ID,
    receiver !== "" ? receiver : undefined
  );
  inputMssg.value = "";
};
