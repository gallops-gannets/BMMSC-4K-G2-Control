// Configuration
let API_BASE_URL = '';
// Utility function for making API calls
async function makeApiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    console.log(`Sending ${method} request to ${url}`, options);

    try {
        const response = await fetch(url, options);
        console.log(`Response status for ${endpoint}:`, response.status);
        
        const responseText = await response.text();
        console.log(`Raw response for ${endpoint}:`, responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }

        return responseText ? JSON.parse(responseText) : {};
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// IP Address validation and module initialization
let modulesInitialized = false;

function showIPStatusMessage(message, isError = false) {
    const statusMessageDiv = document.getElementById('ipStatusMessage');
    statusMessageDiv.textContent = message;
    statusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
    statusMessageDiv.style.display = 'block';
}

async function validateIPAddress() {
    const ipAddress = document.getElementById('ipAddressInput').value.trim();
    if (!ipAddress) {
        showIPStatusMessage('Please enter an IP address', true);
        return;
    }

    const testUrl = `http://${ipAddress}/control/api/v1/system/supportedFormats`;
    
    try {
        const response = await fetch(testUrl);
        if (response.ok) {
            API_BASE_URL = `http://${ipAddress}/control/api/v1`;
            showIPStatusMessage('IP address validated successfully');
            document.getElementById('ipAddressSection').style.display = 'none';
            showModules();
            initializeModules();
        } else {
            showIPStatusMessage('Invalid IP address or device not compatible', true);
        }
    } catch (error) {
        showIPStatusMessage('Error validating IP address: ' + error.message, true);
    }
}

function showModules() {
    document.querySelectorAll('.module:not(#ipAddressSection)').forEach(module => {
        module.style.display = 'block';
    });
}

function initializeModules() {
    if (!modulesInitialized) {
        initializeSystemControl();
        initializePresetControl();
        initializeAudioControl();
        initializeLensControl();
        initializeVideoControl();
        initializeColorCorrection();
        modulesInitialized = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const validateIPButton = document.getElementById('validateIPButton');
    validateIPButton.addEventListener('click', validateIPAddress);

    // Hide all modules initially
    document.querySelectorAll('.module:not(#ipAddressSection)').forEach(module => {
        module.style.display = 'none';
    });
});

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const validateIPButton = document.getElementById('validateIPButton');
    validateIPButton.addEventListener('click', validateIPAddress);

    // Hide all modules initially
    document.querySelectorAll('.module:not(#ipAddressSection)').forEach(module => {
        module.style.display = 'none';
    });
});

// System Control Module
function initializeSystemControl() {
    const systemInfoDiv = document.getElementById('systemInfo');
    const codecFormatSpan = document.getElementById('codecFormat');
    const frameRateSelect = document.getElementById('frameRate');
    const offSpeedEnabledCheckbox = document.getElementById('offSpeedEnabled');
    const offSpeedControls = document.getElementById('offSpeedControls');
    const offSpeedFrameRateSlider = document.getElementById('offSpeedFrameRate');
    const offSpeedFrameRateValue = document.getElementById('offSpeedFrameRateValue');
    const updateSystemSettingsButton = document.getElementById('updateSystemSettings');

    async function getSystemInfo() {
        console.log('Starting getSystemInfo function');
        try {
            console.log('Fetching supported formats...');
            const supportedFormats = await makeApiCall('/system/supportedFormats', 'GET');
            console.log('API call completed successfully');
            return { supportedFormats };
        } catch (error) {
            console.error('Error in getSystemInfo:', error);
            throw error;
        }
    }

    function populateSelect(select, options) {
        select.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    function showStatusMessage(message, isError = false) {
        const statusMessageDiv = document.getElementById('systemStatusMessage');
        if (!statusMessageDiv) {
            console.error('Status message div not found');
            return;
        }
        statusMessageDiv.textContent = message;
        statusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
        statusMessageDiv.style.display = 'block';
        statusMessageDiv.style.opacity = '1';
    
        console.log('Showing status message:', message);
    
        setTimeout(() => {
            statusMessageDiv.style.opacity = '0';
            setTimeout(() => {
                statusMessageDiv.style.display = 'none';
            }, 500);
        }, 3000);
    }

    async function fetchAndPopulateSystemInfo() {
        console.log('Fetching system info');
        try {
            const [supportedFormatsResponse, currentFormatResponse] = await Promise.all([
                makeApiCall('/system/supportedFormats', 'GET'),
                makeApiCall('/system/format', 'GET')
            ]);
    
            const supportedFormats = supportedFormatsResponse.supportedFormats;
            const currentFormat = currentFormatResponse;
    
            console.log('Retrieved supported formats:', supportedFormats);
            console.log('Retrieved current format:', currentFormat);
    
            // systemInfoDiv.innerHTML = `<pre>${JSON.stringify(supportedFormats, null, 2)}</pre>`;
    
            const format = supportedFormats[0];
    
            // Display codec format
            codecFormatSpan.textContent = currentFormat.codec || format.codecs[0];
    
            // Populate frame rate dropdown
            populateSelect(frameRateSelect, format.frameRates);
    
            // Set the current frame rate as selected
            if (currentFormat.frameRate) {
                frameRateSelect.value = currentFormat.frameRate;
            }
    
            // Set up off-speed frame rate controls
            offSpeedFrameRateSlider.min = format.minOffSpeedFrameRate;
            offSpeedFrameRateSlider.max = format.maxOffSpeedFrameRate;
            offSpeedFrameRateSlider.value = currentFormat.offSpeedFrameRate || format.frameRates[0];
            offSpeedFrameRateValue.textContent = offSpeedFrameRateSlider.value;
    
            // Set the off-speed checkbox based on current format
            offSpeedEnabledCheckbox.checked = currentFormat.offSpeedEnabled || false;
            offSpeedControls.style.display = offSpeedEnabledCheckbox.checked ? 'block' : 'none';
    
            console.log('UI elements populated successfully');
            showStatusMessage('System information loaded successfully');
        } catch (error) {
            console.error('Error fetching system info:', error);
            systemInfoDiv.innerHTML = 'Failed to retrieve system information. Check console for details.';
            showStatusMessage('Failed to load system information', true);
        }
    }

    offSpeedEnabledCheckbox.addEventListener('change', () => {
        offSpeedControls.style.display = offSpeedEnabledCheckbox.checked ? 'block' : 'none';
    });

    offSpeedFrameRateSlider.addEventListener('input', () => {
        offSpeedFrameRateValue.textContent = offSpeedFrameRateSlider.value;
    });

    updateSystemSettingsButton.addEventListener('click', async () => {
        try {
            // Get the current supported formats
            const { supportedFormats } = await getSystemInfo();
            const currentFormat = supportedFormats.supportedFormats[0];
    
            // Prepare the format object
            const format = {
                codec: currentFormat.codecs[0],
                frameRate: frameRateSelect.value,
                offSpeedEnabled: offSpeedEnabledCheckbox.checked,
                offSpeedFrameRate: offSpeedEnabledCheckbox.checked ? parseFloat(offSpeedFrameRateSlider.value) : parseFloat(frameRateSelect.value),
                sensorResolution: currentFormat.sensorResolution,
                recordResolution: currentFormat.recordResolution
            };
    
            console.log('Sending format update:', format);
    
            const response = await makeApiCall('/system/format', 'PUT', format);
            console.log('Update response:', response);
    
            showStatusMessage('System settings updated successfully');
            console.log('Status message should be visible now');
    
        } catch (error) {
            console.error('Failed to update system settings:', error);
            showStatusMessage(`Failed to update system settings: ${error.message}`, true);
        }
    });

    // Fetch system info immediately when the module initializes
    fetchAndPopulateSystemInfo();
}

// Preset Control Module

function initializePresetControl() {
        const presetList = document.getElementById('presetList');
        const loadPresetButton = document.getElementById('loadPreset');
        //Commented out save and delete functionality due to CORS issue
        //const newPresetNameInput = document.getElementById('newPresetName');
        //const savePresetButton = document.getElementById('savePreset');
        //const deletePresetButton = document.getElementById('deletePreset');
        const statusMessageDiv = document.getElementById('presetStatusMessage');
    
        function showStatusMessage(message, isError = false) {
            statusMessageDiv.textContent = message;
            statusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.style.opacity = '1';
    
            setTimeout(() => {
                statusMessageDiv.style.opacity = '0';
                setTimeout(() => {
                    statusMessageDiv.style.display = 'none';
                }, 500);
            }, 3000);
        }
    
        async function fetchPresets() {
            try {
                const presets = await makeApiCall('/presets', 'GET');
                console.log('Fetched presets:', presets);
                const presetList = document.getElementById('presetList');
                presetList.innerHTML = '';
                if (presets.presets && presets.presets.length > 0) {
                    presets.presets.forEach(preset => {
                        const option = document.createElement('option');
                        option.value = preset;
                        option.textContent = preset;
                        presetList.appendChild(option);
                    });
                    showStatusMessage('Presets loaded successfully');
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'No presets found';
                    presetList.appendChild(option);
                    showStatusMessage('No presets found', true);
                }
            } catch (error) {
                console.error('Failed to fetch presets:', error);
                showStatusMessage('Failed to fetch presets', true);
            }
        }
    
        //commented out save and delete functionality due to CORS issue 
        /*
        savePresetButton.addEventListener('click', async () => {
            const newPresetName = newPresetNameInput.value.trim();
            if (!newPresetName) {
                showStatusMessage('Please enter a preset name', true);
                return;
            }
            try {
                await makeApiCall(`/presets/${newPresetName}`, 'PUT');
                console.log('Preset saved:', newPresetName);
                showStatusMessage(`Preset "${newPresetName}" saved successfully`);
                newPresetNameInput.value = '';
                fetchPresets();
            } catch (error) {
                console.error('Failed to save preset:', error);
                showStatusMessage('Failed to save preset', true);
            }
        });
    
        deletePresetButton.addEventListener('click', async () => {
            const selectedPreset = presetList.value;
            if (!selectedPreset) {
                showStatusMessage('Please select a preset to delete', true);
                return;
            }
            try {
                await makeApiCall(`/presets/${selectedPreset}`, 'DELETE');
                console.log('Preset deleted:', selectedPreset);
                showStatusMessage(`Preset "${selectedPreset}" deleted successfully`);
                fetchPresets();
            } catch (error) {
                console.error('Failed to delete preset:', error);
                showStatusMessage('Failed to delete preset', true);
            }
        });
        */
    
        // Initial fetch of presets
        fetchPresets();
    }

// Audio Control Module
function initializeAudioControl() {
    const cameraMicMode = document.getElementById('cameraMicMode');
    const _3_5mmMode = document.getElementById('3_5mmMode');
    const _3_5mmGain = document.getElementById('3_5mmGain');
    const _3_5mmGainContainer = document.getElementById('3_5mmGainContainer');
    const channel1Source = document.getElementById('channel1Source');
    const channel1Level = document.getElementById('channel1Level');
    const channel1LevelValue = document.getElementById('channel1LevelValue');
    const channel2Source = document.getElementById('channel2Source');
    const channel2Level = document.getElementById('channel2Level');
    const channel2LevelValue = document.getElementById('channel2LevelValue');
    const updateAudioSettingsButton = document.getElementById('updateAudioSettings');
    const statusMessageDiv = document.getElementById('audioStatusMessage');

    const audioSources = [
        'None', 'Camera - Left', 'Camera - Right', 'Camera - Mono', 
        '3.5mm Left - Line', '3.5mm Left - Mic', '3.5mm Right - Line', 
        '3.5mm Right - Mic', '3.5mm Mono - Line', '3.5mm Mono - Mic'
    ];

    function showStatusMessage(message, isError = false) {
        const statusMessageDiv = document.getElementById('audioStatusMessage');
        if (statusMessageDiv) {
            statusMessageDiv.textContent = message;
            statusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.style.opacity = '1';
    
            console.log(`Audio Control: ${message}`);
    
            setTimeout(() => {
                statusMessageDiv.style.opacity = '0';
                setTimeout(() => {
                    statusMessageDiv.style.display = 'none';
                }, 500);
            }, 3000);
        } else {
            console.warn('Audio status message element not found');
        }
    }

    function updateSourceOptions() {
        let filteredSources = [...audioSources];

        // Apply Camera Mic Mode filter
        if (cameraMicMode.value === 'Mono') {
            filteredSources = filteredSources.filter(s => !['Camera - Left', 'Camera - Right'].includes(s));
        } else if (cameraMicMode.value === 'Stereo') {
            filteredSources = filteredSources.filter(s => s !== 'Camera - Mono');
        } else if (cameraMicMode.value === 'Off') {
            filteredSources = filteredSources.filter(s => !s.startsWith('Camera'));
        }

        // Apply 3.5mm Mode filter
        if (_3_5mmMode.value === 'Mono') {
            filteredSources = filteredSources.filter(s => !s.startsWith('3.5mm Left') && !s.startsWith('3.5mm Right'));
        } else if (_3_5mmMode.value === 'Stereo') {
            filteredSources = filteredSources.filter(s => !s.startsWith('3.5mm Mono'));
        } else if (_3_5mmMode.value === 'Off') {
            filteredSources = filteredSources.filter(s => !s.startsWith('3.5mm'));
            _3_5mmGainContainer.style.display = 'none';
        }

        // Apply 3.5mm Gain filter
        if (_3_5mmMode.value !== 'Off') {
            _3_5mmGainContainer.style.display = 'block';
            if (_3_5mmGain.value === 'Line') {
                filteredSources = filteredSources.filter(s => !s.endsWith('Mic'));
            } else if (_3_5mmGain.value === 'Mic') {
                filteredSources = filteredSources.filter(s => !s.endsWith('Line'));
            }
        }

        populateSourceDropdown(channel1Source, filteredSources);
        populateSourceDropdown(channel2Source, filteredSources);
    }

    function populateSourceDropdown(dropdown, sources, currentValue = 'None') {
        const currentSelection = dropdown.value;
        dropdown.innerHTML = '';
        sources.forEach(source => {
            const option = document.createElement('option');
            option.value = source;
            option.textContent = source;
            if (source === currentValue) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
        if (!sources.includes(currentSelection)) {
            dropdown.value = 'None';
            resetChannelLevel(dropdown.id === 'channel1Source' ? channel1Level : channel2Level);
        }
    }

    function updateLevelDisplay(level, levelValue) {
        let displayValue;
        if (level.value >= -6 && level.value <= 6) {
            displayValue = `${level.value} dB`;
        } else {
            displayValue = `${level.value} dB`;
        }
        levelValue.textContent = displayValue;
    }

    function resetChannelLevel(levelSlider) {
        levelSlider.value = 0;
        updateLevelDisplay(levelSlider, levelSlider === channel1Level ? channel1LevelValue : channel2LevelValue);
    }

    function normalizeLevel(level, sourceType) {
        let min, max;
        if (sourceType.includes('Camera') || (sourceType.includes('3.5mm') && sourceType.includes('Line'))) {
            min = -6;
            max = 6;
        } else if (sourceType.includes('3.5mm') && sourceType.includes('Mic')) {
            min = -10;
            max = 40;
        } else {
            return 0; // Default for 'None' or unknown types
        }
        return (parseFloat(level) - min) / (max - min);
    }

    function denormalizeLevel(normalizedLevel, sourceType) {
        let min, max;
        if (sourceType.includes('Camera') || (sourceType.includes('3.5mm') && sourceType.includes('Line'))) {
            min = -6;
            max = 6;
        } else if (sourceType.includes('3.5mm') && sourceType.includes('Mic')) {
            min = -10;
            max = 40;
        } else {
            return 0; // Default for 'None' or unknown types
        }
        return normalizedLevel * (max - min) + min;
    }

    function inferInputModeSelection(ch1Source, ch2Source) {
        if (ch1Source.startsWith('Camera') || ch2Source.startsWith('Camera')) {
            if (ch1Source === 'Camera - Mono' || ch2Source === 'Camera - Mono') {
                cameraMicMode.value = 'Mono';
            } else {
                cameraMicMode.value = 'Stereo';
            }
        } else {
            cameraMicMode.value = 'Off';
        }

        if (ch1Source.startsWith('3.5mm') || ch2Source.startsWith('3.5mm')) {
            if (ch1Source.includes('Mono') || ch2Source.includes('Mono')) {
                _3_5mmMode.value = 'Mono';
            } else {
                _3_5mmMode.value = 'Stereo';
            }
            _3_5mmGain.value = ch1Source.includes('Mic') || ch2Source.includes('Mic') ? 'Mic' : 'Line';
            _3_5mmGainContainer.style.display = 'block';
        } else {
            _3_5mmMode.value = 'Off';
            _3_5mmGainContainer.style.display = 'none';
        }
    }

    async function fetchAudioSettings() {
        try {
            const [ch1Source, ch1Level, ch2Source, ch2Level] = await Promise.all([
                makeApiCall('/audio/channel/0/input', 'GET').catch(() => ({ input: 'None' })),
                makeApiCall('/audio/channel/0/level', 'GET').catch(() => ({ normalised: 0 })),
                makeApiCall('/audio/channel/1/input', 'GET').catch(() => ({ input: 'None' })),
                makeApiCall('/audio/channel/1/level', 'GET').catch(() => ({ normalised: 0 }))
            ]);

            inferInputModeSelection(ch1Source.input, ch2Source.input);
            updateSourceOptions();

            channel1Source.value = ch1Source.input;
            channel2Source.value = ch2Source.input;

            channel1Level.value = denormalizeLevel(ch1Level.normalised, ch1Source.input);
            channel2Level.value = denormalizeLevel(ch2Level.normalised, ch2Source.input);

            updateLevelDisplay(channel1Level, channel1LevelValue);
            updateLevelDisplay(channel2Level, channel2LevelValue);

            console.log('Audio settings fetched successfully');
            showStatusMessage('Audio settings loaded');
        } catch (error) {
            console.error('Failed to fetch audio settings:', error);
            showStatusMessage('Failed to fetch audio settings. Using default values.', true);
            
            // Populate with default values
            updateSourceOptions();
            resetChannelLevel(channel1Level);
            resetChannelLevel(channel2Level);
        }
    }

    cameraMicMode.addEventListener('change', updateSourceOptions);
    _3_5mmMode.addEventListener('change', updateSourceOptions);
    _3_5mmGain.addEventListener('change', updateSourceOptions);

    channel1Level.addEventListener('input', () => updateLevelDisplay(channel1Level, channel1LevelValue));
    channel2Level.addEventListener('input', () => updateLevelDisplay(channel2Level, channel2LevelValue));

    channel1Level.addEventListener('dblclick', () => resetChannelLevel(channel1Level));
    channel2Level.addEventListener('dblclick', () => resetChannelLevel(channel2Level));

    function syncChannelLevels() {
        if (channel1Source.value === channel2Source.value && channel1Source.value !== 'None') {
            resetChannelLevel(channel1Level);
            resetChannelLevel(channel2Level);
            channel2Level.value = channel1Level.value;
            updateLevelDisplay(channel2Level, channel2LevelValue);
        }
    }

    channel1Source.addEventListener('change', syncChannelLevels);
    channel2Source.addEventListener('change', syncChannelLevels);

    channel1Level.addEventListener('input', () => {
        if (channel1Source.value === channel2Source.value && channel1Source.value !== 'None') {
            channel2Level.value = channel1Level.value;
            updateLevelDisplay(channel2Level, channel2LevelValue);
        }
    });

    channel2Level.addEventListener('input', () => {
        if (channel1Source.value === channel2Source.value && channel1Source.value !== 'None') {
            channel1Level.value = channel2Level.value;
            updateLevelDisplay(channel1Level, channel1LevelValue);
        }
    });

    updateAudioSettingsButton.addEventListener('click', async () => {
        try {
            await Promise.all([
                makeApiCall('/audio/channel/0/input', 'PUT', { input: channel1Source.value }),
                makeApiCall('/audio/channel/0/level', 'PUT', { normalised: normalizeLevel(channel1Level.value, channel1Source.value) }),
                makeApiCall('/audio/channel/1/input', 'PUT', { input: channel2Source.value }),
                makeApiCall('/audio/channel/1/level', 'PUT', { normalised: normalizeLevel(channel2Level.value, channel2Source.value) })
            ]);

            console.log('Audio settings updated successfully');
            showStatusMessage('Audio settings updated successfully');
        } catch (error) {
            console.error('Failed to update audio settings:', error);
            showStatusMessage('Failed to update audio settings', true);
        }
    });

    // Initial fetch of audio settings
    fetchAudioSettings();
}

// Lens Control Module
function initializeLensControl() {
    const apertureSlider = document.getElementById('apertureSlider');
    const apertureValue = document.getElementById('apertureValue');
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomValue = document.getElementById('zoomValue');
    const focusSlider = document.getElementById('focusSlider');
    const focusValue = document.getElementById('focusValue');
    const autoFocusButton = document.getElementById('autoFocusButton');
    const lensStatusMessageDiv = document.getElementById('lensStatusMessage');
    const zoomControl = document.getElementById('zoomControl');

    let updateTimeout = null;
    const UPDATE_DELAY = 200; // milliseconds

    function showLensStatusMessage(message, isError = false) {
        lensStatusMessageDiv.textContent = message;
        lensStatusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
        lensStatusMessageDiv.style.display = 'block';
        lensStatusMessageDiv.style.opacity = '1';

        console.log(`Lens Control: ${message}`);

        setTimeout(() => {
            lensStatusMessageDiv.style.opacity = '0';
            setTimeout(() => {
                lensStatusMessageDiv.style.display = 'none';
            }, 500);
        }, 3000);
    }

    function updateSliderValue(slider, valueElement, value) {
        slider.value = value;
        valueElement.textContent = value;
    }

    async function detectZoomLens() {
        try {
            const initialZoom = await makeApiCall('/lens/zoom', 'GET');
            if (!('normalised' in initialZoom)) {
                console.error('Unexpected zoom response format:', initialZoom);
                return false;
            }

            const initialValue = initialZoom.normalised;
            
            // Try to set zoom to a slightly different value
            const testValue = initialValue < 0.5 ? initialValue + 0.1 : initialValue - 0.1;
            await makeApiCall('/lens/zoom', 'PUT', { normalised: testValue });
            
            // Check if the value has changed
            const newZoom = await makeApiCall('/lens/zoom', 'GET');
            
            // Reset to initial value
            await makeApiCall('/lens/zoom', 'PUT', { normalised: initialValue });

            return Math.abs(newZoom.normalised - initialValue) > 0.01; // Allow for small precision differences
        } catch (error) {
            console.error('Error detecting zoom lens:', error);
            return false;
        }
    }

    async function fetchLensSettings() {
        console.log('Fetching lens settings...');
        try {
            const [irisResponse, zoomResponse, focusResponse, autoExposureResponse] = await Promise.all([
                makeApiCall('/lens/iris', 'GET'),
                makeApiCall('/lens/zoom', 'GET'),
                makeApiCall('/lens/focus', 'GET'),
                makeApiCall('/video/autoExposure', 'GET')
            ]);

            console.log('Lens settings fetched:', { irisResponse, zoomResponse, focusResponse, autoExposureResponse });

            if (irisResponse && 'apertureStop' in irisResponse) {
                updateSliderValue(apertureSlider, apertureValue, irisResponse.apertureStop.toFixed(1));
            } else {
                console.error('Unexpected iris response format:', irisResponse);
            }

            const hasZoomLens = await detectZoomLens();
            if (hasZoomLens) {
                if (zoomResponse && 'normalised' in zoomResponse) {
                    updateSliderValue(zoomSlider, zoomValue, zoomResponse.normalised.toFixed(2));
                } else {
                    console.error('Unexpected zoom response format:', zoomResponse);
                }
                zoomControl.style.display = 'block';
            } else {
                zoomControl.style.display = 'none';
            }

            if (focusResponse && 'normalised' in focusResponse) {
                updateSliderValue(focusSlider, focusValue, focusResponse.normalised.toFixed(2));
            } else {
                console.error('Unexpected focus response format:', focusResponse);
            }

            // Check if aperture is under auto exposure control
            if (autoExposureResponse && autoExposureResponse.mode && autoExposureResponse.mode.mode !== 'Off') {
                setApertureAutoExposure(true);
            } else {
                setApertureAutoExposure(false);
            }

            showLensStatusMessage('Lens settings loaded');
        } catch (error) {
            console.error('Failed to fetch lens settings:', error);
            showLensStatusMessage('Failed to fetch lens settings', true);
        }
    }

    function setApertureAutoExposure(isAutoExposure) {
        if (isAutoExposure) {
            apertureSlider.disabled = true;
            apertureSlider.classList.add('auto-exposure');
            apertureValue.classList.add('auto-exposure');
            apertureValue.textContent += ' (Auto)';
        } else {
            apertureSlider.disabled = false;
            apertureSlider.classList.remove('auto-exposure');
            apertureValue.classList.remove('auto-exposure');
            apertureValue.textContent = apertureValue.textContent.replace(' (Auto)', '');
        }
    }

    async function updateLensSettings() {
        console.log('Updating lens settings...');
        try {
            const updatePromises = [
                makeApiCall('/lens/focus', 'PUT', { normalised: parseFloat(focusSlider.value) })
            ];

            if (!apertureSlider.disabled) {
                updatePromises.push(makeApiCall('/lens/iris', 'PUT', { apertureStop: parseFloat(apertureSlider.value) }));
            }

            if (zoomControl.style.display !== 'none') {
                updatePromises.push(makeApiCall('/lens/zoom', 'PUT', { normalised: parseFloat(zoomSlider.value) }));
            }

            const responses = await Promise.all(updatePromises);

            console.log('Lens settings update responses:', responses);
            showLensStatusMessage('Lens settings updated successfully');
        } catch (error) {
            console.error('Failed to update lens settings:', error);
            showLensStatusMessage('Failed to update lens settings', true);
        }
    }

    function debouncedUpdate() {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(updateLensSettings, UPDATE_DELAY);
    }

    apertureSlider.addEventListener('input', () => {
        apertureValue.textContent = apertureSlider.value;
        debouncedUpdate();
    });

    zoomSlider.addEventListener('input', () => {
        zoomValue.textContent = zoomSlider.value;
        debouncedUpdate();
    });

    focusSlider.addEventListener('input', () => {
        focusValue.textContent = focusSlider.value;
        debouncedUpdate();
    });

    autoFocusButton.addEventListener('click', async () => {
        console.log('Triggering auto focus...');
        try {
            await makeApiCall('/lens/focus/doAutoFocus', 'PUT');
            console.log('Auto focus triggered');
            showLensStatusMessage('Auto focus triggered');
        } catch (error) {
            console.error('Failed to trigger auto focus:', error);
            showLensStatusMessage('Failed to trigger auto focus', true);
        }
    });

    // Initial fetch of lens settings
    fetchLensSettings();
}

// Video Control Module
function initializeVideoControl() {
    const gainSlider = document.getElementById('gainSlider');
    const gainValue = document.getElementById('gainValue');
    const whiteBalanceSlider = document.getElementById('whiteBalanceSlider');
    const whiteBalanceValue = document.getElementById('whiteBalanceValue');
    const tintSlider = document.getElementById('tintSlider');
    const tintValue = document.getElementById('tintValue');
    const shutterSlider = document.getElementById('shutterSlider');
    const shutterValue = document.getElementById('shutterValue');
    const autoExposureSelect = document.getElementById('autoExposureSelect');
    const autoWhiteBalanceButton = document.getElementById('autoWhiteBalanceButton');
    const videoStatusMessageDiv = document.getElementById('videoStatusMessage');

    let updateTimeout = null;
    const UPDATE_DELAY = 200; // milliseconds

    function showVideoStatusMessage(message, isError = false) {
        const videoStatusMessageDiv = document.getElementById('videoStatusMessage');
        if (videoStatusMessageDiv) {
            videoStatusMessageDiv.textContent = message;
            videoStatusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
            videoStatusMessageDiv.style.display = 'block';
            videoStatusMessageDiv.style.opacity = '1';
    
            console.log(`Video Control: ${message}`);
    
            setTimeout(() => {
                videoStatusMessageDiv.style.opacity = '0';
                setTimeout(() => {
                    videoStatusMessageDiv.style.display = 'none';
                }, 500);
            }, 3000);
        } else {
            console.warn('Video status message element not found');
        }
    }

    function updateSliderValue(slider, valueElement, value) {
        slider.value = value;
        valueElement.textContent = value;
    }

    async function updateVideoSettings(setting, value) {
        console.log(`Updating video setting: ${setting} to ${value}`);
        try {
            let response;
            switch (setting) {
                case 'gain':
                    const evenGain = Math.round(parseInt(value) / 2) * 2;
                    response = await makeApiCall('/video/gain', 'PUT', { gain: evenGain });
                    break;
                case 'whiteBalance':
                    response = await makeApiCall('/video/whiteBalance', 'PUT', { whiteBalance: parseInt(value) });
                    break;
                case 'tint':
                    response = await makeApiCall('/video/whiteBalanceTint', 'PUT', { whiteBalanceTint: parseInt(value) });
                    break;
                case 'shutter':
                    response = await makeApiCall('/video/shutter', 'PUT', { shutterSpeed: parseInt(value) });
                    break;
                case 'autoExposure':
                    response = await makeApiCall('/video/autoExposure', 'PUT', { mode: value });
                    break;
            }
            console.log(`${setting} update response:`, response);
            showVideoStatusMessage(`${setting} updated successfully`);
        } catch (error) {
            console.error(`Failed to update ${setting}:`, error);
            showVideoStatusMessage(`Failed to update ${setting}`, true);
        }
    }

    function debouncedUpdate(setting, value) {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => updateVideoSettings(setting, value), UPDATE_DELAY);
    }

    gainSlider.addEventListener('input', () => {
        const evenValue = Math.round(gainSlider.value / 2) * 2;
        gainValue.textContent = evenValue;
        debouncedUpdate('gain', evenValue);
    });

    whiteBalanceSlider.addEventListener('input', () => {
        whiteBalanceValue.textContent = whiteBalanceSlider.value;
        debouncedUpdate('whiteBalance', whiteBalanceSlider.value);
    });

    tintSlider.addEventListener('input', () => {
        tintValue.textContent = tintSlider.value;
        debouncedUpdate('tint', tintSlider.value);
    });

    shutterSlider.addEventListener('input', () => {
        shutterValue.textContent = shutterSlider.value;
        debouncedUpdate('shutter', shutterSlider.value);
    });

    autoExposureSelect.addEventListener('change', () => {
        debouncedUpdate('autoExposure', autoExposureSelect.value);
    });

    autoWhiteBalanceButton.addEventListener('click', async () => {
        console.log('Triggering auto white balance...');
        try {
            await makeApiCall('/video/whiteBalance/doAuto', 'PUT');
            console.log('Auto white balance triggered');
            showVideoStatusMessage('Auto white balance triggered');
            // Fetch updated white balance value
            const whiteBalanceResponse = await makeApiCall('/video/whiteBalance', 'GET');
            console.log('New white balance:', whiteBalanceResponse.whiteBalance);
            updateSliderValue(whiteBalanceSlider, whiteBalanceValue, whiteBalanceResponse.whiteBalance);
            showVideoStatusMessage(`White balance updated to ${whiteBalanceResponse.whiteBalance}K`);
        } catch (error) {
            console.error('Failed to trigger auto white balance:', error);
            showVideoStatusMessage('Failed to trigger auto white balance', true);
        }
    });

    async function fetchVideoSettings() {
        console.log('Fetching video settings...');
        try {
            const [gainResponse, whiteBalanceResponse, tintResponse, shutterResponse, autoExposureResponse] = await Promise.all([
                makeApiCall('/video/gain', 'GET'),
                makeApiCall('/video/whiteBalance', 'GET'),
                makeApiCall('/video/whiteBalanceTint', 'GET'),
                makeApiCall('/video/shutter', 'GET'),
                makeApiCall('/video/autoExposure', 'GET')
            ]);

            console.log('Video settings fetched:', { gainResponse, whiteBalanceResponse, tintResponse, shutterResponse, autoExposureResponse });

            const evenGain = Math.round(gainResponse.gain / 2) * 2;
            updateSliderValue(gainSlider, gainValue, evenGain);
            updateSliderValue(whiteBalanceSlider, whiteBalanceValue, whiteBalanceResponse.whiteBalance);
            updateSliderValue(tintSlider, tintValue, tintResponse.whiteBalanceTint);
            updateSliderValue(shutterSlider, shutterValue, shutterResponse.shutterSpeed || shutterResponse.shutterAngle);

            autoExposureSelect.value = autoExposureResponse.mode.mode;

            showVideoStatusMessage('Video settings loaded');
        } catch (error) {
            console.error('Failed to fetch video settings:', error);
            showVideoStatusMessage('Failed to fetch video settings', true);
        }
    }

    // Initial fetch of video settings
    fetchVideoSettings();
}

// Color Correction Module
function initializeColorCorrection() {
    const colorControls = {
        lift: { red: 0, green: 0, blue: 0, luma: 0 },
        gamma: { red: 0, green: 0, blue: 0, luma: 0 },
        gain: { red: 1, green: 1, blue: 1, luma: 1 },
        offset: { red: 0, green: 0, blue: 0, luma: 0 },
        contrast: { pivot: 0.5, adjust: 1 },
        color: { hue: 0, saturation: 1 },
        lumaContribution: { lumaContribution: 1 }
    };

    const defaultValues = {
        lift: { red: 0, green: 0, blue: 0, luma: 0 },
        gamma: { red: 0, green: 0, blue: 0, luma: 0 },
        gain: { red: 1, green: 1, blue: 1, luma: 1 },
        offset: { red: 0, green: 0, blue: 0, luma: 0 },
        contrast: { pivot: 0.5, adjust: 1 },
        color: { hue: 0, saturation: 1 },
        lumaContribution: { lumaContribution: 1 }
    };

    const colorStatusMessageDiv = document.getElementById('colorStatusMessage');

    function showColorStatusMessage(message, isError = false) {
        colorStatusMessageDiv.textContent = message;
        colorStatusMessageDiv.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
        colorStatusMessageDiv.style.display = 'block';
        colorStatusMessageDiv.style.opacity = '1';

        console.log(`Color Correction: ${message}`);

        setTimeout(() => {
            colorStatusMessageDiv.style.opacity = '0';
            setTimeout(() => {
                colorStatusMessageDiv.style.display = 'none';
            }, 500);
        }, 3000);
    }

    function updateSliderValue(sliderId, value) {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(`${sliderId}Value`);
        if (slider && valueSpan) {
            slider.value = value;
            valueSpan.textContent = value;
            console.log(`Updated slider ${sliderId} to ${value}`);
        } else {
            console.error(`Slider or value span not found for ${sliderId}`);
        }
    }

    async function fetchColorSettings() {
        console.log('Fetching color correction settings...');
        try {
            for (const [key, value] of Object.entries(colorControls)) {
                console.log(`Fetching ${key} settings...`);
                const response = await makeApiCall(`/colorCorrection/${key}`, 'GET');
                console.log(`${key} response:`, response);
                Object.assign(value, response);
                updateUIFromSettings(key);
            }
            showColorStatusMessage('Color correction settings loaded');
        } catch (error) {
            console.error('Failed to fetch color correction settings:', error);
            showColorStatusMessage('Failed to fetch color correction settings', true);
        }
    }

    function updateUIFromSettings(control) {
        console.log(`Updating UI for ${control}`);
        const settings = colorControls[control];
        for (const [key, value] of Object.entries(settings)) {
            const sliderId = `${control}${key.charAt(0).toUpperCase() + key.slice(1)}`;
            updateSliderValue(sliderId, value);
        }
    }
    
    function resetAllColorCorrection() {
        console.log('Resetting all color correction settings');
        for (const [control, values] of Object.entries(defaultValues)) {
            for (const [key, value] of Object.entries(values)) {
                const sliderId = `${control}${key.charAt(0).toUpperCase() + key.slice(1)}`;
                updateSliderValue(sliderId, value);
                colorControls[control][key] = value;
            }
            updateColorSetting(control);
        }
        showColorStatusMessage('All color correction settings reset to default');
    }
    
    async function updateColorSetting(control, key, value) {
        console.log(`Updating ${control} ${key} to ${value}`);
        try {
            if (key) {
                // Single key update
                colorControls[control][key] = parseFloat(value);
            } else {
                // Full control update (for backwards compatibility)
                Object.assign(colorControls[control], value);
            }
            const response = await makeApiCall(`/colorCorrection/${control}`, 'PUT', colorControls[control]);
            console.log(`${control} update response:`, response);
            showColorStatusMessage(`${control} ${key ? key : ''} updated successfully`);
        } catch (error) {
            console.error(`Failed to update ${control} ${key ? key : ''}:`, error);
            showColorStatusMessage(`Failed to update ${control} ${key ? key : ''}`, true);
        }
    }

    function resetSlider(control, key) {
        const defaultValue = defaultValues[control][key];
        const sliderId = `${control}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        updateSliderValue(sliderId, defaultValue);
        updateColorSetting(control, key, defaultValue);
    }

    // Set up event listeners for all sliders and reset buttons
    for (const control of Object.keys(colorControls)) {
        for (const key of Object.keys(colorControls[control])) {
            const sliderId = `${control}${key.charAt(0).toUpperCase() + key.slice(1)}`;
            const slider = document.getElementById(sliderId);
            const resetButton = document.querySelector(`.resetButton[data-control="${control}"][data-key="${key}"]`);
            
            if (slider) {
                console.log(`Setting up listener for ${sliderId}`);
                slider.addEventListener('input', (event) => {
                    console.log(`Slider ${sliderId} input event: ${event.target.value}`);
                    updateSliderValue(sliderId, event.target.value);
                });
                slider.addEventListener('change', (event) => {
                    console.log(`Slider ${sliderId} change event: ${event.target.value}`);
                    updateColorSetting(control, key, event.target.value);
                });
            } else {
                console.error(`Slider not found: ${sliderId}`);
            }

            if (resetButton) {
                resetButton.addEventListener('click', () => resetSlider(control, key));
            } else {
                console.error(`Reset button not found for ${control} ${key}`);
            }
        }
    }
    const resetAllButton = document.getElementById('resetAllColorCorrection');
    if (resetAllButton) {
        resetAllButton.addEventListener('click', resetAllColorCorrection);
    } else {
        console.error('Reset All button not found');
    }
    // Initial fetch of color correction settings
    fetchColorSettings();
}