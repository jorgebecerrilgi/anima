$(function() {
    const SPRITE_AREA_SIDE_LENGTH = $("#sprite-area").width();
    let spritesheetWidth = parseInt($("#spritesheet").width());
    let spritesheetHeight = parseInt($("#spritesheet").height());

    // Updates the spritesheets configuration.
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
                spritesheetWidth = parseInt($("#spritesheet").width());
                spritesheetHeight = parseInt($("#spritesheet").height());
                updateFrameSize(spritesheetWidth, spritesheetHeight);
            });
        });

        if (this.files[0] === undefined) return;
        reader.readAsDataURL(this.files[0]);
    });

    function updateFrameSize(width, height) {
        // Updates the size of the displayed frame.
        // 
        // width: new frame width (INT).
        // height: new frame height (INT).

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
    }

    updateFrameSize(spritesheetWidth, spritesheetHeight);
});