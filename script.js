// Input handling
const Input = {
    mouse: {
        x: 0,
        y: 0,
        left: false,
        middle: false,
        right: false
    }
};

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Physics constants
const SEGMENT_LENGTH = 15;
const SEGMENT_COUNT = 30;
const SPRING_STIFFNESS = 0.3;
const SPRING_DAMPING = 0.5;
const GRAVITY = 0.1;
const FRICTION = 0.97;
const MOUSE_INFLUENCE = 0.2;
const MOUSE_REPEL = 100;

// Reptile segments
class Segment {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.vx = 0;
        this.vy = 0;
        this.index = index;
        this.width = 4 + (SEGMENT_COUNT - index) * 0.15;
        this.legLength = 8 + (SEGMENT_COUNT - index) * 0.2;
        this.legAngle = 0;
        this.legSpeed = 0.2 + Math.random() * 0.1;
    }

    update() {
        // Store old position
        this.oldX = this.x;
        this.oldY = this.y;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // Update leg animation
        this.legAngle += this.legSpeed;
    }

    constrain(segment) {
        // Calculate distance between segments
        const dx = this.x - segment.x;
        const dy = this.y - segment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const difference = SEGMENT_LENGTH - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent;
        const offsetY = dy * percent;

        // Apply constraint
        this.x += offsetX;
        this.y += offsetY;
        segment.x -= offsetX;
        segment.y -= offsetY;
    }

    draw(nextSegment) {
        // Draw segment body
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y);
        if (nextSegment) {
            ctx.lineTo(nextSegment.x, nextSegment.y);
        } else {
            // Draw head if this is the first segment
            const angle = Math.atan2(this.y - this.oldY, this.x - this.oldX);
            ctx.lineTo(this.x + Math.cos(angle) * 10, this.y + Math.sin(angle) * 10);
        }
        ctx.stroke();

        // Draw legs
        if (this.index % 2 === 0) {
            this.drawLegs();
        }

        // Draw spine
        if (nextSegment) {
            const midX = (this.x + nextSegment.x) / 2;
            const midY = (this.y + nextSegment.y) / 2;
            const angle = Math.atan2(nextSegment.y - this.y, nextSegment.x - this.x);
            const perpAngle = angle + Math.PI / 2;
            
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.moveTo(midX + Math.cos(perpAngle) * 4, midY + Math.sin(perpAngle) * 4);
            ctx.lineTo(midX - Math.cos(perpAngle) * 4, midY - Math.sin(perpAngle) * 4);
            ctx.stroke();
        }
    }

    drawLegs() {
        const angle = Math.atan2(this.y - this.oldY, this.x - this.oldX);
        const perpAngle1 = angle + Math.PI / 2;
        const perpAngle2 = angle - Math.PI / 2;
        
        // Left leg
        const leftLegAngle = perpAngle1 + Math.sin(this.legAngle) * 0.5;
        const leftLegX = this.x + Math.cos(leftLegAngle) * this.legLength;
        const leftLegY = this.y + Math.sin(leftLegAngle) * this.legLength;
        
        // Right leg
        const rightLegAngle = perpAngle2 + Math.sin(this.legAngle + Math.PI) * 0.5;
        const rightLegX = this.x + Math.cos(rightLegAngle) * this.legLength;
        const rightLegY = this.y + Math.sin(rightLegAngle) * this.legLength;
        
        // Draw legs
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        
        // Left leg
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(leftLegX, leftLegY);
        
        // Right leg
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(rightLegX, rightLegY);
        
        ctx.stroke();
        
        // Draw small arrows at the end of legs
        this.drawLegEnd(leftLegX, leftLegY, leftLegAngle);
        this.drawLegEnd(rightLegX, rightLegY, rightLegAngle);
    }
    
    drawLegEnd(x, y, angle) {
        const arrowSize = 3;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - Math.cos(angle - Math.PI/4) * arrowSize,
            y - Math.sin(angle - Math.PI/4) * arrowSize
        );
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - Math.cos(angle + Math.PI/4) * arrowSize,
            y - Math.sin(angle + Math.PI/4) * arrowSize
        );
        ctx.stroke();
    }
}

// Create reptile segments
const segments = [];
for (let i = 0; i < SEGMENT_COUNT; i++) {
    segments.push(new Segment(canvas.width / 2, canvas.height / 2, i));
}

// Mouse event listeners
document.addEventListener("mousedown", function(event) {
    if (event.button === 0) {
        Input.mouse.left = true;
    }
    if (event.button === 1) {
        Input.mouse.middle = true;
    }
    if (event.button === 2) {
        Input.mouse.right = true;
    }
});

document.addEventListener("mouseup", function(event) {
    if (event.button === 0) {
        Input.mouse.left = false;
    }
    if (event.button === 1) {
        Input.mouse.middle = false;
    }
    if (event.button === 2) {
        Input.mouse.right = false;
    }
});

document.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    Input.mouse.x = event.clientX - rect.left;
    Input.mouse.y = event.clientY - rect.top;
});

// Prevent context menu on right click
canvas.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});

// Animation loop
function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update head segment based on mouse position
    const head = segments[0];
    const dx = Input.mouse.x - head.x;
    const dy = Input.mouse.y - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Apply force towards mouse
    if (distance > 1) {
        const influence = Math.min(distance * MOUSE_INFLUENCE, 10);
        head.vx += (dx / distance) * influence;
        head.vy += (dy / distance) * influence;
    }
    
    // Apply repulsion if mouse button is pressed
    if (Input.mouse.left && distance < MOUSE_REPEL) {
        const repelForce = (MOUSE_REPEL - distance) * 0.05;
        head.vx -= (dx / distance) * repelForce;
        head.vy -= (dy / distance) * repelForce;
    }

    // Update all segments
    segments.forEach(segment => segment.update());

    // Apply constraints multiple times for stability
    const iterations = 5;
    for (let j = 0; j < iterations; j++) {
        for (let i = 0; i < segments.length - 1; i++) {
            segments[i].constrain(segments[i + 1]);
        }
    }

    // Draw segments from tail to head for proper layering
    for (let i = segments.length - 1; i >= 0; i--) {
        const nextSegment = i > 0 ? segments[i - 1] : null;
        segments[i].draw(nextSegment);
    }

    // Continue animation loop
    requestAnimationFrame(animate);
}

// Start animation
animate();