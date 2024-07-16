# BMMSC-4K-G2-Control
A control app for the BMMSC 4K G2

## About
This app is intended to be a control panel for the Blackmagic Micro Studio Camera 4K G2 using the REST API. 
Since this fantastic camera has no screen and many controls seem to be either buried in menus or unable to be set without the help of a hardware or software ATEM, we feel the need exists for a control panel that allows for the basic configuration of the camera.

## Features
As of time of writing, the app has the ability to:

- pull current settings from the camera and modify frame rate, off-speed frame rate, display the codec format
- allow the user to select presets (CORS problems we haven't figured out yet are keeping us from saving new presets),
- change the audio sources and levels (specifying the mic mode and 3.5mm mode, though abstractions, allows us to avoid various unsupported combinations of mono and single channel stereo sources that the camera did not seem to like.)
- control the aperture and indicate if it is being controlled by auto exposure, control the focus, control zoom if a zoom lens is detected, and execute an autofocus
- modify the gain, white balance, tint and shutter speed, as well as triggering an auto white balance. shutter speed is also indicated if in auto. switching auto exposure mode does not seem to be compatible with this camera. 
- color correction is also supported, providing a variety of color controls that each or all can be reset to factory defaults.

## Goals
Down the road, I'd like this interface to allow the modules to adapt to a 3x2 grid in landscape mode for devices like tablets. I also envision glowing colored borders around each moduke that serve in realtime as a communications status indicator as well as a health and setting parity feature for each module.  

## Requirements
This app requires the G2 to be connected via Ethernet over USB-C to a network. I have had success with a combination USB3 - Ethernet dongle. 

As of now, this app runs in desktop web browsers and iOS via CapacitorJS. It is not yet on the App Store. 
