function createDatastoreRequestBody() {
    return JSON.stringify({
        name: getElementValue("datastore-name"),
        type: getElementValue("datastore-type")
    })
}

function createAppRequestBody() {
    return JSON.stringify({
        name: getElementValue("app-name"),
        type: getElementValue("app-type"),
        sourceRepoUrl: getElementValue("app-sourceRepoUrl"),
        sourceBranchName: getElementValue("app-sourceBranchName"),
        autodeployEnabled: document.getElementById("app-autodeployEnabled").checked,
        commitHash: nullIfEmpty(getElementValue("app-commitHash")),
        datastoreUuid: nullIfEmpty(getElementValue("app-datastoreUuid")),
    })
}

function changeWebhookSecretRequestBody() {
    return JSON.stringify({
        secret: getElementValue("webhook-secret")
    })
}

function loginRequestBody(username, password) {
    return JSON.stringify({
        username: username,
        password: password
    })
}

function changePasswordRequestBody() {
    return JSON.stringify({
        currentPassword: getElementValue("current-password"),
        newPassword: getElementValue("new-password")
    })
}

function createUserRequestBody() {
    return JSON.stringify({
        email: getElementValue("register-email"),
        username: getElementValue("register-username"),
        password: getElementValue("register-password")
    })
}
