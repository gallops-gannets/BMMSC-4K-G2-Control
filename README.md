# BMMSC-4K-G2-Control
A control app for the BMMSC 4K G2

This app is intended to be a control panel for the Blackmagic Micro Studio Camera 4K G2 using the REST API. 

It has the ability to:

- pull current settings from the camera and modify frame rate, off-speed frame rate, display the codec format
- allow the user to select presets (CORS problems we haven't figured out yet are keeping us from saving new presets),
- change the audio sources and levels (specifying the mic mode and 3.5mm mode, though abstractions, allows us to avoid various unsupported combinations of mono and single channel stereo sources that the camera did not seem to like.)
- control the aperture and indicate if it is being controlled by auto exposure, control the focus, control zoom if a zoom lens is detected, and execute an autofocus
- modify the gain, white balance, tint and shutter speed, as well as triggering an auto white balance. auto exposure mode isn't working yet.
- color correction is also supported, providing a variety of color controls that each or all can be reset to factory defaults.

down the road, we will work on making these modules foldable, as well as providing a user-facing way to specify and perhaps verify the IP address of the camera. 

testing and adapting this control panel to different platforms is also in the future.
