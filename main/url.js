const potapaasApiUrl = "http://localhost"
const potapaasApiPort = 8080

const mainUrl = potapaasApiUrl + ":" + potapaasApiPort
const datastoreUrl = mainUrl + "/datastore"
const appUrl = mainUrl + "/app"
const userUrl = mainUrl + "/user"
const loginUrl = mainUrl + "/login"
const newAuthTokenUrl = mainUrl + "/new-auth-token"

function redeployUrl(appUuid) {
    return appUrl + "/" + appUuid + "/redeploy"
}

function logsUrl(appUuid) {
    return appUrl + "/" + appUuid + "/logs"
}

function changeWebhookSecretUrl(appUuid) {
    return appUrl + "/" + appUuid + "/change-webhook-secret"
}

function changePasswordUrl(username) {
    return userUrl + "/" + username + "/password"
}
