const datastoreUrl = "http://localhost:8080/datastore"

function updateWindowLocation(datastoreUuid) {
  window.location.href = datastoreUuid
  window.location.reload(false)
}

function formatDatabaseTypeName(databaseType) {
  return {
    "POSTGRESQL": "PostgreSQL",
    "MYSQL": "MySQL",
    "MARIADB": "MariaDB"
  }[databaseType]
}

function setElementContent(elementId, innerHtml) {
  document.getElementById(elementId).innerHTML = innerHtml

}

function fillDatastoreInfo(datastoreResponseDto) {
  setElementContent("datastoreResponseName", "Datastore " + datastoreResponseDto.name)
  setElementContent("datastoreResponseUuid", datastoreResponseDto.uuid)
  setElementContent("datastoreResponseType", formatDatabaseTypeName(datastoreResponseDto.type))
  setElementContent("datastoreResponseCreatedAt", new Date(datastoreResponseDto.createdAt).toLocaleString("PL"))
  setElementContent("datastoreResponseStatus", datastoreResponseDto.status)

  let attachedAppsHtml = "";
  for (let app of datastoreResponseDto.attachedApps) {
    attachedAppsHtml += `<li><a href="#app=${app}">${app}</a></li>\n`
  }
  setElementContent("datastoreResponseAttachedApps", attachedAppsHtml)

  setElementVisible("noAttachedApps", datastoreResponseDto.attachedApps.length == 0)
  setElementVisible("datastoreContent", true)
  setElementVisible("mainContentErrorMessage", false)
}

function setMainContentErrorMessage(message) {
  document.getElementById("mainContentErrorMessage").innerHTML = message;
  setElementVisible("mainContentErrorMessage", true)
}

function initDatastoreInfo(datastoreUuid) {
  getRequest(datastoreUrl + "/" + datastoreUuid, fillDatastoreInfo, setMainContentErrorMessage)
}

function setDropdownItemsInNavbar(dropdownListId, items) {
  let dropdownListHtml = ""
  for (let item of items) {
    dropdownListHtml += `<a class="dropdown-item" href="#datastore=${item.uuid}" onclick="updateWindowLocation('#datastore=${item.uuid}')">${item.name}</a>\n`
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
  setElementVisible("createDatastoreModalSpinner", false)
  console.log("INIT DATASTORE")
}

function createDatastoreOnclick() {
  console.log("create datastore")

  setElementVisible("createDatastoreModalSpinner", true)
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
  setElementVisible("createDatastoreModalSpinner", false)
  setTimeout(() => $('#newDatastoreModal').modal('hide'), 2000)
}

function showErrorMessage(message) {
  console.log("onerrormsg")
  setModalMessage("datastoreModalMessage", message, "error")
  setElementVisible("createDatastoreModalSpinner", false)
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

function setElementVisible(spinnerId, visible) {
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
