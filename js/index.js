window.onload = () => {
    var container = document.getElementById("container");
    var video  = document.getElementById("camera");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    video.style.maxWidth = container.clientWidth + "px";
    video.style.maxHeight = container.clientHeight + "px";
    var canvas, camera_canvas = null;
    var context, camera_context = null;
    // const constraints = {
    //     audio: false,
    //     video: { facingMode: { exact: "environment" }
    //     }
    // };
    const constraints = {
        video: {
            facingMode: 'environment'
        },
        audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then( (stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = (e) => {
            video.play();
            // canvas
            canvas = document.getElementById("canvas");
            canvas.style.width = video.clientWidth + "px";
            canvas.style.height = video.clientHeight + "px";
            context = canvas.getContext("2d");
            camera_canvas = document.getElementById("camera_canvas");
            camera_canvas.style.width = video.clientWidth + "px";
            camera_canvas.style.height = video.clientHeight + "px";
            camera_context = camera_canvas.getContext("2d");
        };
    })
    .catch( (err) => {
        console.log(err.name + ": " + err.message);
    });
    cocoSsd.load().then(model => {
        setInterval(function(){detect(model, video, canvas, context)}, 250);
    });
    
    const detect = (model, video, canvas, context) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        camera_context.clearRect(0, 0, camera_canvas.width, camera_canvas.height);
        // video.pause();
        camera_context.drawImage(video, 0, 0, camera_canvas.width, camera_canvas.height);
        model.detect(camera_canvas).then(res => {
            // video.play();
            if(res.length == 0) return;
            for (var i = 0; i < res.length; i++) {
                var score = parseInt(res[i]["score"] * 100 ,10);
                drawRect(context, res[i].bbox[0], res[i].bbox[1], res[i].bbox[2], res[i].bbox[3], score)
                drawName(context, res[i]["class"], res[i].bbox[0], res[i].bbox[1], score);
            }
        });
    }
};
function drawRect(ctx, x, y, w, h, score) {
    ctx.beginPath();
    ctx.rect(parseInt(x, 10), parseInt(y, 10), parseInt(w, 10), parseInt(h, 10));
    ctx.lineWidth = 7.5;
    ctx.strokeStyle =  score < 75 ? "rgb(255, 255, 0)" : "rgb(50, 240, 60)";
    ctx.stroke();
    ctx.closePath();
}
function drawName(ctx, text, x, y, score) {
    ctx.beginPath();
    ctx.fillText(text + " : " + score + "%", parseInt(x, 10), parseInt(y, 10));
    ctx.fillStyle = "red";
    ctx.font = "10px serif";
    ctx.closePath();
}