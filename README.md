# Tesla Cam - An experimental application to repair, store and upload Tesla dashcam footage
## Overview
As of late 2018 Tesla released V9 which among a number of improvements included dashcam functionality. This works by placing a suitably sized USB drive in one of the available USB ports at the front of the vehicle (Model S).

One drawback of this system, not uncommon in dashcams, there's no easy way to push this video to the 'cloud' - nor any any capability to view in near real-time. This project aims to make this possible.

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

# Research & notes
* Tesla V9 Dashcam records up to one hour, in a circular buffer type fashion split into one minute increments
* One hour of footage uses approximately 1.8GiB of storage (over and above any emergency recordings)
* Each one minute increment of video is around 28MiB
* Emergency recordings are 10 minutes at most

* Copying 27 minutes (around 800MiB of data) of footage from a disk image to the ext4 filesystem takes approximately 4.2 minutes. SDHC class 10

* Time to unmount, repair and copy ~30 minutes of footage is around 4 minutes. In this test the filesystem wasn't corrupt.
