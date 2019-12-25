function fillDatastoreInfo(datastoreResponseDto) {
  setElementContent("datastoreResponseName", datastoreResponseDto.name)
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
  setElementValue("webhookSecretField", appResponseDto.webhookSecret)

  const htmlLinkToDatastore = `<a href="#datastore=${appResponseDto.datastoreUuid}" id='datastoreUuidLink'>${appResponseDto.datastoreUuid}</a>`
  setElementContent("appResponseDatastoreUuid", appResponseDto.datastoreUuid != null ? htmlLinkToDatastore : "none")

  setElementVisible("appContent", true)
  setElementVisible("mainContentErrorMessage", false)

  console.log(appResponseDto.appUuid)
  refreshLogs()
}

function refreshMainContentErrorMessage(message) {
  setElementContent("mainContentErrorMessage", message)
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
    dropdownListHtml += `<a class="dropdown-item" href="#${hrefPrefix}=${item.uuid}" onclick="setWindowLocation('#${hrefPrefix}=${item.uuid}')">${item.name}</a>\n`
  }
  setElementContent(dropdownListId, dropdownListHtml)
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
  clearInputElement("datastore-name")
  setButtonsInsideDivDisabled("datastoreModalFooter", false)
  setElementVisible("createDatastoreModalSpinner", false)
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
  setElementValue("app-name", getInnerHtml("appResponseName"))
  setElementValue("app-type", appTypeNameToAppType(getInnerHtml("appResponseType")))
  setElementValue("app-sourceRepoUrl", getInnerHtml("sourceRepoUrlLink"))
  setElementValue("app-sourceBranchName", getInnerHtml("sourceBranchName"))
  document.getElementById("app-autodeployEnabled").checked = getInnerHtml("appResponseAutodeployEnabled") == "enabled"
  setElementValue("app-commitHash", getInnerHtml("appResponseSourceCommitHash"))
  const datastoreUuid = document.getElementById("datastoreUuidLink") != null ? getInnerHtml("datastoreUuidLink") : ""
  setElementValue("app-datastoreUuid", datastoreUuid)
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
    setElementContent("appModalTitle", "Redeploy " + getInnerHtml("appResponseName"))
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
  setWindowLocation("#datastore=" + json.uuid)
}

function createAppSuccessHandler(json) {
  showAppModalSuccessMessage(json)
  setWindowLocation("#app=" + json.appUuid)
}

function showModalSuccessMessage(json, modalId, messageId, message, spinnerId) {
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

function createAppOnclick() {
  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setButtonsInsideDivDisabled("appModalFooter", true)

  postRequest(appUrl, createAppRequestBody(), createAppSuccessHandler, showAppModalErrorMessage)
}

function redeployAppOnclick() {
  setElementVisible("createAppModalSpinner", true)
  clearModalMessage("appModalMessage")
  setButtonsInsideDivDisabled("appModalFooter", true)
  postRequest(redeployUrl(getInnerHtml("appResponseUuid")), createAppRequestBody(), redeployAppSuccessHandler, showAppModalErrorMessage)
}

function redeployAppSuccessHandler(json) {
  showAppRedeployModalSuccessMessage(json)
  refreshMainContent()
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
  const currentAppUuid = getInnerHtml("appResponseUuid")
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
  const currentDatastoreUrl = datastoreUrl + "/" + getInnerHtml("datastoreResponseUuid")
  deleteRequest(currentDatastoreUrl, datastoreDeleteSuccessHandler, showDatastoreDeleteErrorAlert)
}

function hideOperationResultAlert() {
  setElementVisible("operationResultAlert", false)
}

function fillLogs(logs) {
  setElementContent("logsText", logs.text)
}

function refreshLogs() {
  getRequest(logsUrl(getInnerHtml("appResponseUuid")), fillLogs, refreshMainContentErrorMessage)
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

function initWebhookSecretModal() {
  clearModalMessage("webhookSecretModalMessage")
}

function initChangePasswordModal() {
  clearModalMessage("changePasswordModalMessage")
  clearInputElement("current-password")
  clearInputElement("new-password")
  clearInputElement("confirm-password")
}

function changeWebhookSecretOnclick() {
  postRequest(changeWebhookSecretUrl(getInnerHtml("appResponseUuid")), changeWebhookSecretRequestBody(), changeWebhookSecretSuccessHandler, showWebhookModalErrorMessage)
}

function changeWebhookSecretSuccessHandler(json) {
  showWebhookModalSuccessMessage(json)
  setWindowLocation("#app=" + json.appUuid)
}

function showWebhookModalSuccessMessage(json) {
  showModalSuccessMessage(json, "changeWebhookSecretModal", "webhookSecretModalMessage", "Secret changed!")
}

function showWebhookModalErrorMessage(message) {
  showModalErrorMessage(message, "webhookSecretModalMessage")
}

function checkIfNewPasswordAndConfirmPasswordFieldsAreEquals() {
  return getElementValue("new-password") === getElementValue("confirm-password")
}

function changePasswordOnclick() {
  if (checkIfNewPasswordAndConfirmPasswordFieldsAreEquals()) {
    postRequest(changePasswordUrl(spaState.username), changePasswordRequestBody(), showChangePasswordModalSuccessMessage, showChangePasswordModalErrorMessage)
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

function showPageContentIfAuthorizedOrElseShowLoginScreen(whenAuthorized, whenNotAuthorized) {
  getRequest(userUrl + "/" + spaState.username, whenAuthorized, whenNotAuthorized)
}

function logInOnclick() {
  const username = getElementValue("login-username")
  const password = getElementValue("login-password")
  loginRequest(loginUrl, username, password, loginSuccessHandler, loginErrorHandler)
}

function loginSuccessHandler(username, authToken) {
  setUsernameAndToken(username, authToken)
  refreshPage()
  clearLoginForm()
}

function loginErrorHandler(errorMessage) {
  setElementContent("loginFailedMessage", errorMessage)
  setElementVisible("loginFailedMessage", true)
}

function logout() {
  destroySpaState()
  clearLoginForm()
}

function clearLoginForm() {
  clearInputElement("login-username")
  clearInputElement("login-password")
}

function refreshTokenExpirationTimeIndicator() {
  if (spaState.authToken != undefined) {
    const tokenExpirationTimeInSeconds = Math.round(jwt_decode(spaState.authToken).exp - Date.now() / 1000)
    setElementContent("tokenExpirationTime", "&#x21bb; " + formatNonNegativeNumberOfSecondsToMinutesAndSeconds(tokenExpirationTimeInSeconds))
  }
}

function refreshTokenOnclick() {
  requestForNewToken(newAuthTokenUrl, refreshTokenSuccessHandler, showLoginScreen)
}

function refreshTokenSuccessHandler(newAuthToken) {
  spaState.authToken = newAuthToken
  refreshTokenExpirationTimeIndicator()
}
