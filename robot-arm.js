/**
 * The robot arm constructor
 * 
 * @param {HTMLCanvasElement} canvas The canvas element used for drawing the robot arm on.
 */
var RobotArm = function (canvas) {
    // So we can reference this when we are inside other functions
    var self = this;
    // This wont be visible to the consumers of the RobotArm instance
    var local = {};
    // The Canvas2DContext we can draw with
    var ctx = canvas.getContext("2d");

    // The amount of columns to use
    self.columns = 10;
    // The amount of rows to use
    self.rows = 8;
    // The speed of which the animations go
    self.speed = 50;

    // List of animations
    local.animationList = [];
    // Current animation
    local.currentAnimation = 0;

    // Handles the arm
    local.arm = {};
    // The position of the arm
    local.arm.position = 0;
    // Arm Rendering properties
    local.arm.horizontalOffset = 0;
    local.arm.verticalOffset = 0;
    local.arm.height = 25;
    local.arm.hookHeight = 10;

    // Handles the floor
    local.floor = {};
    // The height of the column separator, set to 0 to remove separators
    local.floor.columnSeparatorHeight = 10;
    // The padding between the blocks and the separators
    local.floor.columnSeparatorPadding = 5;

    // Handles the blocks
    local.blocks = {};
    local.blocks.availableColors = ["red", "blue", "green", "white"];
    local.blocks.map = null;
    local.blocks.held = null;
    
    // State variables
    local.state = {};
    // Arm
    local.state.arm = {};
    local.state.arm.position = 0;
    // Blocks 
    local.state.blocks = {};
    local.state.blocks.map = null;
    local.state.blocks.held = null;

    // Handles the settings
    local.settings = {};
    // The background color of the robot arm canvas
    local.settings.backgroundColor = "#EEE";

    local.getAvailableTotalRowsHeight = function () {
		return ctx.canvas.height - local.arm.height - local.arm.hookHeight;
	};

    local.copyMap = function (map) {
        var newMap = [];
		for (var i = 0; i < map.length; i++) newMap.push(map[i].slice());
		return newMap;
    };

    var runTime;
    /**
     * Renders all of the robot arm
     */
    local.render = function () {
        var now = new Date().getTime();
		var dt = now - (runTime || now);
        // Clear surface to start a new frame
        ctx.beginPath();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw the background
        ctx.fillStyle = local.settings.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Do animation
        if (local.animationList.length > local.currentAnimation && local.animationList[local.currentAnimation](dt != 0 ? dt : 9999999)) {
            local.currentAnimation++;
        }

        // Render all
        local.renderFloor();
        local.renderArm();
        local.renderBlocks();

        // Draw everything
        ctx.stroke();
        ctx.stroke();

        runTime = now;

        requestAnimationFrame(local.render);
    };

    local.renderFloor = function () {
        // Save state and restore after rendering
        ctx.save();
        // Set line color to black
		ctx.strokeStyle = "#000";
		// Draw line beneath
		ctx.moveTo(0, ctx.canvas.height);
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
		// Draw column separators
		var columnWidth = ctx.canvas.width / self.columns;
		for (var i = 0; i < self.columns + 1; i++) {
			ctx.moveTo(i * columnWidth, ctx.canvas.height);
			ctx.lineTo(i * columnWidth, ctx.canvas.height - local.floor.columnSeparatorHeight);
		}
        // Restore after rendering arm
        ctx.restore();
    };

    local.renderArm = function () {
        // Save state and restore after rendering
        ctx.save();
        // Set drawing color to black
        ctx.strokeStyle = "#000";

        var columnWidth = ctx.canvas.width / self.columns;
		var columnXPosForCurrentColumn = local.arm.position * columnWidth;
		var blockWidth = (ctx.canvas.width / self.columns) - local.floor.columnSeparatorPadding * 2;

		ctx.moveTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + columnWidth / 2, 0);
		ctx.lineTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + columnWidth / 2, local.arm.height + local.arm.verticalOffset);

		ctx.moveTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + local.floor.columnSeparatorPadding, local.arm.height + local.arm.verticalOffset);
		ctx.lineTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + columnWidth - local.floor.columnSeparatorPadding, local.arm.height + local.arm.verticalOffset);

		ctx.moveTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + local.floor.columnSeparatorPadding, local.arm.height + local.arm.verticalOffset);
		ctx.lineTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + local.floor.columnSeparatorPadding, local.arm.height + local.arm.hookHeight + local.arm.verticalOffset);

		ctx.moveTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + columnWidth - local.floor.columnSeparatorPadding, local.arm.height + local.arm.verticalOffset);
		ctx.lineTo(local.arm.horizontalOffset + columnXPosForCurrentColumn + columnWidth - local.floor.columnSeparatorPadding, local.arm.height + local.arm.hookHeight + local.arm.verticalOffset);

        if (local.blocks.held != null) {
				var blockHeight = local.getAvailableTotalRowsHeight() / self.rows;
				// Drawing the inner color of the rectangle
				ctx.fillStyle = local.blocks.held;
				ctx.fillRect(local.arm.horizontalOffset + columnXPosForCurrentColumn + local.floor.columnSeparatorPadding + 1,
					local.arm.height + local.arm.verticalOffset + 1,
					blockWidth - 3,
					blockHeight - 2);

				// Set the stroke color to black
				ctx.strokeStyle = "#000";
				// Drawing the outer rectangle
				ctx.rect(local.arm.horizontalOffset + columnXPosForCurrentColumn + local.floor.columnSeparatorPadding + 1,
					local.arm.height + local.arm.verticalOffset + 1,
					blockWidth - 2,
					blockHeight - 1);
		}

        // Restore after rendering arm
        ctx.restore();
    };

    local.renderBlocks = function () {
        // Save state and restore after rendering
        ctx.save();
        // Calculate some values to know where to draw and how large
		var columnWidth = ctx.canvas.width / self.columns;
		var blockHeight = local.getAvailableTotalRowsHeight() / self.rows;
		var blockWidth = (ctx.canvas.width / self.columns) - local.floor.columnSeparatorPadding * 2;

		// For every block do
		for (var column = 0; column < local.blocks.map.length; column++) {
			var col = local.blocks.map[column];
			if (!col) continue;
			for (var row = 0; row < col.length; row++) {
				//console.log("Column: " + column + " Row: " + row + " has color " + local.blocks.map[column][row]);
				// Base position of the column we are working with (used for calculating the padding)
				var columnXPosForCurrentColumn = column * columnWidth;
				// Drawing the inner color of the rectangle
				ctx.fillStyle = local.blocks.map[column][row];
				ctx.fillRect(columnXPosForCurrentColumn + local.floor.columnSeparatorPadding + 1,
					ctx.canvas.height - blockHeight * (row + 1) - 1,
					blockWidth,
					blockHeight - 1);

				// Set the stroke color to black
				ctx.strokeStyle = "#000";
				// Drawing the outer rectangle
				ctx.rect(columnXPosForCurrentColumn + local.floor.columnSeparatorPadding,
					ctx.canvas.height - blockHeight * (row + 1) - 1,
					blockWidth,
					blockHeight);
			}
		}
        // Restore after rendering arm
        ctx.restore();
    };

    local.moveRightAnimation = function (dt) {
        local.arm.horizontalOffset += (self.speed * ctx.canvas.width) / 1000 / dt;

        if (local.arm.horizontalOffset <= ctx.canvas.width / self.columns) {
            return false;
        }

        local.arm.horizontalOffset = 0;
        local.arm.position++;
        return true;
    };

    local.moveLeftAnimation = function (dt) {
        local.arm.horizontalOffset -= (self.speed * ctx.canvas.width) / 1000 / dt;

        if (local.arm.horizontalOffset * -1 <= ctx.canvas.width / self.columns) {
            return false;
        }

        local.arm.horizontalOffset = 0;
        local.arm.position--;
        return true;
    };

    local.grabAnimation = function (dt) {
        if (!this.isMovingUp) {
            if (local.moveArmDownAnimation(dt)) {
                this.isMovingUp = true;
                if (local.blocks.map[local.arm.position] && local.blocks.map[local.arm.position].length > 0) {
                    local.blocks.held = local.blocks.map[local.arm.position][local.blocks.map[local.arm.position].length - 1];
                    var row = local.blocks.map[local.arm.position];
                    var blocksInRow = row.length;
                    row.splice(blocksInRow - 1, 1);
                }
            }
            return false;
        }
        if (local.moveArmUpAnimation(dt)) {
            this.isMovingUp = false;
            return true;
        }
    };

    local.dropAnimation = function (dt) {
        if (!this.isMovingUp) {
            if (local.moveArmDownAnimation(dt)) {
                this.isMovingUp = true;
                if (local.blocks.held != null) {
                    if (!local.blocks.map[local.arm.position]) local.blocks.map[local.arm.position] = [];
                    local.blocks.map[local.arm.position].push(local.blocks.held);
                    local.blocks.held = null;
                }
            }
            return false;
        }
        if (local.moveArmUpAnimation(dt)) {
            this.isMovingUp = false;
            return true;
        }
    }

    local.moveArmDownAnimation = function (dt) {
        local.arm.verticalOffset += (self.speed * 2 * ctx.canvas.height) / 1000 / dt;

        var rowsForCurrentColumn = (local.blocks.map[local.arm.position] != undefined ? local.blocks.map[local.arm.position] : []).length;
		var blockHeight = local.getAvailableTotalRowsHeight() / self.rows;

        if (local.blocks.held != null) rowsForCurrentColumn++;

        var blocksTotalHeight = rowsForCurrentColumn * blockHeight;
		var distanceToTravel = ctx.canvas.height - blocksTotalHeight - local.arm.height - 3;

        if (distanceToTravel >= local.arm.verticalOffset) {
            return false;
        }

        return true;
    };

    local.moveArmUpAnimation = function (dt) {
        local.arm.verticalOffset -= (self.speed * 2 * ctx.canvas.height) / 1000 / dt;

        if (0 <= local.arm.verticalOffset) {
            return false;
        }

        local.arm.verticalOffset = 0;
        return true;
    };

    /**
     * Moves the robot arm one position to the right if possible
     * 
     * @returns
     */
    self.moveRight = function () {
        // Don't do anything if we would move out of the columns
        if (local.arm.position + 1 > self.columns) return;
        local.animationList.push(local.moveRightAnimation);
        local.state.arm.position++;
    };
    /**
     * Moves the robot arm one position to the left if possible
     */
    self.moveLeft = function () {
        if (local.state.arm.position - 1 < 0) return;
        local.animationList.push(local.moveLeftAnimation);
        local.state.arm.position--;
    };
    /**
     * Returns the color of the held block, if any
     * @returns {null|string} The name of the color of the block that is being held 
     */
    self.scan = function () {
        return local.state.blocks.held || null;
    };
    /**
     * Grabs a block from beneath, if possible
     */
    self.grab = function () {
        local.animationList.push(local.grabAnimation);
        if (local.state.blocks.map[local.state.arm.position] && local.state.blocks.map[local.state.arm.position].length > 0) {
            local.state.blocks.held = local.state.blocks.map[local.state.arm.position][local.state.blocks.map[local.state.arm.position].length - 1];
            var row = local.state.blocks.map[local.state.arm.position];
            var blocksInRow = row.length;
            row.splice(blocksInRow - 1, 1);
        }
    };
    /**
     * Drops a block beneath, if possible
     */
    self.drop = function () {
        local.animationList.push(local.dropAnimation);
        if (local.state.blocks.held != null) {
            if (!local.state.blocks.map[local.state.arm.position]) local.state.blocks.map[local.state.arm.position] = [];
            local.state.blocks.map[local.state.arm.position].push(local.state.blocks.held);
            local.state.blocks.held = null;
        }
    };

    self.setMap = function (map) {
        local.blocks.map = map.slice();
        local.state.blocks.map = local.copyMap(map);
    };

    self.loadLevel = function(levelName) {
        switch (levelName) {
            case "exercise 1":
                self.setMap([[], ["red"]]);
                break;
            case "exercise 2":
                self.setMap([["blue"], [] ,[], [], ["blue"], [], [], ["blue"]]);
                break;
            case "exercise 3":
                self.setMap([["white", "white", "white", "white"]]);
                break;
            case "exercise 4":
                self.setMap([["blue", "white", "green"]]);
                break;
            case "exercise 5":
                self.setMap([[], ["red", "red", "red", "red", "red", "red", "red"]]);
                break;
            case "exercise 6":
                self.setMap([["red"], ["blue"], ["white"], ["green"], ["green"], ["blue"], ["red"], ["white"]]);
                break;
            case "exercise 7":
                self.setMap([
                    [],
                    ["blue", "blue", "blue", "blue", "blue", "blue"],
                    [],
                    ["blue", "blue", "blue", "blue", "blue", "blue"],
                    [],
                    ["blue", "blue", "blue", "blue", "blue", "blue"],
                    [],
                    ["blue", "blue", "blue", "blue", "blue", "blue"],
                    [],
                    ["blue", "blue", "blue", "blue", "blue", "blue"]
                ]);
                break;
            case "exercise 8":
                self.loadLevel("exercise 5");
                break;
            case "exercise 9":
                self.setMap([
                    ["blue"],
                    ["green", "green"],
                    ["white", "white", "white"],
                    ["red", "red", "red", "red"]
                ]);
                break;
            case "exercise 10":
                self.setMap([
                    ["green"],
                    ["blue"],
                    ["white"],
                    ["red"],
                    ["blue"]
                ]);
                break;
            case "exercise 11":
                self.setMap([
                    [],
                    ["white"],
                    ["red"],
                    ["red"],
                    ["blue"],
                    ["red"],
                    ["green"],
                    ["blue"],
                    ["green"],
                    ["green"]
                ]);
                break;
            case "exercise 12":
                self.setMap([
                    ["green"],
                    ["red"],
                    ["green"],
                    ["white"],
                    ["green"],
                    ["blue"],
                    ["green"],
                    ["blue"],
                    ["green"],
                ]);
                break;
            case "exercise 13":
                self.setMap([
                    ["green"],
                    ["green"],
                    ["green"],
                    ["blue"],
                    ["white"],
                    ["green"],
                    ["red"],
                    ["red"],
                    ["blue"],
                    ["green"]
                ]);
                break;
            case "exercise 14":
                self.setMap([
                    [],
                    ["green"],
                    ["white"],
                    ["green", "white"],
                    ["red", "white"],
                    ["white", "white"],
                    ["blue"],
                    ["blue", "blue", "blue"],
                    ["blue", "green", "green"],
                    ["red"]
                ]);
                break;
            case "exercise 15":
                self.setMap([
                    [],
                    ["blue"],
                    [],
                    ["blue"],
                    ["white"],
                    [],
                    ["red"],
                    ["green"],
                    ["red"],
                    ["green"]
                ]);
                break;
            default:
                throw new Error("There is no level with the name: " + levelName);
        }
    };

    self.randomLevel = function (columns, rows) {
		columns = columns ? columns : self.columns;
		rows = rows ? rows : self.rows;

		var map = [];
		for (var c = 0; c < columns; c++) {
			map[c] = [];
			var rh = Math.floor(Math.random() * rows + 1);
			for (var r = 0; r < rh; r++) {
				map[c][r] = local.blocks.availableColors[Math.floor(Math.random() * local.blocks.availableColors.length)];
			}
		}
		self.setMap(map);
	};

    /**
     * Waits for a certain amount of time.
     */
    // self.wait = function () {
    //     local.mainMovementFunc(this);
    // };
    self.run = function () {
        // Render frames
        requestAnimationFrame(local.render);
    };
};
