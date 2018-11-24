
# Tesla Cam - An experimental application to repair, store and upload Tesla dash cam footage
## Overview
As of late 2018 Tesla released V9 which among a number of improvements included dash cam functionality. This works by placing a suitably sized USB drive in one of the available USB ports at the front of the vehicle (Model S).

One drawback of this system, not uncommon in dash cams, there's no easy way to push this video to the 'cloud' - nor any any capability to view in near real-time. This project aims to make this possible.

Using a couple of tricks I've learned through tinkering with various single board computers, it is possible emulate a USB drive on the fly. In essence we are going emulate a USB drive, and periodically store the data on the SDHC. Once we have the video we can do what ever we'd like - maybe live stream, upload to your favourite cloud provider or simply backup the files when you return home.

## Hardware Requirements
1. 2017 (AP 2.5) or beyond Tesla
2. Raspberry Pi Zero W (only this model is supported)
3. A wireless access point within reasonable distance of the Pi (mobile phone, home router etc)
4. A sufficiently large SDHC card - minimum of 16gig is recommended, class 10 at a minimum
5. High quality short USB A to USB Micro cable - Anker is quite decent
6. Optional, a case to house the Raspberry Pi - anything with ventilation would be fine

## Software Requirements
1. 2018-11-13-raspbian-stretch-lite or later
2. Etcher to write the disk image to the SDHC card (dd, win32diskimager etc etc will also work)
3. daemontools package
4. NodeJS 10.x for Arm v6
5. OTG Mode enabled in the boot configuration

# Research & notes
* Tesla V9 Dashcam records up to one hour, in a circular buffer type fashion split into one minute increments
* One hour of footage uses approximately 1.8GiB of storage (over and above any emergency recordings)
* Each one minute increment of video is around 28MiB
* Emergency recordings are 10 minutes at most
* Copying 27 minutes (around 800MiB of data) of footage from a disk image to the ext4 file system takes approximately 4.2 minutes. SDHC class 10
* Time to unmount, repair and copy ~30 minutes of footage is around 4 minutes. In this test the file system wasn't corrupt.
* The Dash cam and USB ports only operate in the following situations
  * The car is powered on by unlocking the vehicle
  * Climate control is left on when you leave the car
* Climate control will only run for 3 hours - and is a rather wasteful from an energy perspective. This means the dashcam is not suitable for 24hr recording, a 'normal' dash cam is better suited if you have this requirement. 
* The Tesla Dash cam tends to be vastly clearer than a interior camera, particularly at night - very easy to make out number plates.
* FAT32, the file system supported by Tesla, cannot be mounted twice without corruption
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
 - Write companion script to upload files to a remote location
 - Experiment with streaming, it's trivial to stream to youtube with FFMPEG
 - Explain setup instructors
 - Write decent installation script to automatically configure the application on a Pi
 - Rotate the video storage to avoid running out of space
 - Use a read only file system to avoid corruption of the operating system
 - Security harden the install
 - Buy Tesla Roadster
