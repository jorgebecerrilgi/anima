import {State} from './finiteStateMachine.js';
import {FSM} from './finiteStateMachine.js';

class SpriteAnimation extends State {
    onKeyDown = new Map();
    onKeyUp = new Map();

    constructor(name, row, begin, end, isLoop) {
        super();
        this.name = name;
        this.row = row
        this.begin = begin;
        this.end = end;
        this.isLoop = isLoop;
    }
    get length() {
        return this.end - this.begin + 1;
    }

    /* Overriding extended State class */
    setBehaviour = () => {
        document.addEventListener("keydown", (e) => {
            this.onKeyDown.forEach((val,key) => {
                if (e.code != key) return;
                FSM.transitionTo(val);
                console.log(`%ckeydown: ${val}`, "color: lime");
            });
        });
        document.addEventListener("keyup", (e) => {
            this.onKeyUp.forEach((val,key) => {
                if (e.code != key) return;
                FSM.transitionTo(val);
                console.log(`%ckeyup: ${key}`, "color: lime");
            });
        });
    };
    removeBehaviour = () => {
        document.removeEventListener("keydown");
        document.removeEventListener("keyup");
    };
}

const SPRITESHEET = {
    _width: 0,
    _height: 0,
    frames: {
        _width: 0,
        _height: 0,
        _x: 1,
        _y: 1,
        set width(value) {
            this._width = parseInt(value);
        },
        set height(value) {
            this._height = parseInt(value);
        },
        set x(value) {
            this._x = parseInt(value);
        },
        set y(value) {
            this._y = parseInt(value);
        },
        get width() {return this._width},
        get height() {return this._height},
        get x() {return this._x},
        get y() {return this._y}
    },
    set width(value) {
        this._width = parseInt(value);
    },
    set height(value) {
        this._height = parseInt(value);
    },
    get width() {return this._width},
    get height() {return this._height}
};

$(function() {
    const SPRITE_AREA_SIDE_LENGTH = $("#sprite-area").width();
    SPRITESHEET.width = $("#spritesheet").width();
    SPRITESHEET.height = $("#spritesheet").height();

    // Updates the spritesheet's configuration.
    $("#button-done").click(function (e) { 
        e.preventDefault();

        const width = $("#input-width").val();
        const height = $("#input-height").val();
        const isPixelart = $("#input-pixelart").prop("checked");

        if (width === "" || height === "") return;

        updateFrameSize(parseInt(width), parseInt(height));

        if (isPixelart){
            $("#spritesheet").addClass("pixelart");
        } else {
            $("#spritesheet").removeClass("pixelart");
        }
    });
    
    // Load user's spritesheet.
    $("#input-image").change(function (e) { 
        e.preventDefault();

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const uploadedImage = reader.result;

            // Updates spritesheet's image and the sprite's mask size.
            $.when($("#spritesheet").attr("src", uploadedImage)).then(function() {
                $("#spritesheet").css("width", "").css("height", "");
                SPRITESHEET.width = $("#spritesheet").width();
                SPRITESHEET.height = $("#spritesheet").height();
                updateFrameSize();
            });
        });

        if (this.files[0] === undefined) return;
        reader.readAsDataURL(this.files[0]);
    });

    function updateFrameSize(width = SPRITESHEET.width, height = SPRITESHEET.height) {
        // Updates the size of the displayed frame.

        const spritesheetWidth = SPRITESHEET.width;
        const spritesheetHeight = SPRITESHEET.height;

        if (width < 1 || height < 1 || width > spritesheetWidth || height > spritesheetHeight) return;

        const spritesheet = $("#spritesheet");
        const spriteMask = $("#sprite-mask");
        const longestSide = width > height ? width : height;
        const multiplier = SPRITE_AREA_SIDE_LENGTH / longestSide;
        
        $(spriteMask).css("width", "").css("height", "");
        $(spritesheet).css("width", "").css("height", "");

        if (width === height) {
            $(spritesheet).width(spritesheetWidth * multiplier);
        }
        else if (width > height) {
            $(spritesheet).width(spritesheetWidth * multiplier);
            $(spriteMask)
                .width(SPRITE_AREA_SIDE_LENGTH)
                .height(SPRITE_AREA_SIDE_LENGTH * height / width);
        }
        else {
            $(spritesheet).height(spritesheetHeight * multiplier);
            $(spriteMask)
                .height(SPRITE_AREA_SIDE_LENGTH)
                .width(SPRITE_AREA_SIDE_LENGTH * width / height);
        }

        SPRITESHEET.frames.width = width;
        SPRITESHEET.frames.height = height;
        SPRITESHEET.frames.x = Math.floor(spritesheetWidth / width);
        SPRITESHEET.frames.y = Math.floor(spritesheetHeight / height);
    }

    // Creates a new animation state.
    $("#button-create").click(function (e) {
        e.preventDefault();

        const name = $("#input-name").val();
        const row = $("#input-row").val();
        const begin = $("#input-begin").val();
        const end = $("#input-end").val();
        const id = $("#input-id").val();
        const isLoop = $("#input-loop").prop("checked");

        if (name === "" || row === "" || begin === "" || end === "") {
            alert("All fields are mandatory.");
            return;
        }

        const anim = new SpriteAnimation(name, row, begin, end, isLoop);

        // Updates animation state if already in FSM.
        if (id !== "") {
            FSM.updateState(anim, id);
            // Updates animation list name.
            $(".animation-item").each(function () {
                if ($(this).data("id") == id)
                    $(this).text(name);
            });
            return;
        }

        // Adds animation state if new.
        FSM.addState(anim);
        fillAnimationInfo(null);

        // Adds animation to displayed list.
        const element = $(`<a href=\"#\" class=\"list-group-item list-group-item-action animation-item\" data-id=\"${anim.id}\">${name}</a>`);
        $("#animation-list").append(element);
        // Edit animation eventListener.
        element.click(function (e) {
            e.preventDefault();
            if (!FSM.hasState($(this).data("id"))) return;
            fillAnimationInfo(FSM.states.get($(this).data("id")));
        });
    });

    // Clears Animations' fields.
    $("#a-new-animation").click(function (e) {
        e.preventDefault();
        fillAnimationInfo(null);
    });

    // Overrides Animations' fields with an animation state's data.
    function fillAnimationInfo(animation) {
        if (animation === null) {
            $("#input-name").val("");
            $("#input-row").val("");
            $("#input-begin").val("");
            $("#input-end").val("");
            $("#input-id").val("");
            $("#input-loop").prop("checked", false);
            return;
        }
        
        $("#input-name").val(animation.name);
        $("#input-row").val(animation.row);
        $("#input-begin").val(animation.begin);
        $("#input-end").val(animation.end);
        $("#input-id").val(animation.id);
        $("#input-loop").prop("checked", animation.isLoop);
    }

    function play(animation) {
        // Plays an animation, using the current spritesheet.
        //
        // animation: an Animation object.

        $("#spritesheet").css("transform", `translateY(-${animation.row * (SPRITESHEET.frames.height / SPRITESHEET.height * 100)}%)`)
    }

    updateFrameSize();
});