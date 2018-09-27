//创建显示舞台
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;
canvas.style.backgroundColor = "#333";
canvas.style.backgroundImage = "url(img/bg.png)";
document.body.appendChild(canvas);

//创建一个物理世界
var world = new p2.World({
    gravity:[0, -9.82]
});

//创建地面
var groundShape = new p2.Plane();
var groundBody = new p2.Body({
    mass:0
});
groundBody.addShape(groundShape);

//创建左边的墙
var leftWallShape = new p2.Plane();
var leftWallBody = new p2.Body({
    position: [0, 0],
    angle: -Math.PI/2
});
leftWallBody.addShape(leftWallShape);

//创建右边的墙
var rightWallShape = new p2.Plane();
var rightWallBody = new p2.Body({
    position: [canvas.width/50, 0],
    angle: Math.PI/2
});
rightWallBody.addShape(rightWallShape);

//创建天花板
var topWallShape = new p2.Plane();
var topWallBody = new p2.Body({
    position: [0, canvas.height/50],
    angle: Math.PI
});
topWallBody.addShape(topWallShape);

//添加创建好的物体到物理世界
world.addBody(groundBody);
world.addBody(leftWallBody);
world.addBody(rightWallBody);
world.addBody(topWallBody);





//定义乒乓桌
var tableShape, tableBody;

//定义兵乓球
var ballShape, ballBody;

//定义左边球拍
var leftShape, leftBody;

//定义右边球拍
var rightShape, rightBody;

//加载乒乓桌图片
var tableReady = false;
var tableImage = new Image();
tableImage.onload = function () {
    tableReady = true;  
    //设置形状和刚体
    tableShape = new p2.Box({
        width: tableImage.width/50, //图片宽度
        height: tableImage.height/50    //图片高度 
    });
    tableBody = new p2.Body({
        mass: 10,               //重力
        position: [canvas.width/100, (tableImage.height+100)/50]        //物理世界的位置
    });
    tableBody.addShape(tableShape);
    world.addBody(tableBody);
};
tableImage.src = "img/table.png";


//加载乒乓球
var ballReady = false;
var ballImage = new Image();
ballImage.onload = function () {
    ballReady = true;   
    //设置形状和刚体
    ballShape = new p2.Circle({
        radius: ballImage.width/100
    });
    ballBody = new p2.Body({
        mass: 1,                //重力
        position: [canvas.width/100, (canvas.height - ballImage.height)/50] //物理世界的位置
    });
    ballBody.addShape(ballShape);
};
ballImage.src = "img/ball.png";


//加载左边球拍
var leftReady = false;
var leftImage = new Image();
leftImage.onload = function () {
    leftReady = true;   
    //设置形状和刚体
    leftShape = new p2.Box({
        width: leftImage.width/50,  //图片宽度
        height: leftImage.height/50 //图片高度 
    });
    leftBody = new p2.Body({
        mass: 5,    //重力
        position: [100/50, canvas.height/100],  //物理世界的位置
        gravityScale: 0,
        fixedRotation: true,
        collisionResponse: true,
        angle: -(45 * Math.PI / 180)
    });
    leftBody.addShape(leftShape);
};
leftImage.src = "img/bat.png";


//加载右边球拍
var rightReady = false;
var rightImage = new Image();
rightImage.onload = function () {
    rightReady = true;  
    //设置形状和刚体
    rightShape = new p2.Box({
        width: rightImage.width/50, //图片宽度
        height: rightImage.height/50    //图片高度 
    });
    rightBody = new p2.Body({
        mass: 5,                //重力
        position: [(canvas.width-100)/50, canvas.height/100],   //物理世界的位置
        gravityScale: 0,
        fixedRotation: true,
        collisionResponse: true,
        angle: 45 * Math.PI / 180
    });
    rightBody.addShape(rightShape);
};
rightImage.src = "img/bat.png";

/* 获取转化成舞台坐标的方块物体的坐标（方块物体中点坐标）、宽度、高度和角度 */
function getBoxCenterPos(shape, body){
    var w = shape.width*50;
    var h = shape.height*50;

    var x = body.interpolatedPosition[0];
    var y = body.interpolatedPosition[1];

    x = x*50;
    y = canvas.height - y*50;

    var angle = -body.interpolatedAngle;

    return {
        w : w,
        h : h,
        x : x, 
        y : y,
        angle : angle
    };
}

/* 获取转化成舞台坐标的圆形物体的坐标（圆形物体中点坐标）、半径和角度 */
function getCirclePos(shape, body){
    var r = shape.radius;

    var x = body.interpolatedPosition[0];
    var y = body.interpolatedPosition[1];

    var angle = body.interpolatedAngle * Math.PI / 180;

    r = r * 50;
    x = x * 50;
    y = canvas.height - y * 50;

    return {
        x : x, 
        y : y,
        r : r,
        angle : angle
    };
}






//检测物理碰撞
world.on("beginContact", function(event){

    //如果乒乓桌碰到了地面
    if((event.bodyA == groundBody && event.bodyB == tableBody) ||
       (event.bodyB == groundBody && event.bodyA == tableBody)){

        if(is_game_begin === false && ballReady === true && leftReady === true && rightReady === true){
            gameBegin();    //游戏开始
        }
    }

    //如果乒乓球碰撞了
    if(event.bodyA == ballBody || event.bodyB == ballBody){
        is_ball_hit = true;
    }

    //如果球碰到了地面
    if((event.bodyA == groundBody && event.bodyB == ballBody)){
        countScore();   //计算分数
    }
});


//激活物理世界
requestAnimationFrame(activate);

//定义物理活动
var lastTime;
var maxSubSteps = 5;
var fixedDeltaTime = 1 / 60;
function activate(time){
    requestAnimationFrame(activate);

    // Get the elapsed time since last frame, in seconds
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;

    // Make sure the time delta is not too big (can happen if user switches browser tab)
    deltaTime = Math.min(1 / 10, deltaTime);

    // Move physics bodies forward in time 推进物理世界
    world.step(fixedDeltaTime, deltaTime, maxSubSteps);

    // Render scene 渲染游戏画面
    render();
}


/* 检测是否准备就绪 */
function checkReady(){
    if(tableReady && ballReady && leftReady && rightReady){
        return true;
    }
    return false;
}


/* 渲染画面 */
function render(){
    if(checkReady() === true){

        ctx.clearRect(0, 0, canvas.width, canvas.height);   //清除上一帧的画面

        drawTable();    //绘制乒乓桌

        if(is_game_begin === true){
            drawBall();     //绘制乒乓球
            drawLeftBat();  //绘制左边乒乓球拍
            drawRightBat(); //绘制右边乒乓球拍
            drawScore();    //绘制分数

            //键盘事件的处理
            checkAndExeKeyDown();   
        }
    }
}


// 键盘交互
var checkAndExeKeyDown = function () {

    //右玩家
    if (38 in keysDown) { // Player holding up
        rightBody.velocity[1] = 5;
    }
    if (40 in keysDown) { // Player holding down
        rightBody.velocity[1] = -5;
    }
    if (37 in keysDown) { // Player holding left
        rightBody.velocity[0] = -5;
    }
    if (39 in keysDown) { // Player holding right
        rightBody.velocity[0] = 5;
    }

    //左玩家
    if (87 in keysDown) { // Player holding up
        leftBody.velocity[1] = 5;
    }
    if (83 in keysDown) { // Player holding down
        leftBody.velocity[1] = -5;
    }
    if (65 in keysDown) { // Player holding left
        leftBody.velocity[0] = -5;
    }
    if (68 in keysDown) { // Player holding right
        leftBody.velocity[0] = 5;
    }
};


/* 绘制乒乓桌 */
function drawTable(){
    var pos = getBoxCenterPos(tableShape, tableBody);   //获取参数

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    ctx.drawImage(tableImage, -pos.w/2, -pos.h/2);  
    ctx.restore();
}

/* 绘制乒乓球 */
function drawBall(){
    if(is_game_begin === true){
        var pos = getCirclePos(ballShape, ballBody);    //获取参数

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);
        ctx.drawImage(ballImage, -pos.r, -pos.r);   
        ctx.restore();
    }

    //检测到符合条件就重置球
    resetBall();    
}






//限制球拍移动速度的次数
var limit_left_bat_count = 0;
var limit_right_bat_count = 0;

/* 绘制左边乒乓拍 */
function drawLeftBat(){
    var pos = getBoxCenterPos(leftShape, leftBody);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    ctx.drawImage(leftImage, -pos.w/2, -pos.h/2);   
    ctx.restore();

    //设置大约10/60键盘反馈时间
    limit_left_bat_count += 1;
    if(limit_left_bat_count >= 10){
        limit_left_bat_count = 0;
        leftBody.velocity[0] = 0;
        leftBody.velocity[1] = 0;
    }
}

/* 绘制右边乒乓拍 */
function drawRightBat(){
    var pos = getBoxCenterPos(rightShape, rightBody);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    ctx.drawImage(rightImage, -pos.w/2, -pos.h/2);  
    ctx.restore();

    //设置大约10/60键盘反馈时间
    limit_right_bat_count += 1;
    if(limit_right_bat_count >= 10){
        limit_right_bat_count = 0;
        rightBody.velocity[0] = 0;
        rightBody.velocity[1] = 0;
    }
}


//是否开球了？
var is_game_begin = false;

// 键盘控制的参数
var keysDown = {};


/* 游戏开始 */
function gameBegin(){

    tableBody.mass = 1000;  //变得很重
    tableBody.updateMassProperties();   //更新重量

    //开球了
    is_game_begin = true;

    //添加球到物理世界
    world.addBody(ballBody);
    //添加球拍到物理世界
    world.addBody(leftBody);
    world.addBody(rightBody);


    //创建桌子和球的材质
    var tableMaterial = new p2.Material();
    var ballMaterial = new p2.Material();

    tableShape.material = tableMaterial;
    ballShape.material = ballMaterial;

    //设置桌子和球之间的材质约束
    var ballTableContactMaterial = new p2.ContactMaterial(ballMaterial, tableMaterial, {
        friction : 0.03,            //摩擦力
        restitution : 1     //弹性
    });
    world.addContactMaterial(ballTableContactMaterial);

    //创建球拍的材质
    var batMaterial = new p2.Material();
    leftShape.material = batMaterial;
    rightShape.material = batMaterial;

    //设置球拍和球之间的材质约束
    var ballBatContactMaterial = new p2.ContactMaterial(ballMaterial, batMaterial, {
        friction : 0.3,         //摩擦力
        restitution : 1     //弹性
    });
    world.addContactMaterial(ballBatContactMaterial);

    //创建墙面的材质
    var wallMaterial = new p2.Material();
    // groundShape.material = wallMaterial;
    leftWallShape.material = wallMaterial;
    rightWallShape.material = wallMaterial;
    topWallShape.material = wallMaterial;

    //设置球与墙面的材质约束
    var ballWallContactMaterial = new p2.ContactMaterial(ballMaterial, wallMaterial, {
        friction : 0.4,         //摩擦力
        restitution : 0.8       //弹性
    });
    world.addContactMaterial(ballWallContactMaterial);


    //键盘控制球拍
    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);
}






//加载音频
var attackSound = document.createElement("AUDIO");
attackSound.src = "video/attack.wav";
attackSound.loop = false;
attackSound.autoplay = false;
attackSound.load();

//加载音频
var scoreSound = document.createElement("AUDIO");
scoreSound.src = "video/score.mp3";
scoreSound.loop = false;
scoreSound.autoplay = false;
scoreSound.load();


//乒乓球是否碰撞了
var is_ball_hit = false;

//每次发生碰撞结束后，检测碰撞，符合条件则播放击打音效
world.on("endContact", function(event){
    if(is_ball_hit === true){
        attackSound.play(); //播放音效

        is_ball_hit = false;
    }
});


//最后得分的球拍，true为右，否则为左
var is_right_last_win = true;

//球拍得分
var leftBodyScore = 0;
var rightBodyScore = 0;

//本次输赢是否已计分
var is_count_score = false;


/* 计分系统 */
function countScore(){

    //如果未计分
    if(is_count_score === false){
        is_count_score = true;

        var pos = getCirclePos(ballShape, ballBody);

        if(pos.x < canvas.width/2){
            rightBodyScore += 1;
            is_right_last_win = true;
        }
        else{
            leftBodyScore += 1;
            is_right_last_win = false;
        }

        //播放得分音效
        scoreSound.play();
    }
}


/* 绘制分数 */
function drawScore(){
    var pos = getBoxCenterPos(tableShape, tableBody);
    var score = leftBodyScore+" - "+rightBodyScore;

    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#eee";
    ctx.textAlign="center";
    ctx.fillText(score, pos.x, pos.y+30);
}


//延时60帧
var delay_reset_time = 60;

/* 重置球的下落 */
function resetBall(){
    if(is_count_score === true){
        delay_reset_time -= 1;  //倒计时

        //如果倒计时完成
        if(delay_reset_time <= 0){

            //如果最后一次击球是右球拍
            if(is_right_last_win === true){
                ballBody.position[0] = (canvas.width/2 + tableImage.width/4)/50;
                ballBody.position[1] = (canvas.height - ballImage.height)/50;
            }
            else{   //如果最后一次击球是左球拍
                ballBody.position[0] = (canvas.width/2 - tableImage.width/4)/50;
                ballBody.position[1] = (canvas.height - ballImage.height)/50;
            }


            //重置两个标志变量
            delay_reset_time = 60;
            is_count_score = false;
        }
    }
}
