const fs = require('fs');
const { dialog } = require('electron').remote;

/**
 * Action method called on Add Environment button
 */
actionAddEnvironment = (event) => {
    // Read data from JSON file.
    let dataObject = JSON.parse(fs.readFileSync('data.json'));
    let envId = document.getElementById("envId").value;
    let envName = document.getElementById("envName").value;
    if (!envId) {
        dialog.showErrorBox('Error', 'Environment ID is required.');
        return;
    }
    if (!envName) {
        dialog.showErrorBox('Error', 'Environment Name is required.');
        return;
    }

    // Add element to array
    dataObject.environments.push({ id: envId, name: envName });

    // Write content to data file.
    fs.writeFile('data.json', JSON.stringify(dataObject), 'utf-8', (error) => {
        if (error) {
            dialog.showErrorBox('File Write Error', 'Failed to write data to disk ' + JSON.stringify(error));
        } else {
            // Close Save modal on success
            M.Modal.getInstance(document.getElementById("envModal")).close();
            dialog.showMessageBox(null, { type: 'info', title: 'Success', message: 'Environment added successfully.' });
            initDropdowns();
            initEnvironmentDataTable();
            initMaterializeComponents();
        }
    })
}

/**
 * Action method called on add application button.
 */
actionAddApplication = (event) => {

    // Read data from JSON file.
    let dataObject = JSON.parse(fs.readFileSync('data.json'));
    let appId = document.getElementById("appId").value;
    let appName = document.getElementById("appName").value;
    if (!appId) {
        dialog.showErrorBox('Error', 'Application ID is required.');
        return;
    }
    if (!appName) {
        dialog.showErrorBox('Error', 'Application Name is required.');
        return;
    }

    // Add element to array
    dataObject.applications.push({ id: appId, name: appName });

    // Write content to data file.
    fs.writeFile('data.json', JSON.stringify(dataObject), 'utf-8', (error) => {
        if (error) {
            dialog.showErrorBox('File Write Error', 'Failed to write data to disk ' + JSON.stringify(error));
        } else {
            // Close Save modal on success
            M.Modal.getInstance(document.getElementById("appModal")).close();
            dialog.showMessageBox(null, { type: 'info', title: 'Success', message: 'Application added successfully.' })
            initDropdowns();
            initApplicationDataTable();
            initMaterializeComponents();
        }
    })
}

/**
 * Action method called on about button.
 */
actionAbout = (event) => {
    dialog.showMessageBox(null, { type: 'info', title: 'About', message: 'Autosys Tool Version 4.0.0', detail: 'This application is developed by Manoj Kumar Gupta (manojkumar.x.gupta@barclays.com). Feel free to mail him for any suggestions.' })
}

/**
 * Action method called on upload job button
 */
actionUploadJob = (event) => {
    let options = {
        type: 'warning',
        title: 'Selection Problem',
    };
    let uploadEnvOptions = document.getElementById("uploadEnvOptions");
    let selectedEnv = uploadEnvOptions.options[uploadEnvOptions.selectedIndex].value;
    if (!selectedEnv) {
        options.message = 'Please select an environment to continue.';
        dialog.showMessageBox(null, options);
    } else {
        let file = document.getElementById("jil").files[0];
        if (!file) {
            options.message = 'Please select an JIL file to continue.';
            dialog.showMessageBox(null, options);
        } else {
            let path = file.path;
            let spawn = require('child_process').spawn;
            let results = spawn('cmd.exe', ['/c', 'ping', 'www.google.com']);

            // On recieving data
            results.stdout.on('data', (data) => {
                let textArea = document.getElementById('alltext');
                textArea.innerHTML = textArea.innerHTML + data.toString();

                // Scroll the content to end;
                let outDiv = document.getElementById("outc");
                outDiv.scrollTop = outDiv.scrollHeight;
            });

            // On Error
            results.stderr.on('data', (data) => {
                options.title = 'Error';
                options.type = 'error';
                options.message = 'An Error has occurred while executing file.'
                options.detail = data;
                dialog.showMessageBox(null, options);
                console.log('stderr: ' + data);
            });

            // On application exit.
            results.on('exit', (code) => {
                if (code === 0) {
                    options.title = 'Completed';
                    options.type = 'info';
                    options.message = 'Process completed with exit code ' + code + '.';
                    dialog.showMessageBox(null, options);
                } else {
                    options.title = 'Error';
                    options.type = 'error';
                    options.message = "Process didn't completed cleanly. See console for more details.";
                    options.detail = 'Process completed with exit code ' + code + '.';
                    dialog.showMessageBox(null, options);
                }
            });
        }
    }
}

/**
 * Initializes application data table
 */
initApplicationDataTable = () => {
    document.getElementById("appTableContainer").innerHTML = "";
    // initMaterializeComponents();
    // tool tips

    // Read data from JSON file.
    let dataObject = JSON.parse(fs.readFileSync('data.json'));

    // Set environment table
    let applicationOptions = dataObject.applications;
    let appTable = document.createElement("table");

    // Create Headers
    let headerRow = appTable.insertRow(-1);
    headerRow.insertCell().innerHTML = '<b>Code</b>';
    headerRow.insertCell().innerHTML = '<b>Name</b>';
    headerRow.insertCell().innerHTML = '<b>Actions</b>';
    let appRow = appTable.insertRow();

    // Set environment table
    applicationOptions.forEach(element => {
        appRow = appTable.insertRow();
        appRow.insertCell().innerHTML = element.id;
        appRow.insertCell().innerHTML = element.name
        let actionCell = appRow.insertCell();
        actionCell.addEventListener("click", () => {
            const options = {
                type: 'question',
                buttons: ['Cancel', 'Yes please', 'No thanks'],
                defaultId: 2,
                title: 'Confirmation',
                message: 'Are you sure you want to delete this row?',
                detail: 'This action cannot be undone.',
            };
            dialog.showMessageBox(null, options, (response) => {
                if (response === 1) {
                    // Perform deletion
                    let filteredApps = removeByAttribute(dataObject.applications, 'id', element.id);
                    dataObject.applications = filteredApps;
                    fs.writeFile('data.json', JSON.stringify(dataObject), 'utf-8', (error) => {
                        if (error) {
                            dialog.showErrorBox('File Write Error', 'Failed to write data to disk ' + JSON.stringify(error));
                        } else {
                            initDropdowns();
                            initApplicationDataTable();
                            initMaterializeComponents();
                        }
                    })
                }
                console.log(response);
            });
        });
        actionCell.innerHTML = "<i class='material-icons left tooltipped red-text' data-tooltip='Delete' style='cursor: pointer;'>delete_forever</i>";
    });
    document.getElementById("appTableContainer").appendChild(appTable);

    // tool tips
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
        position: 'top'
    });
}

/**
 * Initializes Environment table.
 */
initEnvironmentDataTable = () => {
    document.getElementById("envTableContainer").innerHTML = "";
    // tool tips
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
        position: 'top'
    });
    // Read data from JSON file.
    let dataObject = JSON.parse(fs.readFileSync('data.json'));

    // Set environment table
    let environmentOptions = dataObject.environments;
    let envTable = document.createElement("table");

    // Create Headers
    let headerRow = envTable.insertRow(-1);
    headerRow.insertCell().innerHTML = '<b>Environment</b>';
    headerRow.insertCell().innerHTML = '<b>Name</b>';
    headerRow.insertCell().innerHTML = '<b>Actions</b>';
    let envRow = envTable.insertRow();

    // Set environment table
    environmentOptions.forEach(element => {
        envRow = envTable.insertRow();
        envRow.insertCell().innerHTML = element.id;
        envRow.insertCell().innerHTML = element.name
        let actionCell = envRow.insertCell();
        actionCell.addEventListener("click", () => {
            const options = {
                type: 'question',
                buttons: ['Cancel', 'Yes please', 'No thanks'],
                defaultId: 2,
                title: 'Confirmation',
                message: 'Are you sure you want to delete this row?',
                detail: 'This action cannot be undone.',
            };
            dialog.showMessageBox(null, options, (response) => {
                if (response === 1) {
                    // Perform deletion
                    let filteredEnvs = removeByAttribute(dataObject.environments, 'id', element.id);
                    dataObject.environments = filteredEnvs;
                    fs.writeFile('data.json', JSON.stringify(dataObject), 'utf-8', (error) => {
                        if (error) {
                            dialog.showErrorBox('File Write Error', 'Failed to write data to disk ' + JSON.stringify(error));
                        } else {
                            initDropdowns();
                            initEnvironmentDataTable();
                            initMaterializeComponents();
                        }
                    })
                }
                console.log(response);
            });
        });
        actionCell.innerHTML = "<i class='material-icons left tooltipped red-text' data-tooltip='Delete' style='cursor: pointer;'>delete_forever</i>";
    });
    document.getElementById("envTableContainer").appendChild(envTable);
}

/**
 * Action method called on clear console button
 */
actionClearConsole = (event) => {
    let textArea = document.getElementById('alltext');
    textArea.innerHTML = '';
}

/**
 * Action method called on clicking GO -> button.
 */
actionNavigateToJobStatus = (event) => {
    let options = {
        type: 'warning',
        title: 'Selection Problem',
    };
    let envOptions = document.getElementById("envOptions");
    let selectedEnv = envOptions.options[envOptions.selectedIndex].value;
    if (!selectedEnv) {
        options.message = 'Please select an environment to continue.';
        dialog.showMessageBox(null, options);
    } else {
        let appOptions = document.getElementById("appOptions");
        let selectedApp = appOptions.options[appOptions.selectedIndex].value;
        if (!selectedApp) {
            options.message = 'Please select an application to continue.';
            dialog.showMessageBox(null, options);
        } else {
            document.getElementById("jobstatus").data = 'https://zeenews.india.com';
        }
    }
}

/**
 * Function to remove elements from array by attribute
 */
removeByAttribute = (array, attribute, value) => {
    var i = array.length;
    while (i--) {
        if (array[i]
            && array[i].hasOwnProperty(attribute)
            && (arguments.length > 2 && array[i][attribute] === value)) {
            array.splice(i, 1);
        }
    }
    return array;
}


/**
 * Initializes dropdown options.
 */
initDropdowns = () => {

    // Reset the drop downs first
    document.getElementById("envOptions").innerHTML = "<option value='' disabled selected>Select an environment</option>";
    document.getElementById("uploadEnvOptions").innerHTML = "<option value='' disabled selected>Select an environment</option>";
    document.getElementById("appOptions").innerHTML = "<option value='' disabled selected>Select an application</option>";

    // Read data from JSON file.
    let dataObject = JSON.parse(fs.readFileSync('data.json'));

    // Set environment options
    let environmentOptions = dataObject.environments;
    environmentOptions.forEach(element => {
        let optionElement = document.createElement("option");
        optionElement.text = element.name;
        optionElement.value = element.id;
        document.getElementById("envOptions").options.add(optionElement);
    });
    environmentOptions.forEach(element => {
        let optionElement = document.createElement("option");
        optionElement.text = element.name;
        optionElement.value = element.id;
        document.getElementById("uploadEnvOptions").options.add(optionElement);
    });

    // Set application options.
    let applicationOptions = dataObject.applications;
    applicationOptions.forEach(element => {
        let optionElement = document.createElement("option");
        optionElement.text = element.name;
        optionElement.value = element.id;
        document.getElementById("appOptions").options.add(optionElement);
    });

}

/**
 * Initializes Materialize components
 */
initMaterializeComponents = () => {

    // Autoinit all
    M.AutoInit();

    // Floating buttons
    M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {
        direction: 'left',
        hoverEnabled: false
    });

    // tool tips
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
        position: 'top'
    });

    // Tabs
    M.Tabs.init(document.querySelectorAll('.tabs'));

    // Modals
    M.Modal.init(document.querySelectorAll('.modal'));
}

/**
 *  Init settings file (if doesn't exists)
 */
initDataFile = () => {
    fs.stat('data.json', function (err, stat) {
        if (err == null) {
            console.log('File exists');
        } else if (err.code === 'ENOENT') {
            console.log('File does not exists, creating a new one.');
            let dataObject = {};
            dataObject.applications = [];
            dataObject.applications.push({ id: 'xmd%', name: 'Delphi' });
            dataObject.environments = [];
            dataObject.environments.push({ id: 'D00', name: 'D00 -- London autosys dev' });
            fs.writeFile('data.json', JSON.stringify(dataObject), 'utf-8', (error) => {
                if (error) {
                    dialog.showErrorBox('File Write Error', 'Failed to write data to disk ' + JSON.stringify(error));
                } else {
                    location.reload(false);
                }
            })

        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

// On initialization of application.
document.addEventListener('DOMContentLoaded', () => {
    initDataFile();
    initDropdowns();
    initMaterializeComponents();
    initEnvironmentDataTable();
    initApplicationDataTable();
});
