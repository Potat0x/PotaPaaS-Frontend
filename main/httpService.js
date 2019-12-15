const authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMjEzIiwiZXhwIjoxNTc2NzI1MjU5fQ.SdNfUZcyaYErgn_1ADPro-7j8zU_wF9TLWe44sXR3UOuTHl_oJV6Xaw1IIHTHYoyuJ58t0xu_0YpvFL0RnZNfw"

function getRequest(url, onSuccess, onError) {
    request(url, "get", null, onSuccess, onError)
}

function postRequest(url, requestBody, onSuccess, onError) {
    request(url, "post", requestBody, onSuccess, onError)
}

function request(url, method, requestBody, onSuccess, onError) {
    return fetch(url, {
        method: method,
        body: requestBody,
        mode: 'cors',
        headers: new Headers({
            "Authorization": authToken,
            "Content-Type": "application/json"
        })
    }).then(response => {
        console.log("fetch response: " + response.status + JSON.stringify(response) + " for " + method + " " + url)
        if (response.status === 200 || response.status === 201) {
            return response.json()
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
    let validRequestExample = "";
    if (errorJson.validRequestDtoExample != null && errorJson.validRequestDtoExample != undefined) {
        validRequestExample = "<br><br>Valid request example:<br>"
        Object.keys(errorJson.validRequestDtoExample).forEach(function (key, index) {
            validRequestExample += key + ": " + errorJson.validRequestDtoExample[key] + "<br>"
        });
    }
    return message + validRequestExample
}
