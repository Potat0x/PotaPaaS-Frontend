const authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMjEzIiwiZXhwIjoxNTc2NjUyNTI5fQ.Tf72KecDs1qgCcTfhfxboq4bgbZ_HwhUWhKFkpAUJBVdUfWQ1KDjsqA4RfYpYroOTEe0ioffutUpo5OrvANLzg"

function getDatastore(datastoreRequest) {
}

function deleteDatastore(datastoreRequest) {
}

function createDatastoreErrorMessage(errorJson) {
    let message = "Error: " + errorJson.message
    let validRequestExample = "<br>Valid request example:<br>"
        + "name: " + errorJson.validRequestDtoExample.name + "<br>"
        + "type: " + errorJson.validRequestDtoExample.type
    return message + validRequestExample
}

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
        console.log("fetch response: " + response.status + JSON.stringify(response))
        if (response.status === 200 || response.status === 201) {
            return response.json()
        } else if (response.status === 401 || response.status === 403) {
            return Promise.reject("Auth error")
        } else if (response.status >= 400 && response.status < 500) {
            return response.json()
                .then(errorJson =>
                    Promise.reject(createDatastoreErrorMessage(errorJson))
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
