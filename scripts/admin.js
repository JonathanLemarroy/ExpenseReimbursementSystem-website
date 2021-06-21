window.onload = async function () {
    let serverUrl = "http://127.0.0.1:5000";

    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    let displayTitle = document.getElementById("displayTitle");
    let displayName = document.getElementById("displayName");
    let searchInput = document.getElementById("searchInput");
    let searchBtn = document.getElementById("searchBtn");
    let otherProfileBlock = document.getElementById("otherProfileBlock");
    let profile = null;
    let response = await fetch(`${serverUrl}/profile?session=${session}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (response.status == 200) {
        profile = await response.json();
    }
    else {
        let error = await response.text();
        alert(error);
    }
    if (profile !== null) {
        displayTitle.innerHTML = profile.title;
        displayName.innerHTML = `${profile.firstName} ${profile.lastName}`;
        searchBtn.addEventListener("click", async function () {
            let response = await fetch(`${serverUrl}/profile?session=${session}&email=${searchInput.value}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.status !== 200) {
                let error = await response.text();
                alert(error);
            }
            else {
                let otherProfile = await response.json();
                otherProfileBlock.style.display = "inline-block";
                otherProfileBlock.innerHTML = `<div>Email: ${otherProfile.email}</div> \
                                          <div>Name: ${otherProfile.firstName} ${otherProfile.lastName}</div> \
                                          <div id="otherProfileTitle">Title: ${otherProfile.title}</div> \
                                          <input id="newTitleInput" class="inputField" type="text" placeholder="New title" /> \
                                          <button id="updateBtn" class="smallBtn">update</button>`;
                let newTitleInput = document.getElementById("newTitleInput");
                let updateBtn = document.getElementById("updateBtn");
                updateBtn.addEventListener("click", async function () {
                    let jsonObject = {};
                    jsonObject.email = otherProfile.email;
                    jsonObject.title = newTitleInput.value;
                    response = await fetch(`${serverUrl}/editTitle?session=${session}`, {
                        method: 'PATCH',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(jsonObject)
                    })
                    if(response.status === 200){
                        let otherProfileTitle = document.getElementById("otherProfileTitle")
                        otherProfileTitle.innerHTML = `<div id="otherProfileTitle">Title: ${newTitleInput.value}</div>`
                    }
                    else{
                        let error = await response.text();
                        alert(error);
                    }
                })
            }
        })
    }
}