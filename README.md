# Jetrunner CLI

#### Jetrunner is a command line interface. It allows you to run all the suites and fetching the response directly from the command line.

#### Jetrunner resides in the NPM registry and on Github.

## Links
- **[Documentation](https://jetmanlabs.com/maindoc.html#download_and_installation)**
- <a href="https://jetmanlabs.com/maindoc.html#download_and_installation" download>Download configfile.json</a>

#### List of Contents

- [Getting Started](#getting-started)
  - [Config File](#config-file)
- [Options](#options)
  - [Utility](#utility)
  - [Basic Setup](#basic-setup)
  - [Request Options](#request-options)


## Getting Started ##

Jetrunner is built on Node.js, To run Jetrunner make sure you have Node.js installed on your system.

You can download and install Node.js on Linux, Windows and MacOS.

After you install Node.js Jetrunner is just command away. Install Jetrunner-CLI module from npm globally on your system, which allow you to run it from anywhere.

> $ npm install -g jetrunner-cli

Note: If you get access error while installing or running the command, please run command as sudo.

> $ sudo npm install -g jetrunner-cli


After successfull installation of node package, the very first thing is you need to select configFile path by passing --configfile / -c flag. If you not pass --configfile / -c flag then jetcli command will search for config file in current directory and if it doesn't find file in the directory than it'll through an error.

## Config File ##

Config File is a JSON file in which we create a JSON object. Where we can create multiple key value pairs. Each key represent to different profile. You can name it as profile1, profile2 or as you want, it's up to you.

Each profile further contains the JSON object, where we can pass multiple key value pairs, for example projectPath, iteration, delay, timeout, env etc. Each key contains values as per your need.

Click <a href="https://jetmanlabs.com/maindoc.html#runnercli_gettingStarted" download>here</a> to download configfile.json. After downloading just move that file to location where you feel comfortable to access it later from command line and replace the default values as per your need.

In Jetrunner cli we can pass diffrent flag like environment, iteration, delay, profile and lot more. We'll discuss these flags later.

# Options #

Jetrunner CLI provides a rich set of options to customize a run. You can retrieve a list of options by running it with the **-h || --help** flag.

> $ jetrunner-cli --configfile "/path/of/configfile.json" --profile "profilename"

Note: If you get access error while running the command, please run command as sudo.

> $ sudo jetrunner-cli --configfile "/path/of/configfile.json" --profile "profilename"

## Utility ##

| **Options** | **Detail** |
| :--- | :--- |
| **-h, --help** | Output usage information |
| **-v, --version** | Output the version number |


## Basic Setup ##

| **Options** | **Detail** |
| :--- | :--- |
| **-p, --projectPath [Folder Path]** | Specify the path of a Jetman Project to run |
| **-c, --configFile [File Path]** | Specify the path of a Jetman configuration file |
| **--profile [Object Key]** | Specify the profile to select from Jetman configuration file |


## Request Options ##

| **Options** | **Detail** |
| :--- | :--- |
| **-d, --delay [Number]** | Specify the extent of delay between requests (milliseconds) |
| **-t, --timeout [Number]** | Specify a timeout for request to run ( in milliseconds) |
| **--i, --iteration [Number]** | Define the number of iterations to run |
| **-e, --env [Environment Name]** | Specify the project envirnment |
| **-v, --verbose** | Used for debug to print entire request response |

To provide a different set of data, such as (project path, configfile path, iteration, delay etc.) you can use the **-c || --configfile** to specify a JSON file.

> $ jetrunner-cli --configfile "/path/of/configfile.json"

Note that, you have to surely mention profile name. Run command as sudo user if you notice access error.
