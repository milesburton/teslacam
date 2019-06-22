
# Tesla Cam - An experimental application to repair, store and upload Tesla dash cam footage
## Current capabilities
 - [Backup] Storage of Tesla Cam videos
 - [Dropbox] Upload videos to Dropbox when a internet connection is available
 - [Remote] Basic Mobile App (Web UI) which lets you view videos on your phone, download videos and ability to enable/disable services at will. Available on port 3000 on the IP address of your Pi (Temporarily disabled)
 - [Security] Services now run as the pi user and all super user commands are whitelisted
 - [Housekeeping] System will delete old videos when remaining storage space falls below 20%

## Overview
As of late 2018 Tesla released V9 which among a number of improvements included dash cam functionality. This works by placing a suitably sized USB drive in one of the available USB ports at the front of the vehicle (Model S).

One drawback of this system, not uncommon in dash cams, there's no easy way to push this video to the 'cloud' - nor any capability to view in near real-time. This project aims to make this possible.

Using a couple of tricks I've learned through tinkering with various single board computers, it is possible emulate a USB drive on the fly. In essence we are going emulate a USB drive, and periodically store the data on the SDHC. Once we have the video we can do what ever we'd like - maybe live stream, upload to your favourite cloud provider or simply backup the files when you return home.

## Hardware Requirements
1. 2017 (AP 2.5) or beyond Tesla
2. Raspberry Pi Zero W (only this model is supported)
3. A wireless access point within reasonable distance of the Pi (mobile phone, home router etc)
4. A sufficiently large SDHC card with the fastest write speeds you can find, at least 16Gig, ideally the largest you can buy. 
5. High quality short USB A to USB Micro cable - Anker is quite decent
6. Optional, a case to house the Raspberry Pi - anything with ventilation would be fine

## Software Requirements
1. 2018-11-13-raspbian-stretch-lite or later
2. Etcher to write the disk image to the SDHC card (dd, win32diskimager etc etc will also work)
3. daemontools package
4. NodeJS 10.x for Arm v6
5. OTG Mode enabled in the boot configuration
6. [Dropbox uploader](https://github.com/andreafabrizi/Dropbox-Uploader)

## Instructions (Detail to come)
1. [Download](https://www.raspberrypi.org/downloads/raspbian/) and burn the latest "lite" Raspbian to a suitable SDHC card using [Etcher](https://www.balena.io/etcher/) (or equivalent) 
2. Modify the /boot partition to [enable USB OTG](https://gist.github.com/gbaman/50b6cca61dd1c3f88f41) We need to enable g_mass_storage and dw2.
3. Add your [WIFI configuration details](https://www.raspberrypi-spy.co.uk/2017/04/manually-setting-up-pi-wifi-using-wpa_supplicant-conf/) (consider adding several, including a portable hotspot such as your phone)
4. Install daemontools. Follow [these steps](https://isotope11.com/blog/manage-your-services-with-daemontools) up until "Making Services"
5. Install [Nodejs for Linux Arm V6](https://nodejs.org/en/download/). Gunzip this to /opt/node, symlink to /usr/bin
6. As root (sudo su)
  * Clone [Dropbox-Uploader](https://github.com/andreafabrizi/Dropbox-Uploader) (if you want dropbox upload capability). Be sure to follow the instructions including creating a 'TeslaCam' app on the dropbox portal
  * Clone this repository to /home/pi/teslacam
  * Create the services sym links as follows cd /etc/service ln -s /home/pi/teslacam/services/* .
7. Under /home/pi/teslacam run npm install
8. Under /home/pi/teslacam/src/remote run npm install
9. Plug the Pi Zero W into the Tesla media USB ports (the front ports). Make sure you use the data port on the Pi, google if you are unsure.
10. Reboot, once the automatic configuration completes (circa 1 minute) the car should detect the Pi as a USB drive.

# Research & notes
* Tesla V9 Dashcam records up to one hour, in a circular buffer type fashion split into one minute increments
* One hour of footage uses approximately 1.8GiB of storage (over and above any emergency recordings)
* Each one minute increment of video is around 28MiB
* Emergency recordings are 10 minutes at most
* Copying 27 minutes (around 800MiB of data) of footage from a disk image to the ext4 file system takes approximately 4.2 minutes. SDHC class 10
* Time to unmount, repair and copy ~30 minutes of footage is around 4 minutes. In this test the file system wasn't corrupt.
* The Dash cam, USB & 12V ports only operate in the following situations
  * The car is powered on by unlocking the vehicle
  * Climate control is left on when you leave the car
  * It would appear as of V9 the USB ports are powered whilst charging (TBC). May not apply if you use range mode.
  * Sentry mode is enabled
* The Tesla Dash cam tends to be vastly clearer than a interior camera, particularly at night - very easy to make out number plates.
* FAT32, the file system supported by Tesla, cannot be mounted twice without corruption (ie, Real Time streaming is not possible, though near real-time with a 1 minute lag is)
* The car will cut off power to the USB ports without warning, this can cause corruption of video files and any file systems which can not tolerate power loss. This is a tricky issue as there are number of caches (software and hardware) that need to be flushed before power is removed.
* Lipo batteries are not advised within the cabin, temperatures of over 60c have been reported in summer.

## Approach
Primarily there is a trade-off between lost video vs accessibility (our ability to do something useful with the captured footage). To download the Tesla Dash cam video we need to temporarily stop the recording, as Dash cam records in 1 minute increments we are likely to lose at least this much video - possibly more, possibly less depending on timing. 

The second concern is we have no signal for when the car will be powered down - ie, you've parked up for the day - the longer we allow the car to record, the higher the possibility that video will be "trapped" in the vehicle till you next power up.

Finally to enable capabilities such as near-real-time monitoring or streaming that video must be transferred to the Pi as quickly as possible. The longer the car records, the longer it takes to transfer - and so on. 

To mitigate the issue we need to pick a comfortable number of minutes, say between 10-30 minutes. To add to the fun, we must minimise the duration the car is not recording - to this end we need to switch out our emulated USB drives as quickly as possible which can be done by using two (or more) images swapped over whilst the video files are transferred across.

With all this in mind, logically speaking the following steps need to be followed

 - When the Pi powers up
	* Create or mount two disk images
	* Scan disk images for errors, and repair
	* If images contain any videos copy them to the Pi
	* Unmount both images from the PI
 - In a loop pick one disk image
	* Mount the image allowing the vehicle to begin recording
	* Wait 30 minutes to accumulate video
	* Unmount the image from the car
	* Mount the second Image for the car to record
	* Scan and fix any errors on the first image
	* Mount the first image on the Pi
	* Move all video onto the Pi
	* Unmount the first image on the Pi
	

## TODO
 - [Streaming] Experiment with streaming, it's trivial to stream to youtube with FFMPEG
 - [System] Reverse VPN so the PI is accessible irrespective of the cars location (assuming WIFI is available)
 - [Remote] Remote configuration
 - [Remote] Infinite pagination
 - [Dropbox] Prioritise emergency video upload 
 - [Github] Explain setup instructions (more detail required)
 - [Github] Write decent installation script to automatically configure the application on a Pi
 - [System] Use a read only file system to avoid corruption of the operating system
 - [System] Make performance metrics more useful (time to upload video etc)
 - [System] Improve logging
 - [Thoughts] Automatic WiFi hotspot on first boot
 - [Me] Buy Tesla Roadster 

## Referrals, and coffee 
- Tesla Referral link for 1000 free supercharging miles if you buy a new Tesla: https://ts.la/miles16015
- If this was useful and you fancy sending some e-coffee, check out https://paypal.me/milesburton1337
