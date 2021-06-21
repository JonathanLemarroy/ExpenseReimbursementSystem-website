
window.onload = function () {

    let serverUrl = "http://127.0.0.1:5000"

    let toggleNewAccountBtn = document.getElementById("toggleCreateAccountBtn");
    let toggleLoginBtn = document.getElementById("toggleLoginBtn");
    let loginBlock = document.getElementById("loginBlock");
    let createAccountBlock = document.getElementById("createAccountBlock");

    let createAccountBtn = document.getElementById("createAccountBtn");
    let createFirstNameInput = document.getElementById("createFirstNameInput");
    let createLastNameInput = document.getElementById("createLastNameInput");
    let createEmailInput = document.getElementById("createEmailInput");
    let createUsernameInput = document.getElementById("createUsernameInput");
    let createPasswordInput = document.getElementById("createPasswordInput");
    let createAccountMessageBox = document.getElementById("createAccountMessageBox");

    let loginBtn = document.getElementById("loginBtn");
    let loginUserInput = document.getElementById("loginUserInput");
    let loginPasswordInput = document.getElementById("loginPasswordInput");
    let loginMessageBox = document.getElementById("loginMessageBox")

    createAccountBtn.addEventListener("click", async function(){
        let jsonObject = {};
        jsonObject.firstName = String(createFirstNameInput.value);
        jsonObject.lastName = String(createLastNameInput.value);
        jsonObject.email = String(createEmailInput.value);
        jsonObject.username = String(createUsernameInput.value);
        jsonObject.password = String(createPasswordInput.value);
        let response = await fetch(`${serverUrl}/newEmployee`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonObject)
        })
        if (response.status === 201){
            let jsonReply = await response.json();
            window.open(`/dashboard.html?session=${jsonReply.session}`, '_self');
        }
        else{
            let error = await response.text();
            createAccountMessageBox.innerHTML = `${error}`;
        }
    })
    loginBtn.addEventListener("click", async function(){
        let jsonObject = {};
        jsonObject.user = String(loginUserInput.value);
        jsonObject.password = String(loginPasswordInput.value);
        const response = await fetch(`${serverUrl}/login`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonObject)
        })
        if (response.status === 200){
            let jsonReply = await response.json();
            window.open(`/dashboard.html?session=${jsonReply.session}`, '_self');
        }
        else{
            let error = await response.text();
            loginMessageBox.innerHTML = `${error}`;
        }
    })
    toggleLoginBtn.addEventListener("click", function () {
        createAccountBlock.style.display = "none";
        loginBlock.style.display = "inline-block";
    });
    toggleNewAccountBtn.addEventListener("click", function(){
        loginBlock.style.display = "none";
        createAccountBlock.style.display = "inline-block";
    })
}