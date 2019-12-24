const mainUrl = "http://localhost:8080"
const datastoreUrl = mainUrl + "/datastore"
const appUrl = mainUrl + "/app"
const userUrl = mainUrl + "/user"
const loginUrl = mainUrl + "/login"

function updateWindowLocationAndReload(href) {
  window.location.href = href
  refreshPage()
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

function fillUserInfo(userResponseDto) {
  setElementContent("userResponseName", userResponseDto.username)
  setElementContent("userResponseEmail", userResponseDto.email)
  setElementContent("userResponseCreatedAt", new Date(userResponseDto.createdAt).toLocaleString("PL"))

  setElementVisible("userContent", true)
  setElementVisible("mainContentErrorMessage", false)
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
  document.getElementById("webhookSecretField").value = appResponseDto.webhookSecret

  const htmlLinkToDatastore = `<a href="#datastore=${appResponseDto.datastoreUuid}" id='datastoreUuidLink'>${appResponseDto.datastoreUuid}</a>`
  setElementContent("appResponseDatastoreUuid", appResponseDto.datastoreUuid != null ? htmlLinkToDatastore : "none")

  setElementVisible("appContent", true)
  setElementVisible("mainContentErrorMessage", false)

  console.log(appResponseDto.appUuid)
  refreshLogs()
}

function refreshMainContentErrorMessage(message) {
  document.getElementById("mainContentErrorMessage").innerHTML = message
  setElementVisible("mainContentErrorMessage", true)
}

function initDatastoreInfo(datastoreUuid) {
  getRequest(datastoreUrl + "/" + datastoreUuid, fillDatastoreInfo, refreshMainContentErrorMessage)
}

function initAppInfo(appUuid) {
  getRequest(appUrl + "/" + appUuid, fillAppInfo, refreshMainContentErrorMessage)
}

function initUserInfo() {
  getRequest(userUrl + "/" + spaState.username, fillUserInfo, refreshMainContentErrorMessage)
}

function setDropdownItemsInNavbar(hrefPrefix, dropdownListId, items) {
  let dropdownListHtml = ""
  for (let item of items) {
    dropdownListHtml += `<a class="dropdown-item" href="#${hrefPrefix}=${item.uuid}" onclick="updateWindowLocationAndReload('#${hrefPrefix}=${item.uuid}')">${item.name}</a>\n`
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
  setButtonsInsideDivDisabled("datastoreModalFooter", false)
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

  let datastoreUuid = ""
  const datastoreLinkUuid = document.getElementById("datastoreUuidLink")
  if (datastoreLinkUuid != null) {
    datastoreUuid = datastoreLinkUuid.innerHTML
  }
  document.getElementById("app-datastoreUuid").value = datastoreUuid
}

function initAppModal(actionType) {
  clearModalMessage("appModalMessage")
  setButtonsInsideDivDisabled("appModalFooter", false)
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
  setElementVisible("createDatastoreModalSpinner", true)
  clearModalMessage("datastoreModalMessage")
  setButtonsInsideDivDisabled("datastoreModalFooter", true)

  postRequest(datastoreUrl, createDatastoreRequestBody(), createDatastoreSuccessHandler, showDatastoreModalErrorMessage)
}

function createDatastoreSuccessHandler(json) {
  showDatastoreModalSuccessMessage(json)
  updateWindowLocationAndReload("#datastore=" + json.uuid)
}

function createAppSuccessHandler(json) {
  showAppModalSuccessMessage(json)
  updateWindowLocationAndReload("#app=" + json.appUuid)
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
  if (spinnerId != undefined) {
    setElementVisible(spinnerId, false)
  }
  setTimeout(() => $("#" + modalId).modal("hide"), 2000)
}

function showModalErrorMessage(message, messageId, spinnerId, footerId) {
  console.log("onerrormsg datastore " + message + ", element = " + messageId)
  const formattedeMessage = message.replace(/\n/g, "<br>")
  setModalMessage(messageId, formattedeMessage, "error")
  if (spinnerId != undefined) {
    setElementVisible(spinnerId, false)
  }
  if (footerId != undefined) {
    setButtonsInsideDivDisabled(footerId, false)
  }
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

function setButtonsInsideDivDisabled(moodalFooterId, disabled) {
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

function createAppOnclick() {
  console.log("create app")

  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setButtonsInsideDivDisabled("appModalFooter", true)

  postRequest(appUrl, createAppRequestBody(), createAppSuccessHandler, showAppModalErrorMessage)
}

function redeployAppOnclick() {
  console.log("redeploy app")
  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setButtonsInsideDivDisabled("appModalFooter", true)

  const currentAppUuid = document.getElementById("appResponseUuid").innerHTML
  const redeployUrl = appUrl + "/" + currentAppUuid + "/redeploy"

  postRequest(redeployUrl, createAppRequestBody(), redeployAppSuccessHandler, showAppModalErrorMessage)
}

function redeployAppSuccessHandler(json) {
  showAppRedeployModalSuccessMessage(json)
  refreshMainContent()
}

function addClassToElement(elementId, className) {
  document.getElementById(elementId).classList.add(className)
}

function removeClassFromElement(elementId, className) {
  document.getElementById(elementId).classList.remove(className)
}

function setOperationResultAlertStyle(style) {
  if (style === "success") {
    addClassToElement("operationResultAlert", "alert-success")
    removeClassFromElement("operationResultAlert", "alert-danger")
  } else if (style === "error") {
    addClassToElement("operationResultAlert", "alert-danger")
    removeClassFromElement("operationResultAlert", "alert-success")
  } else {
    addClassToElement("operationResultAlert", "alert-dark")
    removeClassFromElement("operationResultAlert", "alert-danger")
    removeClassFromElement("operationResultAlert", "alert-success")
  }
}

function showOperationResultAlert(message, style) {
  setElementContent("operationResultAlertMessage", message)
  setOperationResultAlertStyle(style)

  $("#operationResultAlert").show()
}

function showAppDeleteSuccessAlert() {
  showOperationResultAlert("App deleted!", "success")
}

function showAppDeleteErrorAlert(errorMessage) {
  showOperationResultAlert(errorMessage, "error")
}

function appDeleteSuccessHandler() {
  setButtonsInsideDivDisabled("appContentButtons", true)
  showAppDeleteSuccessAlert()
  initAppDropdown()
}

function deleteAppOnclick() {
  const currentAppUuid = document.getElementById("appResponseUuid").innerHTML
  const currentAppUrl = appUrl + "/" + currentAppUuid
  deleteRequest(currentAppUrl, appDeleteSuccessHandler, showAppDeleteErrorAlert)
}

function showDatastoreDeleteSuccessAlert() {
  showOperationResultAlert("Datastore deleted!", "success")
}

function datastoreDeleteSuccessHandler() {
  setButtonsInsideDivDisabled("datastoreContentButtons", true)
  showDatastoreDeleteSuccessAlert()
  initDatastoreDropdown()
}

function showDatastoreDeleteErrorAlert(errorMessage) {
  showOperationResultAlert(errorMessage, "error")
}

function setConfirmationModalAction(func) {
  document.getElementById("deleting-confirmation-yes").onclick = func
}

function prepareConfirmationModalForDeletingDatastore() {
  setConfirmationModalAction(deleteDatastoreOnclick)
}

function prepareConfirmationModalForDeletingApp() {
  setConfirmationModalAction(deleteAppOnclick)
}

function deleteDatastoreOnclick() {
  const currentDatastoreUuid = document.getElementById("datastoreResponseUuid").innerHTML
  const currentDatastoreUrl = datastoreUrl + "/" + currentDatastoreUuid
  deleteRequest(currentDatastoreUrl, datastoreDeleteSuccessHandler, showDatastoreDeleteErrorAlert)
}

function hideOperationResultAlert() {
  setElementVisible("operationResultAlert", false)
}

function fillLogs(logs) {
  setElementContent("logsText", logs.text)
}

function refreshLogs() {
  const currentAppUuid = document.getElementById("appResponseUuid").innerHTML
  getRequest(appUrl + "/" + currentAppUuid + "/logs", fillLogs, refreshMainContentErrorMessage)
}

function hideWebhookSecret() {
  removeClassFromElement("webhookSecretVisibilityButton", "fa-eye")
  addClassToElement("webhookSecretVisibilityButton", "fa-eye-slash")
  setElementType("webhookSecretField", "password")
}

function revealWebhookSecret() {
  addClassToElement("webhookSecretVisibilityButton", "fa-eye")
  removeClassFromElement("webhookSecretVisibilityButton", "fa-eye-slash")
  setElementType("webhookSecretField", "text")
}

function webhookSecretVisibilityButtonOnclick() {
  if (document.getElementById("webhookSecretField").type === "password") {
    revealWebhookSecret()
  } else {
    hideWebhookSecret()
  }
}

function setElementType(elementId, type) {
  document.getElementById(elementId).type = type
}

function initWebhookSecretModal() {
  clearModalMessage("webhookSecretModalMessage")
}

function clearInputElement(elementId) {
  document.getElementById(elementId).value = ""
}

function initChangePasswordModal() {
  clearModalMessage("changePasswordModalMessage")
  clearInputElement("current-password")
  clearInputElement("new-password")
  clearInputElement("confirm-password")
}

function changeWebhookSecretOnclick() {
  const currentAppUuid = document.getElementById("appResponseUuid").innerHTML
  postRequest(appUrl + "/" + currentAppUuid + "/change-webhook-secret", changeWebhookSecretRequestBody(), changeWebhookSecretSuccessHandler, showWebhookModalErrorMessage)
}

function changeWebhookSecretRequestBody() {
  return JSON.stringify({
    secret: document.getElementById("webhook-secret").value
  })
}

function changeWebhookSecretSuccessHandler(json) {
  showWebhookModalSuccessMessage(json)
  updateWindowLocationAndReload("#app=" + json.appUuid)
}

function showWebhookModalSuccessMessage(json) {
  showModalSuccessMessage(json, "changeWebhookSecretModal", "webhookSecretModalMessage", "Secret changed!")
}

function showWebhookModalErrorMessage(message) {
  showModalErrorMessage(message, "webhookSecretModalMessage")
}

function checkIfNewPasswordAndConfirmPasswordFieldsAreEquals() {
  return document.getElementById("new-password").value === document.getElementById("confirm-password").value
}

function changePasswordOnclick() {
  if (checkIfNewPasswordAndConfirmPasswordFieldsAreEquals()) {
    const changePasswordUrl = userUrl + "/" + spaState.username + "/password"
    postRequest(changePasswordUrl, changePasswordRequestBody(), showChangePasswordModalSuccessMessage, showChangePasswordModalErrorMessage)
  } else {
    showModalErrorMessage("Entered password are not the same", "changePasswordModalMessage")
  }
}

function showChangePasswordModalSuccessMessage(json) {
  showModalSuccessMessage(json, "changePasswordModal", "changePasswordModalMessage", "Password changed!")
}

function showChangePasswordModalErrorMessage(message) {
  showModalErrorMessage(message, "changePasswordModalMessage")
}

function changePasswordRequestBody() {
  return JSON.stringify({
    currentPassword: document.getElementById("current-password").value,
    newPassword: document.getElementById("new-password").value
  })
}

function showPageContentIfAuthorizedOrElseShowLoginScreen(whenAuthorized, whenNotAuthorized) {
  getRequest(userUrl + "/" + spaState.username, whenAuthorized, whenNotAuthorized)
}

function logInOnclick() {
  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value
  loginRequest(loginUrl, username, password, loginSuccessHandler, loginErrorHandler)
}

function loginSuccessHandler(username, authToken) {
  setUsernameAndToken(username, authToken)
  refreshPage()
}

function loginErrorHandler(errorMessage) {
  setElementContent("loginFailedMessage", errorMessage)
  setElementVisible("loginFailedMessage", true)
}

function logout() {
  destroySpaState()
  refreshPage()
}