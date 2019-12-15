const mainUrl = "http://localhost:8080"
const datastoreUrl = mainUrl + "/datastore"
const appUrl = mainUrl + "/app"

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

function appTypeToAppTypeName(databaseType) {
  return {
    "NODEJS": "Node.js",
  }[databaseType]
}

function appTypeNameToAppType(databaseType) {
  return {
    "Node.js": "NODEJS",
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

  let attachedAppsHtml = ""
  for (let app of datastoreResponseDto.attachedApps) {
    attachedAppsHtml += `<li><a href="#app=${app}">${app}</a></li>\n`
  }
  setElementContent("datastoreResponseAttachedApps", attachedAppsHtml)

  setElementVisible("noAttachedApps", datastoreResponseDto.attachedApps.length == 0)
  setElementVisible("datastoreContent", true)
  setElementVisible("mainContentErrorMessage", false)
}

function createHtmlLink(linkElementId, href) {
  return `<a href="${href}" id=${linkElementId}>${href}</a>`
}

function createHtmlLinkToGithubBranch(linkElementId, repoUrl, branch) {
  const urlToBranch = repoUrl + "/tree/" + branch
  return `<a href="${urlToBranch}" id=${linkElementId}>${branch}</a>`
}

function mapBooleanStringToCustomString(boolVal, trueMapping, falseMapping) {
  return {
    "true": trueMapping,
    "false": falseMapping,
  }[boolVal]
}

function fillAppInfo(appResponseDto) {
  setElementContent("appResponseName", appResponseDto.name)
  setElementContent("appResponseUuid", appResponseDto.appUuid)
  setElementContent("appResponseType", appTypeToAppTypeName(appResponseDto.type))
  setElementContent("appResponseCreatedAt", new Date(appResponseDto.createdAt).toLocaleString("PL"))
  setElementContent("appResponseSourceRepoUrl", createHtmlLink("sourceRepoUrlLink", appResponseDto.sourceRepoUrl))
  setElementContent("appResponseSourceBranchName", createHtmlLinkToGithubBranch("sourceBranchName", appResponseDto.sourceRepoUrl, appResponseDto.sourceBranchName))
  setElementContent("appResponseSourceCommitHash", appResponseDto.commitHash)
  setElementContent("appResponseAutodeployEnabled", mapBooleanStringToCustomString(appResponseDto.autodeployEnabled, "enabled", "disabled"))
  setElementContent("appResponseStatus", appResponseDto.status)

  const htmlLinkToDatastore = `<a href="#datastore=${appResponseDto.datastoreUuid}" id='datastoreUuidLink'>${appResponseDto.datastoreUuid}</a>`
  setElementContent("appResponseDatastoreUuid", appResponseDto.datastoreUuid != null ? htmlLinkToDatastore : "none")

  setElementVisible("appContent", true)
  setElementVisible("mainContentErrorMessage", false)
}

function setMainContentErrorMessage(message) {
  document.getElementById("mainContentErrorMessage").innerHTML = message
  setElementVisible("mainContentErrorMessage", true)
}

function initDatastoreInfo(datastoreUuid) {
  getRequest(datastoreUrl + "/" + datastoreUuid, fillDatastoreInfo, setMainContentErrorMessage)
}

function initAppInfo(appUuid) {
  getRequest(appUrl + "/" + appUuid, fillAppInfo, setMainContentErrorMessage)
}

function setDropdownItemsInNavbar(hrefPrefix, dropdownListId, items) {
  let dropdownListHtml = ""
  for (let item of items) {
    dropdownListHtml += `<a class="dropdown-item" href="#${hrefPrefix}=${item.uuid}" onclick="updateWindowLocation('#${hrefPrefix}=${item.uuid}')">${item.name}</a>\n`
  }
  document.getElementById(dropdownListId).innerHTML = dropdownListHtml
}

function setDatastoreDropdownItems(items) {
  setDropdownItemsInNavbar("datastore", "datastore-dropdown-list", items)
}

function setAppDropdownItems(items) {
  setDropdownItemsInNavbar("app", "app-dropdown-list", items)
}

function initDatastoreDropdown() {
  getRequest(datastoreUrl, setDatastoreDropdownItems, () => console.log("Request for list of datastores failed"))
}

function initAppDropdown() {
  getRequest(appUrl, setAppDropdownItems, () => console.log("Request for list of apps failed"))
}

function initDatastoreModal() {
  clearModalMessage("datastoreModalMessage")
  setModalFooterButtonsDisabled("datastoreModalFooter", false)
  setElementVisible("createDatastoreModalSpinner", false)
  console.log("INIT DATASTORE")
}

function clearElementContent(elementId) {
  setElementContent(elementId, "")
}

function getInnerHtml(elementId) {
  return document.getElementById(elementId).innerHTML
}

function clearAppModalForm() {
  clearElementContent("app-name")
  clearElementContent("app-sourceRepoUrl")
  clearElementContent("app-sourceBranchName")
  clearElementContent("app-commitHash")
  document.getElementById("app-autodeployEnabled").checked = false
}

function fillAppModalFormWithCurrentAppValues() {
  document.getElementById("appModalActionButton").onclick = redeployAppOnclick
  document.getElementById("app-name").value = getInnerHtml("appResponseName")
  document.getElementById("app-type").value = appTypeNameToAppType(getInnerHtml("appResponseType"))
  document.getElementById("app-sourceRepoUrl").value = getInnerHtml("sourceRepoUrlLink")
  document.getElementById("app-sourceBranchName").value = getInnerHtml("sourceBranchName")
  document.getElementById("app-autodeployEnabled").checked = getInnerHtml("appResponseAutodeployEnabled") == "enabled"
  document.getElementById("app-commitHash").value = getInnerHtml("appResponseSourceCommitHash")

  let datastoreUuid = "";
  const datastoreLinkUuid = document.getElementById("datastoreUuidLink");
  if (datastoreLinkUuid != null) {
    datastoreUuid = datastoreLinkUuid.innerHTML
  }
  document.getElementById("app-datastoreUuid").value = datastoreUuid
}

function initAppModal(actionType) {
  console.log("INIT APP")

  clearModalMessage("appModalMessage")
  setModalFooterButtonsDisabled("appModalFooter", false)
  setElementVisible("createAppModalSpinner", false)

  clearAppModalForm()

  if (actionType == "new") {
    setElementContent("appModalTitle", "New app")
    setElementContent("appModalActionButton", "Create")
    document.getElementById("appModalActionButton").onclick = createAppOnclick
  }

  if (actionType == "redeploy") {
    setElementContent("appModalTitle", "Redeploy " + document.getElementById("appResponseName").innerHTML)
    setElementContent("appModalActionButton", "Redeploy")
    fillAppModalFormWithCurrentAppValues()
  }
}

function createDatastoreOnclick() {
  console.log("create datastore")

  setElementVisible("createDatastoreModalSpinner", true)
  clearModalMessage("datastoreModalMessage")
  setModalFooterButtonsDisabled("datastoreModalFooter", true)

  postRequest(datastoreUrl, createDatastoreRequestBody(), showDatastoreModalSuccessMessage, showDatastoreModalErrorMessage)
}

function createDatastoreRequestBody() {
  return JSON.stringify({
    name: document.getElementById("datastore-name").value,
    type: document.getElementById("datastore-type").value
  })
}

function nullIfEmpty(string) {
  return string === "" ? null : string
}

function createAppRequestBody() {
  return JSON.stringify({
    name: document.getElementById("app-name").value,
    type: document.getElementById("app-type").value,
    sourceRepoUrl: document.getElementById("app-sourceRepoUrl").value,
    sourceBranchName: document.getElementById("app-sourceBranchName").value,
    autodeployEnabled: document.getElementById("app-autodeployEnabled").checked,
    commitHash: nullIfEmpty(document.getElementById("app-commitHash").value),
    datastoreUuid: nullIfEmpty(document.getElementById("app-datastoreUuid").value),
  })
}

function showModalSuccessMessage(json, modalId, messageId, message, spinnerId) {
  console.log("showDatastoreSuccessMessage: " + json)
  setModalMessage(messageId, message, "success")
  setElementVisible(spinnerId, false)
  setTimeout(() => $("#" + modalId).modal("hide"), 2000)
}

function showModalErrorMessage(message, messageId, spinnerId, footerId) {
  console.log("onerrormsg datastore " + message)
  const formattedeMessage = message.replace(/\n/g, "<br>")
  setModalMessage(messageId, formattedeMessage, "error")
  setElementVisible(spinnerId, false)
  setModalFooterButtonsDisabled(footerId, false)
}

function showDatastoreModalSuccessMessage(json) {
  showModalSuccessMessage(json, "newDatastoreModal", "datastoreModalMessage", "Datastore created!", "createDatastoreModalSpinner")
}

function showDatastoreModalErrorMessage(message) {
  showModalErrorMessage(message, "datastoreModalMessage", "createDatastoreModalSpinner", "datastoreModalFooter")
}

function showAppModalSuccessMessage(json) {
  showModalSuccessMessage(json, "newOrRedeployAppModal", "appModalMessage", "App created!", "createAppModalSpinner")
}

function showAppRedeployModalSuccessMessage(json) {
  showModalSuccessMessage(json, "newOrRedeployAppModal", "appModalMessage", "App redeployed!", "createAppModalSpinner")
}

function showAppModalErrorMessage(message) {
  showModalErrorMessage(message, "appModalMessage", "createAppModalSpinner", "appModalFooter")
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

  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setModalFooterButtonsDisabled("appModalFooter", true)

  postRequest(appUrl, createAppRequestBody(), showAppModalSuccessMessage, showAppModalErrorMessage)
}

function createAppOnclick() {
  console.log("create app")

  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setModalFooterButtonsDisabled("appModalFooter", true)

  postRequest(appUrl, createAppRequestBody(), showAppModalSuccessMessage, showAppModalErrorMessage)
}

function redeployAppOnclick() {
  console.log("redeploy app")
  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setModalFooterButtonsDisabled("appModalFooter", true)

  const currentAppUuid = document.getElementById("appResponseUuid").innerHTML
  const redeployUrl = appUrl + "/" + currentAppUuid + "/redeploy"

  postRequest(redeployUrl, createAppRequestBody(), showAppRedeployModalSuccessMessage, showAppModalErrorMessage)
}

function deleteAppOnclick() {
  console.log("delete app")
}
