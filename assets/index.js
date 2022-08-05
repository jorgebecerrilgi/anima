$(function() {
    // Updates the spritesheets configuration.
    $("#button-done").click(function (e) { 
        e.preventDefault();

        const width = $("#input-width").val();
        const height = $("#input-height").val();
        const isPixelart = $("#input-pixelart").prop("checked");
        if (width < 1 || height < 1) return;

        const maxSize = $("#sprite-area").width();
        if (width == height) {
            const widthMultiplier = maxSize / width;

            $("#spritesheet").width($("#spritesheet").width() * widthMultiplier);
            $("#sprite-mask").width(width * widthMultiplier);
        }

        $("#spritesheet").width() / width; // horizontal-frames
        $("#spritesheet").height() / height; // vertical-frames

        // $("#sprite-mask").width($("#input-width").val());
        // $("#sprite-mask").height($("#input-height").val());

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
                // updateMaskSize($("#spritesheet").width(), $("#spritesheet").height())
            });
        });

        if (this.files[0] === undefined) return;
        reader.readAsDataURL(this.files[0]);
    });

    function updateMaskSize(width, height) {
        // Updates the sprite's mask size.
        
        const maxSize = $("#sprite-area").width();
        const spriteMask = $("#sprite-mask");

        if (width === height) {
            $(spriteMask).width(width).height(height);
            return;
        }

        const biggestSide = width > height ? width : height;
        const smallestSide = width < height ? width : height;
        const smallSize = smallestSide * maxSize / biggestSide;

        if (width > height) {
            $(spriteMask).width(maxSize);
            $(spriteMask).height(smallSize);
        } else {
            $(spriteMask).height(maxSize);
            $(spriteMask).width(smallSize);
        }
    }
});