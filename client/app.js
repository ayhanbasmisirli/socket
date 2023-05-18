const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const socket = io("wss://ws.postman-echo.com/raw");

// Clear ruler function
function clearRuler() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw ruler function
function drawRuler() {
    const majorMarkSpacing = 100;
    const minorMarkSpacing = 20;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    // Draw horizontal ruler
    for (let x = 0; x <= canvas.width; x += minorMarkSpacing) {
        let markLength;

        if (x % majorMarkSpacing === 0) {
            markLength = 20;
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(x, x + 2, 10);
        } else {
            markLength = 10;
        }

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, markLength);
        ctx.stroke();
    }

    // Draw vertical ruler
    for (let y = 0; y <= canvas.height; y += minorMarkSpacing) {
        let markLength;

        if (y % majorMarkSpacing === 0) {
            markLength = 20;
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(y, 2, y + 10);
        } else {
            markLength = 10;
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(markLength, y);
        ctx.stroke();
    }
}

drawRuler();

const remoteCursors = {};

socket.on('cursorEvent', ({ userID, eventName, point }) => {
    // Clear the previous cursor position
    if (remoteCursors[userID]) {
        const previousPoint = remoteCursors[userID].point;
        ctx.clearRect(previousPoint.x - 10, previousPoint.y - 10, 40, 40);
    }

    // Update the remoteCursors object with the new cursor position
    remoteCursors[userID] = { eventName, point };
    clearRuler();
    drawRuler();

    // Render the new cursor position
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fill();

    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillText(`User ${userID}`, point.x + 15, point.y + 5);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const point = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
    };

    // Emit the cursor event data to the websocket server
    socket.emit('cursorEvent', { eventName: 'mousemove', point });
});
