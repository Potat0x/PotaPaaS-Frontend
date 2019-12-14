const url = "http://localhost:8080/datastore"
const authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMjEiLCJleHAiOjE1NzYzOTY1Mjl9.GrUyvWNFjAamKd-qKETnkdLddD6GWPp3v9-VTWaMOBqS81EUWyASVzDdOKagpKmL43VpQMCpu4ljR40CFfNNIg"

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

function postRequest(requestBody, onSuccess, onError) {
    return fetch(url, {
        method: "post",
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
