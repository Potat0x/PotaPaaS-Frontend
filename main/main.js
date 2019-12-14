const datastoreUrl = "http://localhost:8080/datastore"

function setDropdownItemsInNavbar(dropdownListId, items) {
  let dropdownListHtml = ""
  for (let item of items) {
    dropdownListHtml += `<a class="dropdown-item" href="#${item.uuid}">${item.name}</a>\n`
  }
  document.getElementById(dropdownListId).innerHTML = dropdownListHtml
}

function setDatastoreDropdownItems(items) {
  setDropdownItemsInNavbar("datastore-dropdown-list", items)
}

function initDatastoreDropdown() {
  getRequest(datastoreUrl, setDatastoreDropdownItems, () => console.log("Request for list of datastores failed"))
}

function initDatastoreModal() {
  clearModalMessage("datastoreModalMessage")
  setModalFooterButtonsDisabled("datastoreModalFooter", false)
  setSpinnerVisible("createDatastoreModalSpinner", false)
  console.log("INIT DATASTORE")
}

function createDatastoreOnclick() {
  console.log("create datastore")

  setSpinnerVisible("createDatastoreModalSpinner", true)
  clearModalMessage("datastoreModalMessage")
  setModalFooterButtonsDisabled("datastoreModalFooter", true)

  postRequest(datastoreUrl, createDatastoreRequestBody(), showSuccessMessage, showErrorMessage)
}

function createDatastoreRequestBody() {
  return JSON.stringify({
    name: document.getElementById("datastore-name").value,
    type: document.getElementById("datastore-type").value
  })
}

function showSuccessMessage(json) {
  console.log("showSuccessMessage: " + json)
  setModalMessage("datastoreModalMessage", "Datastore created!", "success")
  setSpinnerVisible("createDatastoreModalSpinner", false)
  setTimeout(() => $('#newDatastoreModal').modal('hide'), 2000)
}

function showErrorMessage(message) {
  console.log("onerrormsg")
  setModalMessage("datastoreModalMessage", message, "error")
  setSpinnerVisible("createDatastoreModalSpinner", false)
  setModalFooterButtonsDisabled("datastoreModalFooter", false)
}

function setModalFooterButtonsDisabled(moodalFooterId, disabled) {
  const footer = document.getElementById(moodalFooterId)
  const buttons = footer.getElementsByTagName("button")
  for (let button of buttons) {
    if (disabled) {
      button.setAttribute("disabled", "disabled")
    } else {
      button.removeAttribute("disabled")
    }
  }
}

function setModalMessage(messageElementId, message, style) {
  const modalMessage = document.getElementById(messageElementId)
  if (style === "success") {
    modalMessage.style.color = "lime"
  } else if (style === "error") {
    modalMessage.style.color = "red"
  } else {
    modalMessage.style.color = "black"
  }
  modalMessage.innerHTML = message
}

function clearModalMessage(messageElementId) {
  setModalMessage(messageElementId, "")
}

function setSpinnerVisible(spinnerId, visible) {
  document.getElementById(spinnerId).style.display = visible ? "block" : "none"
}

function deleteDatastoreOnclick() {
  console.log("delete datastore")
}

function createAppOnclick() {
  console.log("create app")
}

function redeployAppOnclick() {
  console.log("redeploy app")
}

function deleteAppOnclick() {
  console.log("delete app")
}
