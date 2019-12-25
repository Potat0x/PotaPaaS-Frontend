function getRequest(url, onSuccess, onError) {
    request(url, "get", null, onSuccess, onError)
}

function deleteRequest(url, onSuccess, onError) {
    request(url, "delete", null, onSuccess, onError)
}

function postRequest(url, requestBody, onSuccess, onError) {
    request(url, "post", requestBody, onSuccess, onError)
}

function request(url, method, requestBody, onSuccess, onError) {
    return fetch(url, {
        method: method,
        body: requestBody,
        mode: "cors",
        headers: new Headers({
            "Authorization": spaState.authToken,
            "Content-Type": "application/json"
        })
    }).then(response => {
        console.log("fetch response: " + response.status + JSON.stringify(response) + " for " + method + " " + url)
        if (response.status === 200 || response.status === 201) {
            return response.json()
        } else if (response.status === 204) {
            return Promise.resolve("")
        } else if (response.status === 401 || response.status === 403) {
            return Promise.reject("Auth error")
        } else if (response.status >= 400 && response.status < 500) {
            return response.json()
                .then(errorJson =>
                    Promise.reject(buildErrorMessage(errorJson))
                )
        } else {
            return Promise.reject("Server error: " + response.status)
        }
    }).then(json => {
        console.log("request ok: " + JSON.stringify(json))
        onSuccess(json)
        return json
    }).catch(err => {
        console.error("request error:" + err)
        onError(err)
    })
}

function buildErrorMessage(errorJson) {
    let message = "Error: " + errorJson.message
    let validRequestExample = ""
    if (errorJson.validRequestDtoExample != null && errorJson.validRequestDtoExample != undefined) {
        validRequestExample = "<br><br>Valid request example:<br>"
        Object.keys(errorJson.validRequestDtoExample).forEach(function (key, index) {
            validRequestExample += key + ": " + errorJson.validRequestDtoExample[key] + "<br>"
        })
    }
    return message + validRequestExample
}

function loginRequest(url, username, password, onSuccess, onError) {
    const req = new XMLHttpRequest()
    req.open("POST", url, true)
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                const authHeader = req.getResponseHeader("authorization")
                if (authHeader != undefined) {
                    onSuccess(username, authHeader)
                } else {
                    onError("Error: no auth header found in server response")
                }
            } else if (req.status === 403) {
                onError("Invalid username or password")
            } else {
                onError("Error: " + req.status)
            }
        }
    }
    req.send(loginRequestBody(username, password))
}

function loginRequestBody(username, password) {
    return JSON.stringify({
        username: username,
        password: password
    })
}

function refreshTokenRequest(url, onSuccess, onError) {
    const req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.setRequestHeader("Authorization", spaState.authToken)
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                const authHeader = req.getResponseHeader("authorization")
                if (authHeader != undefined) {
                    onSuccess(authHeader)
                } else {
                    console.log("Error: no auth header found in server response")
                    onError()
                }
            } else if (req.status === 403) {
                onError("Invalid username or password")
            } else {
                onError("Error: " + req.status)
            }
        }
    }
    req.send(null)
}
