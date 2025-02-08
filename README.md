# 🚗 Tesla Cam: Dash Cam Footage Management System 📹

## 🌟 Current Capabilities

- 💾 **Backup**: Secure storage of Tesla Cam videos
- ☁️ **Cloud Integration**: 
  - Dropbox upload when internet is available
  - Optional remote sync services
- 📱 **Mobile Access**: 
  - Web UI for video viewing
  - Download and service management
  - (Temporarily disabled)

## 🚀 Project Overview

### 🤔 The Problem
Tesla's dash cam system (introduced in V9) lacks an easy way to:
- Push videos to the cloud
- View footage in near real-time

### 💡 Our Solution
By using a Raspberry Pi Zero W, we can:
- Emulate a USB drive
- Periodically store video data
- Enable advanced features like:
  - Cloud backup
  - Live streaming
  - Remote access

## 🛠 Hardware Requirements

1. 🚘 Tesla (2017 AP 2.5 or newer)
2. 🍓 Raspberry Pi Zero W
3. 📡 Wireless access point
4. 💽 SDHC Card
   - Minimum 16GB
   - Fastest write speeds possible
5. 🔌 High-quality USB A to Micro USB cable
6. 🏠 Optional: Raspberry Pi case with ventilation

## 💻 Software Requirements

1. 🐧 Raspbian Stretch Lite (2018-11-13 or later)
2. 💿 Disk imaging tool (Etcher recommended)
3. 🐳 Docker
4. 🔧 OTG Mode enabled in boot configuration

## 🚦 Quick Setup Guide

### On Your Desktop Computer

1. 📥 Download Raspbian Lite
2. 🖊️ Modify boot partition:
   - Add `dtoverlay=dwc2` to `config.txt`
   - Add `modules-load=dwc2,g_mass_storage` to `cmdline.txt`
3. 📶 Configure WiFi
4. 🔓 Enable SSH by creating empty `ssh` file

### On Raspberry Pi (via SSH)

1. 🔌 Connect Pi to Tesla's USB port
2. 🖥️ SSH into Pi
3. 🚀 Run installation script:
   ```bash
   $ GET_TESLACAM=`mktemp` \
   curl -fsSL https://git.io/JeWlq -o ${GET_TESLACAM} && \ 
   sh ${GET_TESLACAM} && \
   rm ${GET_TESLACAM}
   ```

## 🔧 Optional Services

### 📡 Rsync Upload
- Generate SSH key
- Configure remote target
- Automatically upload videos

### ☁️ Dropbox Upload
- Obtain Dropbox token
- Configure upload container
- Automatic cloud backup

## 🧠 Technical Insights

- 📹 Tesla V9 Dash Cam Details:
  - Records up to 1 hour
  - Circular buffer
  - 1-minute video increments
  - ~28MB per minute
- ⚠️ Key Challenges:
  - Minimizing video loss during transfer
  - Handling unpredictable power scenarios
  - Quick video extraction

## 🚧 Future Roadmap

- [ ] 🎥 Video streaming capabilities
- [ ] 🌐 Reverse VPN access
- [ ] 🛠 Remote configuration
- [ ] 📈 Improved performance metrics
- [ ] 🔒 Read-only file system
- [ ] 📲 Automatic WiFi hotspot

## 🙌 Support the Project

- 🚗 [Tesla Referral Link](https://ts.la/miles16015): Get 1000 free supercharging miles
- ☕ [Buy me a coffee](https://paypal.me/milesburton1337)

**Disclaimer**: Project is experimental. Use at your own risk! 🚨
