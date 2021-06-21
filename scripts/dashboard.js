window.onload = async function () {
    let serverUrl = "http://127.0.0.1:5000";

    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    let displayTitle = document.getElementById("displayTitle");
    let displayName = document.getElementById("displayName");
    let requestTable = document.getElementById("requestTable");
    let modifyRequestBlock = document.getElementById("modifyRequestBlock");
    let statisticsBlock = document.getElementById("statisticsBlock");
    let profile = null;
    let requests = null;
    let requests_dict = null;
    let statistics = null;
    let response = await fetch(`${serverUrl}/profile?session=${session}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (response.status == 200) {
        profile = await response.json();
    }
    else {
        let error = await response.text()
        alert(error)
    }

    if (profile !== null) {
        response = await fetch(`/local/title_permissions.json`);
        let permissions = await response.json();

        if (permissions[profile.title].includes('modify_titles')) {
            window.open(`/admin.html?session=${session}`, '_self');
        }

        displayTitle.innerHTML = profile.title;
        displayName.innerHTML = `${profile.firstName} ${profile.lastName}`;

        function addRequest(req) {
            let entry = ""
            entry += `<tr id="row${req.id}">`;
            entry += `<td>${req.id}</td>`;
            entry += `<td>${req.email}</td>`;
            entry += `<td>$${req.amount}</td>`;
            if(req.status === "approved"){
                entry += `<td style="color: green">`;
            }
            else if(req.status === "denied"){
                entry += `<td style="color: red">`;
            }
            else{
                entry += `<td>`;
            }
            entry += `${req.status}</td>`;
            let d = new Date(0);
            d.setUTCSeconds(req.creationDate)
            let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
            let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
            let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
            entry += `<td>${da}-${mo}-${ye}</td>`;
            entry += '<td>';
            if (req.closingDate != 0) {
                d = new Date(req.closingDate);
                d.setUTCSeconds(req.creationDate)
                ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                entry += `${da}-${mo}-${ye}`
            }
            entry += '</td>';
            entry += '<td>';

            entry += `<button id="viewRequestBtn${req.id}" name="${req.id}" itemid="viewRequestBtn" class="smallBtn viewRequestBtn">view</button>`;

            if (permissions[profile.title].includes("edit_requests") && req.closingDate == 0) {
                entry += `<button id="editRequestBtn${req.id}" name="${req.id}" itemid="editRequestBtn" class="smallBtn">edit</button>`;
            }
            if (permissions[profile.title].includes("delete_requests") && req.closingDate == 0) {
                entry += `<button id="deleteRequestBtn${req.id}" name="${req.id}" itemid="deleteRequestBtn" class="smallBtn">delete</button>`;
            }
            if (permissions[profile.title].includes("approve_deny_requests") && req.closingDate == 0) {
                entry += `<button id="approveDenyBtn${req.id}" name="${req.id}" itemid="approveDenyBtn" class="smallBtn">approve/deny</button>`;
            }
            entry += '</td>';
            entry += '</tr>';
            requestTable.innerHTML += entry;
        }
        async function displayRequests() {
            response = await fetch(`${serverUrl}/getRequests?session=${session}`);
            requests = await response.json();
            requestTable.innerHTML = "<tr> \
                                        <th>Id</th> \
                                        <th>Email</th> \
                                        <th>Amount</th> \
                                        <th>Status</th> \
                                        <th>Created</th> \
                                        <th>Closed</th> \
                                        <th>Options</th> \
                                    </tr>";
            requests_dict = {}
            for (let i = 0; i < requests.length; i++) {
                requests_dict[requests[i].id] = requests[i];
                addRequest(requests_dict[requests[i].id]);
            }
            function displayCreateRequests() {
                if (permissions[profile.title].includes("create_requests")) {
                    modifyRequestBlock.innerHTML = '<div> \
                                                        <textarea id="reasonInput" rows="5" cols="33" placeholder="reason..."></textarea> \
                                                        <div> \
                                                            <input type="number" id="amountInput" class="inputField" placeholder="$amount" style="width: 9em;"/> \
                                                            <button id="createRequestBtn" class="mediumBtn" style="margin-bottom: 1em;">Submit Request</button> \
                                                        </div> \
                                                    </div>';
                    let createRequestBtn = document.getElementById("createRequestBtn")
                    createRequestBtn.addEventListener("click", async function () {
                        let amountInput = document.getElementById("amountInput");
                        let reasonInput = document.getElementById("reasonInput");
                        let jsonObject = {};
                        jsonObject.reason = reasonInput.value;
                        jsonObject.amount = amountInput.value;
                        jsonObject.email = profile.email;
                        response = await fetch(`${serverUrl}/newRequest?session=${session}`, {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonObject)
                        });
                        if(response.status !== 201){
                            let error = await response.text();
                            alert(error)
                        }
                        else{
                            displayCreateRequests();
                            await displayRequests();
                        }
                    })
                }
                else {
                    modifyRequestBlock.innerHTML = "";
                }
            }
            displayCreateRequests();
            let btns = document.querySelectorAll(`[itemid='viewRequestBtn']`);
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function (req) {
                    return function () {
                        modifyRequestBlock.innerHTML = '<div> \
                                                        <div> \
                                                            <textarea id="reasonOutput" rows="5" cols="33" placeholder="reason..." readonly></textarea> \
                                                            <textarea id="responseOutput" rows="5" cols="33" placeholder="response..." readonly></textarea> \
                                                        </div> \
                                                        <div> \
                                                            <input type="number" id="amountOutput" class="inputField" style="width: 9em;" readonly/> \
                                                            <button id="closeBtn" class="mediumBtn" style="margin-bottom: 1em;">Close</button> \
                                                        </div> \
                                                    </div>';
                        let reasonOutput = document.getElementById("reasonOutput");
                        reasonOutput.value = req.reason;
                        let responseOutput = document.getElementById("responseOutput");
                        responseOutput.value = req.response;
                        let amountOutput = document.getElementById("amountOutput");
                        amountOutput.value = req.amount;
                        let closeBtn = document.getElementById("closeBtn");
                        closeBtn.addEventListener("click", function () {
                            displayCreateRequests();
                        })
                    }
                }(requests_dict[btns[i].name]));
            }
            btns = document.querySelectorAll(`[itemid='approveDenyBtn']`);
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function (req) {
                    return function () {
                        modifyRequestBlock.innerHTML = '<div> \
                                                        <div> \
                                                            <textarea id="responseInput" rows="5" cols="33" placeholder="response..."></textarea> \
                                                        </div> \
                                                        <div> \
                                                            <button id="approveBtn" class="mediumBtn" style="margin-bottom: 1em;">Approve</button> \
                                                            <button id="denyBtn" class="mediumBtn" style="margin-bottom: 1em;">Deny</button> \
                                                            <button id="cancelBtn" class="mediumBtn" style="margin-bottom: 1em;">Cancel</button> \
                                                        </div> \
                                                    </div>';
                        let responseInput = document.getElementById("responseInput");
                        let approveBtn = document.getElementById("approveBtn");
                        let denyBtn = document.getElementById("denyBtn");
                        let cancelBtn = document.getElementById("cancelBtn");
                        cancelBtn.addEventListener("click", function () {
                            displayCreateRequests();
                        })
                        approveBtn.addEventListener("click", async function () {
                            let jsonObject = {};
                            jsonObject.id = req.id;
                            jsonObject.approved = true;
                            jsonObject.response = responseInput.value;
                            response = await fetch(`${serverUrl}/approveDenyRequest?session=${session}`, {
                                method: 'PATCH',
                                mode: 'cors',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(jsonObject)
                            })
                            if (response.status !== 200) {
                                let error = await response.text();
                                alert(error)
                            }else{
                                await displayRequests();
                            }
                        })
                        denyBtn.addEventListener("click", async function () {
                            let jsonObject = {};
                            jsonObject.id = req.id;
                            jsonObject.approved = false;
                            jsonObject.response = responseInput.value;
                            response = await fetch(`${serverUrl}/approveDenyRequest?session=${session}`, {
                                method: 'PATCH',
                                mode: 'cors',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(jsonObject)
                            })
                            if (response.status !== 200) {
                                let error = await response.text();
                                alert(error)
                            }
                            else{
                                await displayRequests()
                            }
                        })
                    }
                }(requests_dict[btns[i].name]));
            }

            btns = document.querySelectorAll(`[itemid='deleteRequestBtn']`);
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function (req) {
                    return async function () {
                        let jsonObject = {};
                        jsonObject.id = req.id;
                        response = await fetch(`${serverUrl}/deleteRequest?session=${session}`, {
                            method: 'DELETE',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonObject)
                        })
                        if (response.status !== 200) {
                            let error = await response.text();
                            alert(error)
                        }
                        else{
                            await displayRequests()
                        }
                    }
                }(requests_dict[btns[i].name]));
            }
            btns = document.querySelectorAll(`[itemid='editRequestBtn']`);
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function (req) {
                    return async function () {
                        modifyRequestBlock.innerHTML = '<div> \
                                                            <textarea id="reasonInput" rows="5" cols="33" placeholder="reason..."></textarea> \
                                                            <div> \
                                                                <input type="number" id="amountInput" class="inputField" placeholder="$amount" style="width: 9em;"/> \
                                                                <button id="editRequestBtn" class="mediumBtn" style="margin-bottom: 1em;">Edit</button> \
                                                                <button id="cancelBtn" class="mediumBtn" style="margin-bottom: 1em;">Cancel</button> \
                                                            </div> \
                                                        </div>';
                        let amountInput = document.getElementById("amountInput");
                        amountInput.value = req.amount;
                        let reasonInput = document.getElementById("reasonInput");
                        reasonInput.value = req.reason;
                        let editRequestBtn = document.getElementById("editRequestBtn");
                        let cancelBtn = document.getElementById("cancelBtn");
                        cancelBtn.addEventListener("click", function () {
                            displayCreateRequests();
                        })
                        editRequestBtn.addEventListener("click", async function(){
                            jsonObject = {};
                            jsonObject.amount = amountInput.value;
                            jsonObject.reason = reasonInput.value;
                            jsonObject.id = req.id;
                            response = await fetch(`${serverUrl}/editRequest?session=${session}`, {
                                method: 'PATCH',
                                mode: 'cors',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(jsonObject)
                            })
                            if (response.status !== 200) {
                                let error = await response.text();
                                alert(error)
                            }
                            else{
                                await displayRequests()
                            }
                        })
                    }
                }(requests_dict[btns[i].name]));
            }
            statistics = {}
            statisticsBlock.innerHTML = "";
            for(let i = 0; i < requests.length; i++){
                if(statistics[requests[i].email] === undefined){
                    statistics[requests[i].email] = {};
                    statistics[requests[i].email].approvedRequests = 0;
                    statistics[requests[i].email].deniedRequests = 0;
                    statistics[requests[i].email].pendingRequests = 0;
                    statistics[requests[i].email].approvedAmountTotal = 0;
                    statistics[requests[i].email].deniedAmountTotal = 0;
                    statistics[requests[i].email].pendingAmountTotal = 0;
                    if(requests[i].status === "approved"){
                        statistics[requests[i].email].approvedRequests++;
                        statistics[requests[i].email].approvedAmountTotal += requests[i].amount;
                    }
                    if(requests[i].status === "denied"){
                        statistics[requests[i].email].deniedRequests++;
                        statistics[requests[i].email].deniedAmountTotal += requests[i].amount;
                    }
                    if(requests[i].status === "pending"){
                        statistics[requests[i].email].pendingRequests++;
                        statistics[requests[i].email].pendingAmountTotal += requests[i].amount;
                    }
                }
                else{
                    if(requests[i].status === "approved"){
                        statistics[requests[i].email].approvedRequests++;
                        statistics[requests[i].email].approvedAmountTotal += requests[i].amount;
                    }
                    if(requests[i].status === "denied"){
                        statistics[requests[i].email].deniedRequests++;
                        statistics[requests[i].email].deniedAmountTotal += requests[i].amount;
                    }
                    if(requests[i].status === "pending"){
                        statistics[requests[i].email].pendingRequests++;
                        statistics[requests[i].email].pendingAmountTotal += requests[i].amount;
                    }
                }
            }
            console.log(statistics);
            let totalRequestsApproved = 0;
            let totalAmountApproved = 0;
            for (const key in statistics) {
                totalRequestsApproved += statistics[key].approvedRequests;
                totalAmountApproved += statistics[key].approvedAmountTotal;
            }
            statisticsBlock.innerHTML += `<div>Total Requests Approved: ${totalRequestsApproved}</div>`;
            statisticsBlock.innerHTML += `<div>Total Amount Approved: ${totalAmountApproved}</div>`;
            for (const key in statistics) {
                let html = "";
                html += `<div style="display: inline-block; border: 1px dotted grey; padding: 1em; margin: 1em;">`;
                html += `<div>${key}</div>`
                html += `<div>Requests Approved: ${statistics[key].approvedRequests}</div>`
                html += `<div>Requests Pending: ${statistics[key].pendingRequests}</div>`
                html += `<div>Requests Denied: ${statistics[key].deniedRequests}</div>`
                html += `<div>Amount Approved: ${statistics[key].approvedAmountTotal}</div>`
                html += `<div>Amount Pending: ${statistics[key].pendingAmountTotal}</div>`
                html += `<div>Amount Denied: ${statistics[key].deniedAmountTotal}</div>`
                html += `</div>`;
                statisticsBlock.innerHTML += html;
            }
        }
        await displayRequests();
    }
}
