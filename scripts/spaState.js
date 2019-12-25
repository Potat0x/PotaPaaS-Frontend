let spaState = {}

function setUsernameAndToken(username, authToken) {
    spaState = {
        username: username,
        authToken: authToken
    }
}

function destroySpaState() {
    spaState = {}
}
