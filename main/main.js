function initDatastoreModal() {
  clearDatastoreModalMessage()
  setDatastoreModalFooterButtonsDisabled(false)
  setDatastoreModalSpinnerVisible(false)
  console.log("INIT DATASTORE")
}

function createDatastoreOnclick() {
  console.log("create datastore")

  setDatastoreModalSpinnerVisible(true)
  clearDatastoreModalMessage()
  setDatastoreModalFooterButtonsDisabled(true)

  createDatastoreRequest(createDatastoreRequestBody(), showSuccessMessage, showErrorMessage)
}

function createDatastoreRequestBody() {
  return {
    name: document.getElementById("datastore-name").value,
    type: document.getElementById("datastore-type").value
  }
}

function showSuccessMessage(json) {
  console.log("showSuccessMessage: " + json)
  setDatastoreModalMessage("Datastore created!", "success")
  setDatastoreModalSpinnerVisible(false)
  setTimeout(() => $('#newDatastoreModal').modal('hide'), 2000)
}

function showErrorMessage(message) {
  console.log("onerrormsg")
  setDatastoreModalMessage(message, "error")
  setDatastoreModalSpinnerVisible(false)
  setDatastoreModalFooterButtonsDisabled(false)
}

function setDatastoreModalFooterButtonsDisabled(disabled) {
  const footer = document.getElementById("datastoreModalFooter")
  const buttons = footer.getElementsByTagName("button")
  for (let button of buttons) {
    if (disabled) {
      button.setAttribute("disabled", "disabled")
    } else {
      button.removeAttribute("disabled")
    }
  }
}

function setDatastoreModalMessage(message, style) {
  const datastoreModalMessage = document.getElementById("datastoreModalMessage")
  if (style === "success") {
    datastoreModalMessage.style.color = "lime"
  } else if (style === "error") {
    datastoreModalMessage.style.color = "red"
  } else {
    datastoreModalMessage.style.color = "black"
  }
  datastoreModalMessage.innerHTML = message
}

function clearDatastoreModalMessage() {
  setDatastoreModalMessage("")
}

function setDatastoreModalSpinnerVisible(visible) {
  document.getElementById("createDatastoreModalSpinner").style.display = visible ? "block" : "none"
}

function deleteDatastoreOnclick() {
  console.log("delete datastore")
}

function createAppOnclick() {
  console.log("create app")
  deleteAppOnclick()
}

function redeployAppOnclick() {
  console.log("redeploy app")
}

function deleteAppOnclick() {
  console.log("delete app")
}
