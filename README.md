# Jetrunner CLI

#### Jetrunner is a command line interface. It allows users to run Jetman app suites requests from command line to automate API testing and integrate with CI pipeline using Jenkins or smilar build pipelines. Refer to Jetman API development and testing pipeline for Jetman app at https://jetmanlabs.com

#### How it works?
Download Jetman app from our website https://jetmanlabs.com . Create new project and saves API's with various method like GET, PUT, POST etc. User can run API's from App using Runner module in App.
Since you know where you saved your API's project on you local filesystem. You can also find project path from settings->Project Settings window by clicking Settings icon in bottom right icon in footer.
As a advance user, If you want to run the API's project in CLI, Install the jetrunner-cli npm module using -g option. Refer getting started below.

#### List of Contents

- [Getting Started](#getting-started)
- [Options](#options)
  - [Jetrunner-cli Help](#jetrunner-cli-help)
  - [Run Time Options](#run-time-options)
- [Links](#links)
## Getting Started ##

**Installation**

Install globally to run from any dir using -g option as below:

 ````
 npm install -g jetrunner-cli
 ````
 Note: If you get access error while installing or running the command, please run command as sudo.

 After successful install, ensure to check version using command: jetrunner-cli --version

 Note: If above version command is not successfull, you may have to add the global node modules dir path to your PATH. Please refer https://stackoverflow.com/questions/5926672/where-does-npm-install-packages or https://stackoverflow.com/questions/18088372/how-to-npm-install-global-not-as-root

**How to run Jetman app suites?**

 There are 3 ways to run jetman project suites:
 1. Run from the Jetman project dir, If you know the path of your project or find project path from settings->Project Settings window by clicking Settings icon in bottom right icon in footer. cd to project dir from command line using command cd and then run the following command.
 ````
 jetrunner-cli
 ````
2. Run using option --project. With this option, you user can run from any dir by specifying the project path as below. Replace PATH_OF_PROJECT_TO_RUN with actual project filessytem path. Recommend to use absolute path.
 ````
 jetrunner-cli --project PATH_OF_PROJECT_TO_RUN
 ````
3. Using config file, this apporach works better if you have multiple projects with various parameters. users can create profiles in json format and run with confie file path and profile to run.
steps:
 Create a file named configfile.json and create profile enteries with run time options as below and save the file. The sample config can also be downloaded from https://jetmanlabs.com/assets/configfile.json . Enter project value as path of project and user can change profile name ans values of run time params like iteration from 1 to 2 or more etc.
  ````
  {
	"profile1": {
		"project": "",
		"iteration": 1,
		"delay": 0,
		"timeout": 0,
		"env": "",
		"tokenId": ""
	},

	"profile2": {
		"project": "",
		"iteration": 1,
		"delay": 0,
		"env": "",
		"tokenId": ""
	}
  ````
  ````
  jetrunner-cli --configFile CONFIG_FILR_PATH --profile NAME_OF_PROFILE_TO_RUN
  ````
# Options #


## Jetrunner-cli Help ##
Jetrunner CLI provides a rich set of options to customize a run. You can retrieve a list of options by running it with **jetrunner-cli --help** .

| **Options** | **Detail** |
| :--- | :--- |
| **--help** | Output various run time options to use |
| **--version** | Output the version number |
## Run Time Options ##

  --project      Full absolute path of project to run. Relative path is not recommended.                                              
  --delay        Delay (in ms)                                                                                                        
  --iteration    number of iterations to run, default 1                                                                               
  --timeout      Request timeout (in ms), default 60000 ms                                                                            
  --configFile   path of a Jetman configuration file                                                                                  
  --env          Active enviroment template, if ot given default env will taken                                                       
  --tokenId      Jetman token (to publish data to dashboard). Not supported at the moment.                                            
  --profile      Profile name from config file. This option works with config file having multiple profiles.                          
  --clear        Clear the console, default false                                                                                     
  --debug        Prints parsed arguments, default true to show failed request logs, default true                                      
  --showAll      Display detailed log data for requests/response, default false. (show only failed requests logs. works with --debug  
  --publish      Publish data to dashboard (Jetman dashboard). This feature is not supported yet. 

> $ jetrunner-cli --configfile "/path/of/configfile.json"
## Links ##
- **[Jetman App website](https://jetmanlabs.com)**
- **[Documentation](https://jetmanlabs.com/jetmanDoc/#Jetman-CLI)**
- <a href="https://jetmanlabs.com/assets/configfile.json" download>Download configfile.json</a>

