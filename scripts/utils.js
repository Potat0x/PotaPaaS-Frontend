function setWindowLocation(href) {
    window.location.href = href
}

function setElementContent(elementId, innerHtml) {
    document.getElementById(elementId).innerHTML = innerHtml
}

function setElementValue(elementId, value) {
    document.getElementById(elementId).value = value
}

function getElementValue(elementId) {
    return document.getElementById(elementId).value
}

function createHtmlLink(linkElementId, href) {
    return `<a href="${href}" id=${linkElementId}>${href}</a>`
}

function createHtmlLinkToGithubBranch(linkElementId, repoUrl, branch) {
    const urlToBranch = repoUrl + "/tree/" + branch
    return `<a href="${urlToBranch}" id=${linkElementId}>${branch}</a>`
}

function clearElementContent(elementId) {
    setElementContent(elementId, "")
}

function getInnerHtml(elementId) {
    return document.getElementById(elementId).innerHTML
}

function nullIfEmpty(string) {
    return string === "" ? null : string
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

function mapBooleanStringToCustomString(boolVal, trueMapping, falseMapping) {
    return {
        "true": trueMapping,
        "false": falseMapping,
    }[boolVal]
}

function clearModalMessage(messageElementId) {
    setModalMessage(messageElementId, "")
}

function clearInputElement(elementId) {
    document.getElementById(elementId).value = ""
}

function setElementVisible(spinnerId, visible) {
    document.getElementById(spinnerId).style.display = visible ? "block" : "none"
}

function formatNonNegativeNumberOfSecondsToMinutesAndSeconds(inputSeconds) {
    let mins = Math.floor(inputSeconds / 60);
    let secs = inputSeconds % 60;

    if (mins >= 0 && secs >= 0) {
        if (secs === 0) {
            secs = "00"
        } else if (secs < 10) {
            secs = "0" + secs
        }
        return mins + ":" + secs;
    }
    return "0:00"
}

function addClassToElement(elementId, className) {
    document.getElementById(elementId).classList.add(className)
}

function removeClassFromElement(elementId, className) {
    document.getElementById(elementId).classList.remove(className)
}

function setElementType(elementId, type) {
    document.getElementById(elementId).type = type
}
