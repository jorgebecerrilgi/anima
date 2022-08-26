import {State} from './finiteStateMachine.js';
import {FSM} from './finiteStateMachine.js';

class Transition {
    Types = {
        "press": 0,
        "release": 1,
        "timed": 2
    };

    constructor(from, to, type, key) {
        this.from = from;
        this.to = to;
        this.type = type;
        this.key = key;
    }
}

class SpriteAnimation extends State {
    onKeyDown = new Map();
    onKeyUp = new Map();
    transitions = [];
    hasTransition = (id) => {
        id = Number(id);
        return this.transitions.length > id && this.transitions[id] != null;
    };
    getTransition = (id) => {
        id = Number(id);
        return this.hasTransition(id) ? this.transitions[id] : null;
    };
    addTransition = (transition) => {
        this.transitions.push(transition);
    };
    replaceTransition = (id, transition) => {
        id = Number(id);
        if (!this.hasTransition(id)) return;
        this.transitions[id] = transition;
    };

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
    get transitionsAmount() {
        return this.transitions.length;
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
            $(`.animation-item[data-id='${id}']`).text(name);
            return;
        }

        // Adds animation state if new.
        FSM.addState(anim);
        fillAnimationInfo(null);

        // Adds animation to displayed list.
        const elementAnimation = $(`<a href=\"#\" class=\"list-group-item list-group-item-action animation-item\" data-id=\"${anim.id}\">${name}</a>`);
        const elementFSM = $(`<a href=\"#\" class=\"list-group-item list-group-item-action animation-item\" data-id=\"${anim.id}\">${name}</a>`);
        $("#animation-list").append(elementAnimation);
        $("#fsm-list").append(elementFSM);
        // Adds a transition list divider, for the new animation-state.
        console.log(anim.id);
        if (!$("#transition-lists-wrapper").has(`.transition-list[data-id='${anim.id}']`).length) { // DELETE THIS IF STATEMENT IN RELEASE.
            const elementTransitionList = $(`<div data-id='${anim.id}'></div>`).addClass("transition-list d-none");
            console.log(elementTransitionList.data("id"));
            $("#transition-lists-wrapper").prepend(elementTransitionList);
        }
        
        // Edit animation eventListener.
        elementAnimation.click(function (e) {
            e.preventDefault();
            if (!FSM.hasState($(this).data("id"))) return;
            fillAnimationInfo(FSM.states.get($(this).data("id")));
        });
        // Edit state eventListener.
        elementFSM.click(function (e) {
            e.preventDefault();
            let elementID = $(this).data("id");
            if (!FSM.hasState(elementID)) return;
            // Only shows selected-state transitions.
            $(".transition-list.vis").removeClass("vis").addClass("d-none");
            $(`.transition-list[data-id='${elementID}']`).removeClass("d-none").addClass("vis");
            // Shows selected-state id.
            $("#input-fsm-id").val(elementID);
        });
    });

    // Creates a new transition for an animation state.
    $("#button-add-transition").click(function (e) {
        const id = $("#input-fsm-id").val();
        if (id === "") return;
        if (!FSM.hasState(id)) return;
        if ($(`.transition-list[data-id='${id}']`).has("div.card.edit").length) return;

        // Creates and adds transition card.
        const transitionID = FSM.getState(id).transitionsAmount;
        const transitionCard = $(`<div class="card mb-3 edit" data-sub-id='${transitionID}'><div class="card-body"><h5 class="card-title">Run</h5><div class="row my-3"><div class="col-3"><div class="input-group"><div class="input-group-preppend"><span class="input-group-text">Key</span></div><input class="form-control input-key" type="text" maxlength="0" placeholder="Press here" spellcheck="false"></div></div><div class="col-3"><div class="input-group"><div class="input-group-preppend"><span class="input-group-text">ID of Next</span></div><input class="form-control input-to" type="number" min="0" placeholder="0"></div></div><div class="col-2"></div><div class="col-2"><div class="form-check"><input class="form-check-input input-type" data-type='0' type="radio" name="transition-type-${id}-${transitionID}" checked="checked"><label class="form-check-label" for="transition-type-1">On Press</label></div></div><div class="col-2"><div class="form-check"><input class="form-check-input input-type" data-type='1' type="radio" name="transition-type-${id}-${transitionID}"><label class="form-check-label" for="transition-type-2">On Release</label></div></div></div><button type="button" class="btn btn-link button-edit d-none">Edit</button><button type="button" class="btn btn-success button-save">Save</button><button type="button" class="btn btn-outline-danger button-cancel mx-1">Cancel</button></div></div>`);
        $(`.transition-list[data-id='${id}']`).append(transitionCard);

        $(".input-key", transitionCard).on("keydown", function(e) {
            e.preventDefault();
            $(this).val(e.code);
        });
        
        // Edit button functionality.
        // Enters edit mode. Enables inputs.
        $(".button-edit", transitionCard).on("click", function() {
            if ($(`.transition-list[data-id='${id}']`).has("div.card.edit").length) return;

            $(".button-save", transitionCard).removeClass("d-none");
            $(".button-cancel", transitionCard).removeClass("d-none");
            $(".button-edit", transitionCard).addClass("d-none");
            $("input", transitionCard).prop("disabled", false);
            $(transitionCard).addClass("edit");
        });
        
        // Cancel button functionality.
        // Removes card or undoes all changes.
        $(".button-cancel", transitionCard).on("click", function() {
            if (FSM.getState(id).hasTransition(transitionID)) {
                const trans = FSM.getState(id).getTransition(transitionID);
                console.log(trans);
                // Resets all input values.
                $(".input-key", transitionCard).val(trans.key);
                $(".input-to", transitionCard).val(trans.to);
                $(`.input-type[data-type='${trans.type}']`, transitionCard).prop("checked", true);
                // Exits edit mode. Disables inputs.
                $(".button-save", transitionCard).addClass("d-none");
                $(".button-cancel", transitionCard).addClass("d-none");
                $(".button-edit", transitionCard).removeClass("d-none");
                $("input", transitionCard).prop("disabled", true);
                $(transitionCard).removeClass("edit");
            }
            else {
                $(transitionCard).remove();
            }
        });

        // Save button functionality.
        // Creates a transition object and adds it to the animation-state object.
        $(".button-save", transitionCard).on("click", function() {
            const key = $(".input-key", transitionCard).val();
            const to = $(".input-to", transitionCard).val();
            const type = $(".input-type:checked", transitionCard).data("type");
            const trans = new Transition(id, to, type, key);
            // Updates or adds transition.
            if (FSM.getState(id).hasTransition(transitionID)) {
                FSM.getState(id).replaceTransition(transitionID, trans);
            }
            else {
                FSM.getState(id).addTransition(trans);
            }
            // Exits edit mode. Disables inputs.
            $(".button-save", transitionCard).addClass("d-none");
            $(".button-cancel", transitionCard).addClass("d-none");
            $(".button-edit", transitionCard).removeClass("d-none");
            $("input", transitionCard).prop("disabled", true);
            $(transitionCard).removeClass("edit");
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