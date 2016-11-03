# RobotArmJS

This library is an easy and enjoyable way to start learning the basics of programming using javascript. You can program a robot arm to move boxes in piles from one pile to another. For example: you can instruct the robot arm to scan the color of boxes and then sort these boxes to different piles according to their colors
![robot arm](https://github.com/davinci-ao-studio/robotarmjs/blob/master/robotarm.png "Robot arm")

##Getting started with this library
* Create a HTML-page like this:
``` html
<html>
    <body>
        <canvas id="canvas" width="800" height="600"></canvas>
        <script src="robot-arm.js"></script>
        <script>
            // Initialize the robot arm
            var canvas = document.getElementById("canvas");
            var robotArm = new RobotArm(canvas);
            
            // Either use loadLevel or randomLevel to create a start scene
            robotArm.loadLevel("exercise 1");
            
            // My instructions come here
            
            

            // Call run to run the animations
            robotArm.run();
        </script>
    </body>
</html>
```
* Put the robot-arm.js in the map where your HTML-page resides
* Test your code running by loading your HTML-page in a modern browser
* Use the console window in the developer tools (F12) of your browser to check if the code runs without errors

##Methods you can use
### robotArm.loadLevel(name)
Displays the robot arm above a predefined set of piles of boxes according to the given *name*
####code example
``` Javascript
robotArm.loadLevel('exercise 1');
```
### robotArm.loadRandomLevel()
Displays the robot arm above a random set of piles of boxes
####code example
``` Javascript
robotArm.loadRandomLevel();
```
### robotArm.moveRight()
Moves the robot arm to the right (to the next pile of boxes)
####code example
``` Javascript
robotArm.moveRight();
```
###robotArm.moveLeft()
Moves the robot arm to the left (to the previous pile of boxes)
####code example
``` Javascript
robotArm.moveLeft();
```
###robotArm.grab()
Grabs the highest box from the current pile of boxes. The arm will hold the box until it is dropped somewhere
####code example
``` Javascript
robotArm.grab();
```
###robotArm.drop()
Drops the box the arm is holding on top of the current pile of boxes
####code example
``` Javascript
robotArm.drop();
```
###robotArm.scan()
Scans the color of the box the arm is holding. The robotArm.scan() returns this color. If the arm is not holding any box then *null* is returned
####code example
``` Javascript
color = robotArm.scan();
```
##Properties you can set
###robotArm.speed 
Determines the speed of the animated robot arm. Default value is 50
####code example
``` Javascript
robotArm.speed = 100;
```
