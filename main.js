document.addEventListener('DOMContentLoaded', onReady);

const height = 384;

async function onReady() {
    const canvasElement = document.getElementById('maks-canvas');

    const context = canvasElement.getContext('2d');

    const maks = await loadMaks();

    drawMaks(context, canvasElement, maks);

    startTalking(context, canvasElement, maks);

    document.getElementById('speak').onclick = () => {
        startTalking(context, canvasElement, maks);
    };
}

async function startTalking(context, canvasElement, maks) {
    let stop = null;

    const sayIt = () => stop = talk(context, canvasElement, maks, sayIt);

    await makeSomeNoise(document.getElementById('text').value || 'введи текст дурень', () => sayIt());

    stop();
    drawMaks(context, canvasElement, maks);
}

function makeSomeNoise(text, callback) {
    return new Promise((resolve) => {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ru-RU';
        msg.rate = 1.5;
        msg.onstart = callback;
        msg.onend = () => resolve();

        window.speechSynthesis.speak(msg);
    })
}

function talk(context, canvasElement, maks, callback) {
    const minY = getRandomInt(0, 3);
    const maxY = getRandomInt(5, 12);

    const speed = 25;
    let offset = 1;
    let goBack = false;

    let isStopped = false;

    const stop = () => isStopped = true;

    const move = () => {
        if (isStopped) { return }

        if (!goBack && offset < maxY) {
            drawMaks(context, canvasElement, maks, offset);
            offset++;
            setTimeout(move, speed);
        }

        if (!goBack && offset === maxY) {
            goBack = true;
        }

        if (goBack && offset > minY) {
            drawMaks(context, canvasElement, maks, offset);
            offset--;
            setTimeout(move, speed);
        }

        if (goBack && offset === minY) {
            callback && callback();
            callback = null;
        }
    };

    setTimeout(move, speed);

    return stop;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function loadMaks() {
    const headImage = await loadImage('src/images/head.png');
    const neckImage = await loadImage('src/images/neck.png');

    return {
        headImage,
        neckImage
    };
}

function drawMaks(context, canvasElement, maks, offsetY = 0) {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context.drawImage(maks.headImage, 0, 0, canvasElement.width, height);
    context.drawImage(maks.neckImage, 0, offsetY, canvasElement.width, height);
}

function loadImage(pathToImage) {
    return new Promise((resolve) => {
        const resultImage = new Image();

        resultImage.addEventListener('load', function () {
            resolve(resultImage);
        }, false);

        resultImage.src = pathToImage;
    });
}
