# dollar-general-interactive

This repo contains the application files for a <a href="https://storymaps.esri.com/stories/2020/dollar-general-interactive" target="_blank">map interactive</a> which is component of the <a href="https://storymaps.arcgis.com/stories/ef257732807f4dcb93210cdea9dad31e" target="_blank">General Knowledge StoryMap</a>.  The purpose the interactive is to show, within a given state, the locations of certain retail chains as well as an optional population density base map.  The chains are Dollar General, Walmart, McDonalds, Starbucks, and Whole Foods.

## Deployment

The primary file types in this repo are **html**, **css**, and **javascript**.  To deploy, simply copy the folder to a web server directory.

## Notes for developers

* This is a simple [JAMstack](https://jamstack.org/) project, consisting only of vanilla javascript (no frameworks)

* The *html*, *css*, and *javascript* files in this project do not require build scripts.  Source files can be edited and re-deployed with modifications.

	* Note: *Css* developers have an alternative to working with the css code directly. If you're familiar with [Sass](https://sass-lang.com/) (which we use for convenience in developing our css), you can work with the *scss* source files provided (in the *scss* folder).

* Files you can ignore:

	* *Gruntfile.js*: A file that I use to automate some tasks in my own environment.  This file does not directly relate to the mechanics of the application.
	* Source *scss* files in the *scss* folder. If you're not using Sass, you needn't worry about these.
