// --- WEB AUDIO API SCI-FI SYNTHESIZER ---
class SciFiSynth {
    constructor() {
        this.ctx = null;
        this.isMuted = true; // start muted, will sync with UI and localStorage
    }

    initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (this.isMuted) return;
        this.initContext();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        // Pitch modulation envelope: fast sweep down from high to low
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

        // High-pass filter to make it a click/pop and remove muddy low end
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(400, now);

        // Gain envelope: fast decay
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playWhirr() {
        if (this.isMuted) return;
        this.initContext();

        const now = this.ctx.currentTime;
        const duration = 0.25;

        // Create white noise buffer
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        // Bandpass filter to create the pneumatic hiss/whirr whistle
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 12; // high resonance
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + duration);

        // Gain envelope: pneumatic burst
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + duration);

        // Add a subtle metallic pitch sweep in parallel for servo whirr
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + duration * 0.4);
        osc.frequency.linearRampToValueAtTime(150, now + duration);

        oscGain.gain.setValueAtTime(0.04, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    playSweep() {
        if (this.isMuted) return;
        this.initContext();

        const now = this.ctx.currentTime;
        const duration = 0.35;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        // Scan sweep pitch modulation: upwards and downwards cyber sweep
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.6);
        osc.frequency.exponentialRampToValueAtTime(400, now + duration);

        // Gain envelope: smooth fade in, peak, fade out
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }
}

const synth = new SciFiSynth();

// --- TYPEWRITER CONFIG ---
const roles = [
    "B.Tech in Mechatronics\nand Automation - VIT Chennai",
    "Research Enthusiast",
    "CAD Designer",
    "Automation Developer",
    "Mechatronics Engineer",
    "Industrial Diagnostics Developer"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    // Skip typewriter execution on mobile viewports since the hero section is hidden
    if (window.innerWidth <= 768) return;

    const typewriterBase = document.querySelector('.typewriter-base');
    const typewriterReveal = document.querySelector('.typewriter-reveal');
    
    if (!typewriterBase && !typewriterReveal) return;
    
    const currentRole = roles[roleIndex];
    let displayText = "";
    
    if (isDeleting) {
        displayText = "> " + currentRole.substring(0, charIndex - 1) + "_";
        charIndex--;
    } else {
        displayText = "> " + currentRole.substring(0, charIndex + 1) + "_";
        charIndex++;
    }

    if (typewriterBase) typewriterBase.innerText = displayText;
    if (typewriterReveal) typewriterReveal.innerText = displayText;

    let typeSpeed = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 1500; // Pause at full word
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 400; // Pause before new word
    }

    setTimeout(typeWriter, typeSpeed);
}

// --- SCROLL ANIMATIONS ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Progress bars activation
            if (entry.target.classList.contains('skills')) {
                const bars = entry.target.querySelectorAll('.skill-progress');
                bars.forEach(bar => bar.style.width = bar.getAttribute('data-width'));
            }
        }
    });
}, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

// Initialize Observer once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// --- STICKY NAV HIGHLIGHT ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// --- LOCAL STORAGE DATA (CMS) ---
const defaultProjects = [
    { id: '4', title: 'MIMEX Helrit_bot v2.5', desc: 'Developed a real-time leader-follower robotic system with WebSocket-based teleoperation, enabling synchronized motion control between leader and follower robotic arms. Implemented Forward/Inverse Kinematics, trajectory planning (MoveJ/MoveL), PID smoothing, and a Three.js-based digital twin.', image: 'memix/Screenshot 2026-05-29 091407.png', tags: ['Embedded Systems', 'Robotics', 'Web Development'], link: 'https://github.com/rittu07/MIMEX' },
    { id: '1', title: 'Autonomous Navigation in ROS 2', desc: 'Built a fully autonomous mobile robot navigation system in ROS 2 - integrating localization, path planning, and obstacle avoidance into a simulation environment where the robot navigates dynamic scenarios in real time, without any manual guidance.\n\n> ROS 2 Navigation Stack - Developed and configured a complete autonomous navigation pipeline in ROS 2, integrating localization, global and local path planning, and costmap-based obstacle avoidance\n> Obstacle Avoidance & Collision Safety - Implemented real-time collision avoidance algorithms enabling the robot to dynamically replan and safely navigate around static and moving obstacles\n> Simulation Validation - Validated all navigation workflows within ROS 2 simulation tools, confirming reliable path execution and robot movement across multiple dynamic test scenarios', image: 'autonomous navigation/1.jpg', tags: ['ROS 2', 'Path Planning', 'Localization', 'Obstacle Avoidance', 'Mobile Robotics', 'Simulation'], link: 'https://github.com/ritturonald' },
    { id: '2', title: 'Line Follower Robot - ROS 2 & OpenCV', desc: 'Developed a computer vision-based line follower using ROS 2 and OpenCV. The robot dynamically adjusts its path by processing camera feeds to detect the line contours.\n\n> Perception Pipeline - Developed an optimized HSV thresholding and contour detection node in OpenCV to isolate path tracks under dynamic lighting\n> Real-Time Control Loop - Mapped pixel centroid deviation errors to angular velocity commands to achieve smooth path following at 30 FPS\n> Gazebo Validation - Implemented and tuned the perception-to-actuation pipeline in Gazebo simulation, verifying physical steering stability', image: 'line follower/1741513830404.jpg', tags: ['ROS 2', 'OpenCV', 'Computer Vision', 'Line Following', 'Gazebo', 'Simulation', 'Mobile Robotics'], link: 'https://github.com/ritturonald' },
    { id: '3', title: 'Automated Bend Correction Model', desc: 'Developed analytical mathematical models at RANE Madras to determine precise mechanical force application for correcting steering rack bends caused during heat-treatment without compromising structural integrity.', image: 'rane.jpeg', tags: ['Mechanical Modeling', 'Force Analysis', 'Automotive'], link: '#' },
    { id: '5', title: 'Adaptive Hydraulic Suspension System', desc: 'A suspension system that doesn\'t just absorb bumps - it thinks about them. Designed and simulated an active electro-hydraulic suspension system that adapts in real time to changing terrain, keeping the vehicle stable and the ride comfortable.\n\n> Quarter-Car Modelling - Built a 2-DOF quarter-car mathematical model capturing sprung and unsprung mass dynamics under real road disturbances\n> Adaptive Fuzzy-PID Control - Developed an Adaptive Fuzzy Logic Controller (AFLC) that dynamically tunes PID gains in real time - outperforming traditional fixed-gain PID across all terrain types\n> MATLAB/Simulink Simulation - Validated system performance across bump, sinusoidal, and random road profiles - measuring body displacement, ride comfort, wheel hop, and actuator force demand', image: 'active suspension system/Screenshot 2026-06-13 123831.png', tags: ['MATLAB/Simulink', 'Control Systems', 'Fuzzy Logic', 'Hydraulic Systems', 'PID'], link: '#' },
    { id: '6', title: 'Vision-Based Dynamic Obstacle Avoidance for Industrial Robotic Arm', desc: 'Built a vision-driven obstacle avoidance system for an industrial robotic arm — where a laptop camera detects dynamic obstacles in real time, maps them into a potential field, and replans the arm\'s trajectory using A* to reach its goal safely without stopping.\n\n> Vision-Based Obstacle Detection — Used a laptop camera and OpenCV-based pipeline to detect dynamic obstacles in real time, estimating position and feeding spatial data into the path planning layer\n> Artificial Potential Field Navigation — Implemented APF-based trajectory planning where the goal attracts and obstacles repel the arm — enabling smooth, real-time path adaptation without stopping the robot\n> Local Minima Problem & A* Solution — Identified the fundamental APF failure mode — local minima trapping — where the arm stalls in balanced force fields, and resolved it by integrating A* algorithm to escape and replan a globally optimal collision-free path', image: 'obs/Screenshot 2026-06-13 125044.png', tags: ['Computer Vision', 'Artificial Potential Field', 'A* Algorithm', 'Obstacle Avoidance', 'OpenCV', 'Robotic Arm'], link: 'https://github.com/ritturonald' },
    { id: '7', title: 'PLC Automated Railway Crossing System', desc: 'Designed and simulated a fully automated railway crossing control system - where trains are detected, barriers actuate, and the entire operation is monitored live through an HMI. No human intervention required.\n\n> PLC Ladder Logic - Developed a complete Siemens PLC program using ladder logic to control the full crossing sequence - detection, barrier actuation, and fail-safe recovery\n> Sensor-Based Train Detection - Implemented proximity sensor logic to detect incoming trains and trigger autonomous barrier control with validated response timing\n> HMI Integration - Integrated a Human-Machine Interface for real-time monitoring of crossing status, sensor states, and system health', image: 'railway crossing/Screenshot 2026-05-25 113629.png', tags: ['Siemens PLC', 'Ladder Logic', 'HMI', 'Automation', 'Proximity Sensors'], link: '#' },
    { id: '8', title: 'Construction Waste Management Robotic Arm', desc: 'Designed and built a front-loader robotic arm system that autonomously picks up construction waste from the ground and disposes of it into a designated bin - with multiple fail-safe mechanisms ensuring safe, reliable operation without manual intervention.\n\n> Robotic Scooping Mechanism - Designed a front-loader scooping system capable of detecting, picking up, and disposing of construction waste into a target bin with precision actuation\n> Fail-Safe Implementation - Integrated multiple redundant fail-safe mechanisms and sensors to ensure safe operation across edge cases and fault conditions\n> Sensor Integration - Implemented sensor logic for waste detection, arm positioning, and bin alignment to enable fully autonomous operation', image: 'New folder/con.jpeg', tags: ['Robotics', 'Scooping Mechanism', 'Fail-Safe Design', 'Sensors', 'Industrial Automation'], link: '#' },
    { id: '9', title: 'Bio-Inspired Crashbox', desc: 'Analyzed and redesigned a vehicle crashbox structure inspired by biological energy-absorption principles - simulating impact mitigation performance in Ansys and modeling the new geometry in Fusion 360 to improve crash energy dissipation over conventional designs.\n\n> Bio-Inspired Structural Design - Researched and applied biological impact-absorption geometries to redesign the crashbox structure for improved energy dissipation under collision loading\n> Ansys Simulation & Analysis - Conducted structural impact analysis in Ansys to validate performance of the new design against baseline crashbox behavior under simulated crash conditions\n> Fusion 360 Modelling - Designed and iterated the new crashbox geometry in Fusion 360, translating bio-inspired principles into a manufacturable structural form', image: 'crash box/Screenshot 2026-05-25 113639.png', tags: ['Ansys', 'Fusion 360', 'Structural Analysis', 'Bionics', 'Impact Mitigation'], link: 'https://github.com/rakesh001n/bioinspired-crashbox' },
    { id: '10', title: 'Battle Bot - Technoxian 2024', desc: 'Designed, built, and competed with a combat robot at one of India\'s biggest international robotics competitions - Technoxian 2024 in Delhi - ranking in the top 15 globally on a minimal budget and executing rapid repairs under high-pressure conditions.\n\n> Combat Robot Design - Engineered a robust mechanical chassis and active weapon system capable of withstanding high impact forces\n> High-Pressure Systems Recovery - Recovered and recalibrated damaged weapon and mobility systems during tight turnaround windows in competition\n> Global Top 15 Ranking - Competed against international teams on a minimal budget, demonstrating high efficiency and resourcefulness', image: 'Internship/movis.png', tags: ['Robotics', 'Combat Robotics', 'Mechanical Design', 'Systems Engineering', 'Technoxian 2024'], link: 'https://github.com/ritturonald' }
];

const defaultBlog = [
    {
        id: '1',
        title: 'Building the MIMEX Helrit_bot v2.5 — A Deep Dive',
        date: '2026-05-29',
        content: 'A comprehensive deep dive into the open-source robotic ecosystem bringing real-time teleoperation, 3D simulation, and Vision-Language-Action dataset collection to hobbyists, students, and researchers — all for the cost of a microcontroller.\n\nThis guide covers every layer — the communication backbone, the hardware physics, the mathematical engines that translate angles to positions, the noise suppression strategies that prevent motor chatter, the recording and AI export pipeline, the built-in scripting language, and the multi-layer safety framework. We also include a full specification table, a competitive comparison, a development roadmap, and a complete glossary of terms.'
    },
    {
        id: '2',
        title: 'Autonomous Navigation: Path Planning & SLAM in ROS 2',
        date: '2025-10-15',
        content: 'How to configure a complete autonomous mobile robot navigation pipeline using ROS 2 Navigation Stack (Nav2). This post discusses integrating LiDAR scan overlays, IMU state estimation, and costmap-based dynamic obstacle avoidance in dynamic simulation scenarios.\n\nWe analyze the mathematics behind path planning, coordinate system transformations (TF), and sensor fusion filtering (Robot Localization) to ensure high-fidelity positioning under noisy measurement inputs.'
    }
];

function getProjects() {
    const data = localStorage.getItem('portfolio_projects');
    return data ? JSON.parse(data) : defaultProjects;
}

function getBlog() {
    const data = localStorage.getItem('portfolio_blog');
    return data ? JSON.parse(data) : defaultBlog;
}

function renderProjects(limit) {
    const grid = document.getElementById('projects-grid');
    const allGrid = document.getElementById('all-projects-grid');
    const targetGrid = grid || allGrid;
    if (!targetGrid) return;

    let projects = getProjects();
    // Clear dynamic modifications if local storage contains old images
    if (localStorage.getItem('portfolio_projects')) {
        localStorage.removeItem('portfolio_projects');
        projects = defaultProjects;
    }
    
    if (limit && targetGrid === grid) {
        projects = projects.slice(0, limit);
    }
    targetGrid.innerHTML = '';
    
    projects.forEach(p => {
        const tagsHtml = (p.tags || []).map(t => `<span class="tag">${t.trim()}</span>`).join('');
        let dest = "#";
        if (p.id === '1') dest = "project-ros2-robot.html";
        else if (p.id === '2') dest = "project-vision-follower.html";
        else if (p.id === '3') dest = "project-bend-correction.html";
        else if (p.id === '4') dest = "project-manipulator.html";
        else if (p.id === '5') dest = "project-suspension.html";
        else if (p.id === '6') dest = "project-obstacle-avoidance.html";
        else if (p.id === '7') dest = "project-railway-crossing.html";
        else if (p.id === '8') dest = "project-waste-arm.html";
        else if (p.id === '9') dest = "project-crashbox.html";
        else if (p.id === '10') dest = "project-battlebot.html";
        else if (p.pageLink) dest = p.pageLink;

        targetGrid.innerHTML += `
            <a href="${dest}" class="card-link" style="text-decoration: none; color: inherit; display: block;">
                <div class="card">
                    <span class="corner-tick top-left"></span>
                    <span class="corner-tick top-right"></span>
                    <span class="corner-tick bottom-left"></span>
                    <span class="corner-tick bottom-right"></span>
                    <div class="card-tech-id">[ MODULE // 0x0${p.id} ]</div>
                    <img src="${p.image || 'https://via.placeholder.com/400x200/111/333'}" alt="${p.title}">
                    <h3>${p.title}</h3>
                    <div class="tags">${tagsHtml}</div>
                    <p>${p.desc.substring(0, 100)}...</p>
                    <div class="project-know-more" style="color: var(--accent-cyan); font-weight: bold; font-size: 0.82rem; margin-top: auto; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-head); transition: color 0.3s ease;">
                        Know More <i class="fa-solid fa-arrow-right-long" style="transition: transform 0.3s ease;"></i>
                    </div>
                </div>
            </a>
        `;
    });
}

function renderBlog(limit) {
    const grid = document.getElementById('blog-grid');
    const allGrid = document.getElementById('all-blog-grid');
    const targetGrid = grid || allGrid;
    if (!targetGrid) return;

    let blog = getBlog();
    if (limit && targetGrid === grid) {
        blog = blog.slice(0, limit);
    }
    targetGrid.innerHTML = '';
    
    blog.forEach(b => {
        targetGrid.innerHTML += `
            <div class="card">
                <p style="color: var(--accent-cyan); font-size: 0.8rem; margin-bottom: 5px;">> ${b.date}</p>
                <h3>${b.title}</h3>
                <p>${b.content.substring(0, 120)}...</p>
                <a href="javascript:void(0)" onclick="openBlogModal('${b.id}')" style="display:inline-block; margin-top:10px; font-size:0.9rem;">Read More >></a>
            </div>
        `;
    });
}

function openBlogModal(id) {
    const blog = getBlog();
    const post = blog.find(b => b.id === id);
    if (!post) return;

    document.getElementById('blog-modal-title').innerText = post.title;
    document.getElementById('blog-modal-date').innerText = `> ${post.date}`;
    document.getElementById('blog-modal-content').innerText = post.content;
    
    document.getElementById('blog-modal').style.display = 'flex';
    if (typeof synth !== 'undefined') synth.playSweep();
}

function openProjectModal(project) {
    document.getElementById('modal-title').innerText = project.title;
    document.getElementById('modal-img').src = project.image || 'https://via.placeholder.com/400x200/111/333';
    document.getElementById('modal-desc').innerText = project.desc;
    document.getElementById('modal-link').href = project.link || '#';
    
    const tagsCont = document.getElementById('modal-tags');
    tagsCont.innerHTML = (project.tags || []).map(t => `<span class="tag">${t.trim()}</span>`).join('');
    
    document.getElementById('project-modal').style.display = 'flex';
    if (typeof synth !== 'undefined') synth.playSweep();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

window.onclick = function(event) {
    const projectModal = document.getElementById('project-modal');
    const blogModal = document.getElementById('blog-modal');
    if (event.target == projectModal) {
        projectModal.style.display = "none";
    }
    if (event.target == blogModal) {
        blogModal.style.display = "none";
    }
}



// --- PARTICLES BACKGROUND (GOOGLE ANTIGRAVITY INTERACTIVE CANVAS VORTEX) ---
const canvas = document.getElementById('particles-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    // Set initial size
    resizeCanvas();

    const particlesArray = [];
    // High-contrast tech-themed colors designed for a clean white background
    const colors = [
        '#1e40af',  // Tech Navy
        '#d48806',  // Amber/orange
        '#475569',  // Dark slate gray
        '#2563eb',  // Tech Blue
        '#64748b'   // Slate gray
    ];

    // Mouse interactive coordinates
    let mouse = {
        x: null,
        y: null,
        radius: 140 // Magnetic field radius
    };

    // Parallax cluster sways
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    class Particle {
        constructor() {
            this.reset();
            // Stagger initial x/y coordinates to prevent spawning animation pop-in
            this.x = canvas.width / 2 + Math.cos(this.angle) * this.radius;
            this.y = canvas.height / 2 + Math.sin(this.angle) * this.radius;
        }

        reset() {
            this.angle = Math.random() * Math.PI * 2;
            // Radius from center, distributed to form a vortex ring / disc structure
            const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;
            this.radius = Math.random() * maxRadius + 30;
            // Orbital rotation speed around the vortex center
            this.spinSpeed = (Math.random() * 0.0012 + 0.0003) * (Math.random() > 0.5 ? 1 : -1);
            this.size = Math.random() * 1.5 + 0.6; // Tiny tech dots
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.shape = Math.random() > 0.65 ? 'square' : 'circle';
            this.opacity = Math.random() * 0.25 + 0.15;
        }

        update() {
            this.angle += this.spinSpeed;

            // Target base vortex coordinates including global parallax sways
            let baseX = canvas.width / 2 + Math.cos(this.angle) * this.radius + currentOffsetX;
            let baseY = canvas.height / 2 + Math.sin(this.angle) * this.radius + currentOffsetY;

            let targetX = baseX;
            let targetY = baseY;

            // Anti-gravity magnetic displacement physics force when mouse hover triggers
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    // Displace away (repel) from cursor to give a dynamic antigravity swarm effect
                    let forceX = (dx / distance) * force * 55;
                    let forceY = (dy / distance) * force * 55;

                    targetX = baseX - forceX;
                    targetY = baseY - forceY;
                }
            }

            // Smooth LERP physics interpolation
            this.x += (targetX - this.x) * 0.075;
            this.y += (targetY - this.y) * 0.075;
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.shape === 'circle') {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            }
        }
    }

    function initParticles() {
        particlesArray.length = 0;
        const particleCount = Math.min(180, Math.floor((canvas.width * canvas.height) / 6000));
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Smoothly update parallax offsets (circular cluster tilts in opposite direction of mouse)
        let targetOffsetX = 0;
        let targetOffsetY = 0;

        if (mouse.x !== null && mouse.y !== null) {
            let relX = (mouse.x - canvas.width / 2) / (canvas.width / 2);
            let relY = (mouse.y - canvas.height / 2) / (canvas.height / 2);
            targetOffsetX = -relX * 35; // Sway up to 35px in opposite direction
            targetOffsetY = -relY * 35;
        }

        currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
        currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Interactive pointermove and mouseenter/leave events
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // Initialize and run
    initParticles();
    animateParticles();
}

// --- BODY PARTICLES BACKGROUND (Floating dots for sections below) ---
const bodyCanvas = document.getElementById('body-particles-bg');
if (bodyCanvas) {
    const bCtx = bodyCanvas.getContext('2d');
    bodyCanvas.width = window.innerWidth;
    bodyCanvas.height = window.innerHeight;

    const bodyParticlesArray = [];
    const colors = ['#1e40af', '#d48806', '#64748b', '#2563eb', '#f5a623'];

    class BodyParticle {
        constructor() {
            this.x = Math.random() * bodyCanvas.width;
            this.y = Math.random() * bodyCanvas.height;
            this.size = Math.random() * 3 + 1.2;
            this.speedY = (Math.random() * -0.5) - 0.15; // Float upwards slowly
            this.speedX = Math.random() * 0.6 - 0.3;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.shape = Math.random() > 0.55 ? 'circle' : 'square';
            this.opacity = Math.random() * 0.35 + 0.25;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            // Loop around when moving off screen
            if (this.y < 0) {
                this.y = bodyCanvas.height;
                this.x = Math.random() * bodyCanvas.width;
            }
            if (this.x < 0) this.x = bodyCanvas.width;
            if (this.x > bodyCanvas.width) this.x = 0;
        }
        draw() {
            bCtx.globalAlpha = this.opacity;
            bCtx.fillStyle = this.color;
            bCtx.beginPath();
            if (this.shape === 'circle') {
                bCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                bCtx.fill();
            } else {
                bCtx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            }
        }
    }

    function initBodyParticles() {
        bodyParticlesArray.length = 0;
        const count = Math.min(100, Math.floor((bodyCanvas.width * bodyCanvas.height) / 18000));
        for (let i = 0; i < count; i++) {
            bodyParticlesArray.push(new BodyParticle());
        }
    }

    function animateBodyParticles() {
        bCtx.clearRect(0, 0, bodyCanvas.width, bodyCanvas.height);
        
        // Draw constellation lines connecting nearby particles
        for (let a = 0; a < bodyParticlesArray.length; a++) {
            for (let b = a + 1; b < bodyParticlesArray.length; b++) {
                let dx = bodyParticlesArray[a].x - bodyParticlesArray[b].x;
                let dy = bodyParticlesArray[a].y - bodyParticlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 110) {
                    let alpha = (1 - (distance / 110)) * 0.15;
                    bCtx.strokeStyle = `rgba(30, 64, 175, ${alpha})`;
                    bCtx.lineWidth = 0.8;
                    bCtx.beginPath();
                    bCtx.moveTo(bodyParticlesArray[a].x, bodyParticlesArray[a].y);
                    bCtx.lineTo(bodyParticlesArray[b].x, bodyParticlesArray[b].y);
                    bCtx.stroke();
                }
            }
        }

        for (let i = 0; i < bodyParticlesArray.length; i++) {
            bodyParticlesArray[i].update();
            bodyParticlesArray[i].draw();
        }
        requestAnimationFrame(animateBodyParticles);
    }

    initBodyParticles();
    animateBodyParticles();

    window.addEventListener('resize', () => {
        bodyCanvas.width = window.innerWidth;
        bodyCanvas.height = window.innerHeight;
        initBodyParticles();
    });
}

// --- VISUAL LOG GALLERY DATA ---
const galleryData = [
    {
        id: 'gal-1',
        title: 'Autonomous Navigation Testing',
        category: 'Robotics & SLAM',
        date: 'October 2023',
        image: 'photos/WhatsApp Image 2026-05-25 at 11.30.18.jpeg',
        desc: 'Validating real-time SLAM and Nav2 path-planning behaviors on our autonomous mobile robot prototype. Features physical LiDAR scan overlays, integrated IMU state estimation, and sensor-fusion navigation packages in complex indoor corridors.'
    },
    {
        id: 'gal-2',
        title: 'Wireless Power Coil Modeling',
        category: 'CAD Design',
        date: 'June 2025',
        image: 'photos/WhatsApp Image 2026-05-25 at 11.27.52(1).jpeg',
        desc: '3D SolidWorks CAD layout of an optimized electromagnetic wireless power transfer coil designed for electric vehicle chargers. Designed during research internship at IIT Madras under supervision of Dr. Deepak Ronanki.'
    },
    {
        id: 'gal-3',
        title: 'FEA Stress Simulation',
        category: 'Mechanical Modeling',
        date: 'September 2024',
        image: 'photos/WhatsApp Image 2026-05-25 at 11.26.12.jpeg',
        desc: 'Finite Element Analysis (FEA) structural simulation of the automated steering rack correction rig. Modeled stress contours and deflections under maximum corrective force applications to prevent shaft fractures.'
    },
    {
        id: 'gal-4',
        title: 'Force Calibration Dashboard',
        category: 'Control Logic',
        date: 'October 2024',
        image: 'photos/WhatsApp Image 2026-05-25 at 11.15.07.jpeg',
        desc: 'Interactive software interface for monitoring force-displacement curves during automated bend correction. Derives optimal force profiles using our mathematical deformation models to achieve sub-micron alignment accuracy.'
    },
    {
        id: 'gal-5',
        title: 'ISRO Cryogenic Liquid Propulsion',
        category: 'Propulsion Assembly',
        date: 'June 2024',
        image: 'photos/isro image 1.jpg',
        desc: 'Field notes and piping instrumentation diagrams of liquid propulsion control subsystems (Vikas and Cryogenic engines) observed during in-plant traineeship at ISRO Propulsion Complex (IPRC) in Mahendragiri.'
    },
    {
        id: 'gal-6',
        title: 'Mechatronics Placement Log',
        category: 'Education',
        date: 'November 2024',
        image: 'photos/WhatsApp Image 2026-05-25 at 11.38.15.jpeg',
        desc: 'Reviewing structural drawings and automation program schedules. This logs the final validation reports of the bend correction system before production-line integration.'
    },
    {
        id: 'gal-7',
        title: 'Ashok Leyland Automation',
        category: 'Industrial Systems',
        date: 'March 2024',
        image: 'ashok leyland.jpeg',
        desc: 'Observing large-scale robotic welding arms, automated gantry systems, and PLC-controlled heavy diesel engine testing beds at the Ashok Leyland manufacturing assembly facility.'
    },
    {
        id: 'gal-8',
        title: 'Wireless Power Lab - IIT Madras',
        category: 'Research Internship',
        date: 'July 2025',
        image: 'photos/iit-madras-indian-institute-of-technology-madras4653.jpg',
        desc: 'Electromagnetic simulation setup and performance evaluation boards in the Electric Vehicle Chargers & Wireless Power Transfer Lab at IIT Madras, under the Research Internship Program.'
    },
    {
        id: 'gal-9',
        title: 'ISRO IPRC Facilities',
        category: 'Space Technology',
        date: 'June 2024',
        image: 'photos/ISRO_transparent.png',
        desc: 'Documentation and system schematic of liquid engine high-altitude testbeds and automated nitrogen gas flushing controls at the ISRO Propulsion Complex.'
    },
    {
        id: 'gal-10',
        title: 'Steering Rack Alignment Rig',
        category: 'Manufacturing Engineering',
        date: 'August 2024',
        image: 'photos/rane_transparent.png',
        desc: 'Development testbed at Rane (Madras) Limited showing steering shafts positioned on the sensor-guided hydraulic pressing rig for high-precision automatic straightening.'
    }
];

let activeLightboxIndex = 0;

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    galleryData.forEach((item, index) => {
        grid.innerHTML += `
            <div class="gallery-card card fade-in" onclick="openLightbox(${index})">
                <div class="gallery-img-container">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="gallery-hover-overlay">
                        <span class="gallery-zoom-icon"><i class="fa-solid fa-expand"></i> VIEW LOG</span>
                    </div>
                </div>
                <div class="gallery-meta">
                    <span class="gallery-tag">${item.category}</span>
                    <span class="gallery-date">${item.date}</span>
                </div>
                <h3>${item.title}</h3>
            </div>
        `;
    });
}

// --- LIGHTBOX GALLERY MODAL CONTROLS ---
function openLightbox(index) {
    activeLightboxIndex = index;
    updateLightboxSlide();
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
        if (typeof synth !== 'undefined') synth.playSweep();
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Resume background scrolling
    }
}

function changeSlide(direction) {
    activeLightboxIndex += direction;
    if (activeLightboxIndex >= galleryData.length) activeLightboxIndex = 0;
    if (activeLightboxIndex < 0) activeLightboxIndex = galleryData.length - 1;
    updateLightboxSlide();
}

function updateLightboxSlide() {
    const item = galleryData[activeLightboxIndex];
    if (!item) return;
    
    document.getElementById('lightbox-img').src = item.image;
    document.getElementById('lightbox-title').innerText = item.title;
    document.getElementById('lightbox-desc').innerText = item.desc;
    document.getElementById('lightbox-counter').innerText = `${activeLightboxIndex + 1} / ${galleryData.length}`;
}

function handleLightboxOutsideClick(event) {
    if (event.target.id === 'lightbox-modal' || event.target.className === 'lightbox-content-wrapper') {
        closeLightbox();
    }
}

// Bind keyboard arrow keys for Lightbox navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'ArrowRight') changeSlide(1);
        if (e.key === 'ArrowLeft') changeSlide(-1);
        if (e.key === 'Escape') closeLightbox();
    }
});

// --- PREMIUM CUSTOM INTERACTIVE CURSOR ---
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const customCursorContainer = document.querySelector('.custom-cursor');
    
    if (!cursorDot || !cursorRing) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isMouseActive = false;
    let currentMode = 'default';
    let firstMove = true;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        cursorDot.style.display = 'none';
        cursorRing.style.display = 'none';
        const coordsText = document.querySelector('.cursor-coords');
        if (coordsText) coordsText.style.display = 'none';
        if (customCursorContainer) customCursorContainer.style.display = 'none';
        return;
    }

    // Auto-synthesize coordinate readout container if missing in subpages
    let coordsText = document.querySelector('.cursor-coords');
    if (!coordsText && customCursorContainer) {
        coordsText = document.createElement('div');
        coordsText.className = 'cursor-coords';
        coordsText.textContent = '[X: 0000, Y: 0000]';
        customCursorContainer.appendChild(coordsText);
    }
    
    // Set initial custom cursor opacity to 0
    if (customCursorContainer) {
        customCursorContainer.style.opacity = '0';
    }
    
    // Viewport mouse state tracking (fade-out when leaving window)
    document.addEventListener('mouseenter', () => {
        isMouseActive = true;
        if (customCursorContainer) customCursorContainer.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        isMouseActive = false;
        if (customCursorContainer) customCursorContainer.style.opacity = '0';
    });
    
    window.addEventListener('mousemove', (e) => {
        // Ensure cursor is visible when moving (in case document enter wasn't triggered)
        if (!isMouseActive) {
            isMouseActive = true;
            if (customCursorContainer) customCursorContainer.style.opacity = '1';
        }
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Prevent outer ring flying in from top-left (0,0) on first mouse movement
        if (firstMove) {
            ringX = mouseX;
            ringY = mouseY;
            firstMove = false;
        }
        
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });
    
    function renderRing() {
        // Smooth LERP lagging effect for outer ring
        const lerpFactor = 0.15;
        ringX += (mouseX - ringX) * lerpFactor;
        ringY += (mouseY - ringY) * lerpFactor;
        
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        
        // Update coordinate or label badge readout
        if (coordsText) {
            if (currentMode === 'target-lock') {
                coordsText.textContent = '[ GO ]';
            } else if (currentMode === 'scan-mode') {
                coordsText.textContent = '[ SCAN ]';
            } else if (currentMode === 'caliper-mode') {
                coordsText.textContent = '[ TYPE ]';
            } else {
                coordsText.textContent = '';
            }
            
            // Offset badge smoothly
            const badgeOffset = currentMode === 'caliper-mode' ? 12 : 20;
            coordsText.style.transform = `translate3d(${mouseX + badgeOffset}px, ${mouseY + badgeOffset}px, 0)`;
        }
        
        requestAnimationFrame(renderRing);
    }
    renderRing();
    
    // Selectors representing the different interaction modes
    const buttonSelector = 'a, button, .btn, .logo-btn, .routing-btn, .close-btn, .lightbox-close, .lightbox-prev, .lightbox-next, .timeline-know-me-btn, .switch-slider';
    const cardSelector = '.card, .gallery-card, .club-card, .timeline-card, .stat-card';
    const inputSelector = 'input, textarea, select';
    
    // Helper to safely apply cursor state classes without breaking active-click animations
    function updateCursorClasses() {
        if (!customCursorContainer) return;
        
        const isClicked = customCursorContainer.classList.contains('active-click');
        
        // Reset base class
        customCursorContainer.className = 'custom-cursor';
        
        // Apply current active hover mode
        if (currentMode !== 'default') {
            customCursorContainer.classList.add(currentMode);
        }
        
        // Preserve physical mousedown state
        if (isClicked) {
            customCursorContainer.classList.add('active-click');
        }
    }
    
    // Unified event delegation for mouse moves over active containers
    document.addEventListener('mouseover', (e) => {
        if (!customCursorContainer) return;
        
        const targetElement = e.target;
        if (!targetElement) return;
        
        let newMode = 'default';
        if (targetElement.closest(buttonSelector)) {
            newMode = 'target-lock';
        } else if (targetElement.closest(inputSelector)) {
            newMode = 'caliper-mode';
        } else if (targetElement.closest(cardSelector)) {
            newMode = 'scan-mode';
        }
        
        if (newMode !== currentMode) {
            currentMode = newMode;
            updateCursorClasses();
        }
    });
    
    // Click active feedback
    document.addEventListener('mousedown', () => {
        if (customCursorContainer) customCursorContainer.classList.add('active-click');
    });
    
    document.addEventListener('mouseup', () => {
        if (customCursorContainer) customCursorContainer.classList.remove('active-click');
    });
}

// --- SCROLL-DRIVEN HERO REVEAL & INTERACTIVE PORTRAIT (ONYEKACHI MASKING) ---
let heroMouseX = 0;
let heroMouseY = 0;
let portraitTargetX = 0;
let portraitTargetY = 0;

function initHeroScrollReveal() {
    const revealLayer = document.querySelector('.hero-reveal-layer');
    const scrollText = document.querySelector('.scroll-down-text');
    const portraitImg = document.querySelector('.hero-portrait-img');
    
    if (!revealLayer) return;

    // Skip scroll reveal calculations on mobile/tablet viewports to conserve CPU/battery
    if (window.innerWidth <= 768) {
        if (scrollText) scrollText.style.display = 'none';
        return;
    }
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const maxScroll = window.innerHeight;
        const buffer = maxScroll * 0.2; // 20% scroll dead-zone buffer
        
        let factor = 0;
        if (scrollTop > buffer) {
            factor = Math.min((scrollTop - buffer) / (maxScroll - buffer), 1);
        }
        
        let clipPercentage = 100 - (factor * 100);
        revealLayer.style.clipPath = `inset(0 ${clipPercentage}% 0 0)`;
        
        if (scrollText) {
            scrollText.style.opacity = 1 - (factor * 2);
        }

        // Opposite horizontal parallax scroll effects (Base moves Left to Right, Reveal sways in right corner)
        const baseTitle = document.querySelector('.hero-base-layer .hero-title');
        const revealTitle = document.querySelector('.hero-reveal-layer .hero-title');
        const moveAmount = factor * window.innerWidth * 0.15; // Subtle 15vw parallax
        
        if (baseTitle) {
            baseTitle.style.transform = `translate3d(${moveAmount}px, 0, 0)`;
        }
        if (revealTitle) {
            // Keep reveal title firmly in the right corner with a tiny, elegant 30px parallax sway
            revealTitle.style.transform = `translate3d(${-factor * 30}px, 0, 0)`;
        }
    });
    
    window.addEventListener('mousemove', (e) => {
        heroMouseX = (e.clientX / window.innerWidth) - 0.5;
        heroMouseY = (e.clientY / window.innerHeight) - 0.5;
    });
    
    function renderPortraitDynamics() {
        if (portraitImg) {
            portraitTargetX += (heroMouseX * -35 - portraitTargetX) * 0.08;
            portraitTargetY += (heroMouseY * -35 - portraitTargetY) * 0.08;
            
            const scrollTop = window.scrollY;
            const maxScroll = window.innerHeight;
            const buffer = maxScroll * 0.2; // 20% scroll dead-zone buffer
            
            let factor = 0;
            if (scrollTop > buffer) {
                factor = Math.min((scrollTop - buffer) / (maxScroll - buffer), 1);
            }
            
            let scrollYOffset = 80 - (factor * 80);
            let scaleVal = 0.85 + (factor * 0.18);
            let opacityVal = Math.min(factor * 3, 1); // High-visibility fast fade-in (fully visible by 33% of the sweep)
            
            let finalY = scrollYOffset + portraitTargetY;
            let finalX = portraitTargetX;
            
            portraitImg.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(${scaleVal})`;
            portraitImg.style.opacity = opacityVal;
        }
        
        requestAnimationFrame(renderPortraitDynamics);
    }
    
    renderPortraitDynamics();
}

// --- SMART HIDING NAVIGATION BAR ---
function initSmartNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    let lastScrollY = window.scrollY;
    const isHomepage = !!document.getElementById('hero');
    
    // Initial check
    if (isHomepage && window.scrollY < window.innerHeight * 1.5) {
        nav.classList.add('nav-hidden');
    }
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const threshold = window.innerHeight * 1.5;
        
        if (isHomepage && currentScrollY < threshold) {
            nav.classList.add('nav-hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }
        
        lastScrollY = currentScrollY;
    });
}

// --- PREMIUM 3D HYPER-REALISTIC INTERACTIVE ROBOT ARM (THREE.JS) ---
function init3DRobotArm() {
    const container = document.getElementById('robot-3d-container');
    if (!container) return;

    // Skip Three.js rendering on mobile/tablet viewports to maximize performance and save battery
    if (window.innerWidth <= 768) {
        container.style.display = 'none';
        return;
    }

    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Retrying in 200ms...');
        setTimeout(init3DRobotArm, 200);
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7.5);
    camera.lookAt(0, 0.7, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const robotArmGroup = new THREE.Group();
    robotArmGroup.position.set(0.3, -1.5, 0); 
    scene.add(robotArmGroup);

    // Physically-Based High-Fidelity Materials
    const industrialOrange = new THREE.MeshStandardMaterial({
        color: 0xdb5a02, // Powder-coated bright KUKA orange
        metalness: 0.15,
        roughness: 0.35,
        bumpScale: 0.05
    });

    const brushedChrome = new THREE.MeshStandardMaterial({
        color: 0xf3f4f6, // Ultra-shiny polished steel chrome
        metalness: 1.0,
        roughness: 0.08
    });

    const structuralChassisMat = new THREE.MeshStandardMaterial({
        color: 0x334155, // Matte graphite structural casing
        metalness: 0.5,
        roughness: 0.45
    });

    const darkChassisMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Deep dark slate gear enclosures
        metalness: 0.7,
        roughness: 0.3
    });

    const ledGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Status green LED
    const ledRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });   // Active torque red LED

    // 1. Hexagonal Bolt-Mounted Pedestal Foundation
    const basePlateGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.15, 6);
    const basePlate = new THREE.Mesh(basePlateGeo, structuralChassisMat);
    basePlate.receiveShadow = true;
    robotArmGroup.add(basePlate);

    // Add 6 mounting hexagonal bolt heads at base corners
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 6), brushedChrome);
        bolt.position.set(Math.cos(angle) * 1.15, 0.08, Math.sin(angle) * 1.15);
        bolt.rotation.y = Math.random();
        basePlate.add(bolt);
    }

    // 2. Main Turntable Base Casing (Rotates)
    const turntableGroup = new THREE.Group();
    turntableGroup.position.y = 0.2;
    robotArmGroup.add(turntableGroup);

    const turntableGeo = new THREE.CylinderGeometry(0.8, 0.88, 0.4, 32);
    const turntable = new THREE.Mesh(turntableGeo, darkChassisMat);
    turntable.castShadow = true;
    turntableGroup.add(turntable);

    // Interlocking concentric base gear details for mechatronic drive
    const baseGearGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.08, 24);
    const baseGear = new THREE.Mesh(baseGearGeo, brushedChrome);
    baseGear.position.y = 0.22;
    turntableGroup.add(baseGear);

    // Side control motor housing with pulsing LED indicators
    const motorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.5), industrialOrange);
    motorHousing.position.set(-0.55, 0.05, 0);
    motorHousing.rotation.y = 0.2;
    turntableGroup.add(motorHousing);

    const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), ledGreen);
    led1.position.set(-0.8, 0.1, 0.1);
    turntableGroup.add(led1);

    const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), ledRed);
    led2.position.set(-0.8, 0.1, -0.1);
    turntableGroup.add(led2);

    // 3. Heavy Shoulder Pivot Casing
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.y = 0.3;
    turntableGroup.add(shoulderGroup);

    const shoulderJointMatGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.8, 24);
    shoulderJointMatGeo.rotateX(Math.PI / 2); // Axis horizontal
    const shoulderJointMat = new THREE.Mesh(shoulderJointMatGeo, structuralChassisMat);
    shoulderJointMat.castShadow = true;
    shoulderGroup.add(shoulderJointMat);

    // 4. Dual-Beam / Twin-Spar Upper Arm Assembly
    const upperArmGroup = new THREE.Group();
    shoulderGroup.add(upperArmGroup);

    // Left Spar Box Beam
    const sparLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.3), industrialOrange);
    sparLeft.position.set(-0.25, 0.9, 0);
    sparLeft.castShadow = true;
    upperArmGroup.add(sparLeft);

    // Right Spar Box Beam
    const sparRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.3), industrialOrange);
    sparRight.position.set(0.25, 0.9, 0);
    sparRight.castShadow = true;
    upperArmGroup.add(sparRight);

    // Parallel Hydraulic/Pneumatic conduits on Left Spar for high-fidelity mechatronics
    const conduitLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), brushedChrome);
    conduitLeft.position.set(-0.35, 0.9, 0.08);
    upperArmGroup.add(conduitLeft);

    // Parallel Hydraulic/Pneumatic conduits on Right Spar for high-fidelity mechatronics
    const conduitRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), brushedChrome);
    conduitRight.position.set(0.35, 0.9, 0.08);
    upperArmGroup.add(conduitRight);
    
    // Cable tie blocks holding the conduits in place
    const tie1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.08), structuralChassisMat);
    tie1.position.set(0, 1.3, 0.08);
    upperArmGroup.add(tie1);

    const tie2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.08), structuralChassisMat);
    tie2.position.set(0, 0.5, 0.08);
    upperArmGroup.add(tie2);

    // Rear counterweight balance unit
    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.4), darkChassisMat);
    counterweight.position.set(0, 0.25, -0.3);
    upperArmGroup.add(counterweight);

    // 5. Heavy Elbow Joint Hub
    const elbowGroup = new THREE.Group();
    elbowGroup.position.y = 1.8; // At upper arm top
    upperArmGroup.add(elbowGroup);

    const elbowHubGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 24);
    elbowHubGeo.rotateX(Math.PI / 2);
    const elbowHub = new THREE.Mesh(elbowHubGeo, darkChassisMat);
    elbowHub.castShadow = true;
    elbowGroup.add(elbowHub);

    // 6. Symmetrical Forearm Structural Beam
    const forearmGroup = new THREE.Group();
    elbowGroup.add(forearmGroup);

    const forearmLink = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.5, 0.24), industrialOrange);
    forearmLink.position.y = 0.75;
    forearmLink.castShadow = true;
    forearmGroup.add(forearmLink);

    // Add a structural dark plate details along the forearm
    const forearmPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.12), structuralChassisMat);
    forearmPlate.position.set(0, 0.75, 0.08);
    forearmGroup.add(forearmPlate);

    // Dynamic LED Indicators on forearm plate
    const forearmLEDs = [];
    const ledBlue = new THREE.MeshBasicMaterial({ color: 0x1e40af });
    const ledAmber = new THREE.MeshBasicMaterial({ color: 0xd48806 });
    for (let i = 0; i < 3; i++) {
        const ledMat = i === 0 ? ledGreen : i === 1 ? ledAmber : ledBlue;
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), ledMat);
        led.position.set(0.07 * (i - 1), 0.75, 0.15); // Spread horizontally along plate
        forearmGroup.add(led);
        forearmLEDs.push(led);
    }
    forearmGroup.userData.leds = forearmLEDs;

    // 7. Multi-Axis Wrist Joint Assembly (Pitch-Yaw-Roll)
    const wristPitchGroup = new THREE.Group();
    wristPitchGroup.position.y = 1.5; // Forearm top
    forearmGroup.add(wristPitchGroup);

    const wristPitchJoint = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), brushedChrome);
    wristPitchGroup.add(wristPitchJoint);

    const wristRollGroup = new THREE.Group();
    wristRollGroup.position.y = 0.15;
    wristPitchGroup.add(wristRollGroup);

    const wristRollPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24), structuralChassisMat);
    wristRollGroup.add(wristRollPlate);

    // 8. Industrial Parallel Pneumatic Gripper Base
    const gripperGroup = new THREE.Group();
    gripperGroup.position.y = 0.1;
    wristRollGroup.add(gripperGroup);

    const gripperBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.24), darkChassisMat);
    gripperGroup.add(gripperBlock);

    // Dual Parallel Claw Jaws (Sliding on linear guide rails)
    const clawLeftJaw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.14), structuralChassisMat);
    clawLeftJaw.position.set(-0.16, 0.18, 0);
    gripperGroup.add(clawLeftJaw);

    const clawLeftFinger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.12), brushedChrome);
    clawLeftFinger.position.set(-0.16, 0.32, 0);
    gripperGroup.add(clawLeftFinger);

    const clawRightJaw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.14), structuralChassisMat);
    clawRightJaw.position.set(0.16, 0.18, 0);
    gripperGroup.add(clawRightJaw);

    const clawRightFinger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.12), brushedChrome);
    clawRightFinger.position.set(0.16, 0.32, 0);
    gripperGroup.add(clawRightFinger);

    // Rubber Grip Pads inside claw fingers
    const padMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Deep slate grey rubber
        roughness: 0.9,
        metalness: 0.0
    });
    
    const padLeft = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.1), padMat);
    padLeft.position.set(-0.13, 0.32, 0);
    gripperGroup.add(padLeft);
    gripperGroup.userData.padLeft = padLeft; // Attach for sliding pinch animation

    const padRight = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.1), padMat);
    padRight.position.set(0.13, 0.32, 0);
    gripperGroup.add(padRight);
    gripperGroup.userData.padRight = padRight; // Attach for sliding pinch animation

    // Laser Guide Emitter on bottom of gripper block
    const emitterGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
    const laserEmitter = new THREE.Mesh(emitterGeo, structuralChassisMat);
    laserEmitter.position.set(0, 0.06, 0.12);
    laserEmitter.rotation.x = Math.PI / 2;
    gripperGroup.add(laserEmitter);
    
    const laserLens = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), ledRed);
    laserLens.position.set(0, 0.06, 0.16);
    gripperGroup.add(laserLens);


    // ==========================================
    // 9. HIGH-FIDELITY HYDRAULIC ACTUATORS (PISTONS)
    // ==========================================

    // Anchors for Shoulder Actuator
    const shoulderPistonBaseAnchor = new THREE.Object3D();
    shoulderPistonBaseAnchor.position.set(0, 0.1, -0.4); // Fixed to turntable behind shoulder
    turntableGroup.add(shoulderPistonBaseAnchor);

    const shoulderPistonArmAnchor = new THREE.Object3D();
    shoulderPistonArmAnchor.position.set(0, 1.0, -0.15); // Fixed halfway up upper arm
    upperArmGroup.add(shoulderPistonArmAnchor);

    // Anchors for Elbow Actuator
    const elbowPistonBaseAnchor = new THREE.Object3D();
    elbowPistonBaseAnchor.position.set(0, 0.4, 0.15); // Fixed lower upper arm front
    upperArmGroup.add(elbowPistonBaseAnchor);

    // Mechanical mounting bracket at the base
    const baseBracket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.1), structuralChassisMat);
    baseBracket.position.set(0, 0.4, 0.1);
    upperArmGroup.add(baseBracket);

    const elbowPistonArmAnchor = new THREE.Object3D();
    elbowPistonArmAnchor.position.set(0, 0.6, 0.15); // Fixed halfway forearm front
    forearmGroup.add(elbowPistonArmAnchor);

    // Mechanical mounting bracket on the forearm
    const armBracket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.1), structuralChassisMat);
    armBracket.position.set(0, 0.6, 0.1);
    forearmGroup.add(armBracket);

    // Build Shoulder Piston Mesh
    const shoulderPistonGroup = new THREE.Group();
    scene.add(shoulderPistonGroup);

    const shCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16), structuralChassisMat);
    shCylinder.geometry.translate(0, 0.5, 0); // Origin at bottom base
    shCylinder.geometry.rotateX(Math.PI / 2); // Align cylinder along local Z axis
    shoulderPistonGroup.add(shCylinder);

    const shShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16), brushedChrome);
    shShaft.geometry.translate(0, 0.5, 0);
    shShaft.geometry.rotateX(Math.PI / 2);
    shoulderPistonGroup.add(shShaft);

    // Build Elbow Piston Mesh - Upgraded to Unit 1.0 height for perfect mathematical scaling
    const elbowPistonGroup = new THREE.Group();
    scene.add(elbowPistonGroup);

    const elCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16), structuralChassisMat);
    elCylinder.geometry.translate(0, 0.5, 0); // Base at (0,0,0), extends from 0 to 1 along Y
    elCylinder.geometry.rotateX(Math.PI / 2); // Rotate so it extends from 0 to 1 along Z
    elbowPistonGroup.add(elCylinder);

    const elShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 16), brushedChrome);
    elShaft.geometry.translate(0, 0.5, 0); // Base at (0,0,0), extends from 0 to 1 along Y
    elShaft.geometry.rotateX(Math.PI / 2); // Rotate so it extends from 0 to 1 along Z
    elbowPistonGroup.add(elShaft);

    // Helper to dynamically update piston positions and orientations
    function updateHydraulicPiston(pistonGroup, cylinderMesh, shaftMesh, anchorA, anchorB) {
        const posA = new THREE.Vector3();
        const posB = new THREE.Vector3();

        anchorA.getWorldPosition(posA);
        anchorB.getWorldPosition(posB);

        // Position at Anchor A and orient towards Anchor B
        pistonGroup.position.copy(posA);
        pistonGroup.lookAt(posB);

        const totalDist = posA.distanceTo(posB);

        // Set Cylinder Mesh scaling (always 55% of original distance)
        const cylinderLen = totalDist * 0.55;
        cylinderMesh.scale.set(1, 1, cylinderLen);

        // Slide the inner chrome shaft along local Z to exactly reach posB
        const shaftLen = totalDist - cylinderLen;
        shaftMesh.scale.set(1, 1, shaftLen);
        shaftMesh.position.set(0, 0, cylinderLen);
    }


    // ==========================================
    // 10. DRAMATIC INDUSTRIAL STAGE LIGHTING
    // ==========================================

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Dramatic spot light casting soft industrial shadows
    const spotLight = new THREE.SpotLight(0xffffff, 1.8);
    spotLight.position.set(3, 8, 4);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.8;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.001;
    scene.add(spotLight);

    // Secondary fill light for chrome highlights
    const fillLight = new THREE.DirectionalLight(0x1e40af, 1.2);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // Glowing rim back light
    const backLight = new THREE.DirectionalLight(0xd48806, 0.7);
    backLight.position.set(2, 5, -6);
    scene.add(backLight);


    // ==========================================
    // 11. INERTIAL MOUSE TRACKING & KINEMATICS
    // ==========================================

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Spring/LERP joint target states for mechanical inertia
    let curTurntableRot = 0;
    let curShoulderRot = 0;
    let curElbowRot = 0;

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);

        time += 0.015;

        // Diagnostic pulse LEDs
        led1.material.opacity = 0.5 + Math.sin(time * 4) * 0.4;
        led2.material.opacity = 0.5 + Math.cos(time * 3.5) * 0.4;

        // Sequential LED blinking cycle on Forearm
        if (forearmGroup.userData.leds) {
            const ledCycle = Math.floor(time * 5.0) % 3;
            forearmGroup.userData.leds.forEach((led, idx) => {
                led.material.transparent = true;
                led.material.opacity = (idx === ledCycle) ? 1.0 : 0.15;
            });
        }

        // Rich continuous mechatronic dancing wave offsets (autonomous choreography)
        // Dual-frequency equations combine broad elegant sways with high-precision stabilization micro-pulses
        const danceBase = Math.sin(time * 0.4) * 0.5 + Math.sin(time * 1.6) * 0.08;               // Elegant side-to-side sweeping + stabilization sways
        const danceShoulder = Math.cos(time * 0.6) * 0.18 + Math.cos(time * 1.2) * 0.04 - 0.1;      // Organic vertical breathing bowing + micro-nodding sways
        const danceElbow = Math.sin(time * 0.6 + Math.PI / 3) * 0.28 + Math.sin(time * 1.8) * 0.05 + 0.45; // Coordinated folding/unfolding flexes
        const danceWristPitch = Math.sin(time * 1.0) * 0.25 + Math.cos(time * 2.0) * 0.08;          // Active pointing/stabilizing hand gestures
        const danceWristRoll = time * 0.4 + Math.sin(time * 0.8) * 0.6;                            // Continuous orbital spin with slow sway overlay

        // Clamp mouse coordinates to [-1, 1] to prevent excessive rotation when mouse is off-canvas
        const clampedMouseX = Math.max(-1, Math.min(1, mouseX));
        const clampedMouseY = Math.max(-1, Math.min(1, mouseY));

        // Separate LERP calculations: Apply responsive LERP to mouse cursor
        const targetMouseTurntable = clampedMouseX * 0.75;
        const targetMouseShoulder = (clampedMouseY * 0.35) - 0.12;
        const targetMouseElbow = (clampedMouseX * 0.35) + 0.4;

        // Smoothly interpolate the cursor influence with a more responsive 0.08 coefficient
        curTurntableRot += (targetMouseTurntable - curTurntableRot) * 0.08;
        curShoulderRot += (targetMouseShoulder - curShoulderRot) * 0.08;
        curElbowRot += (targetMouseElbow - curElbowRot) * 0.08;

        // Combine LERPed cursor tracking AND undampened dynamic dancing waves!
        turntableGroup.rotation.y = curTurntableRot + danceBase;
        shoulderGroup.rotation.z = curShoulderRot + danceShoulder;
        elbowGroup.rotation.z = curElbowRot + danceElbow;

        // Dynamic Wrist idle wiggle and dance
        wristPitchGroup.rotation.x = Math.sin(time * 1.8) * 0.16 + danceWristPitch;
        wristRollGroup.rotation.y = Math.cos(time * 1.5) * 0.22 + danceWristRoll;

        // Symmetrical Sliding Parallel Claw Pinch Action - Upgraded to a complex mechatronic double-clamp routine!
        const pinchOffset = 0.04 + Math.sin(time * 0.6) * 0.02 + Math.max(0, Math.sin(time * 2.4)) * 0.015;
        clawLeftJaw.position.x = -(0.16 + pinchOffset);
        clawLeftFinger.position.x = -(0.16 + pinchOffset);
        clawRightJaw.position.x = 0.16 + pinchOffset;
        clawRightFinger.position.x = 0.16 + pinchOffset;

        // Slide rubber protective pads symmetrically along claw jaws
        if (gripperGroup.userData.padLeft) {
            gripperGroup.userData.padLeft.position.x = -(0.13 + pinchOffset);
        }
        if (gripperGroup.userData.padRight) {
            gripperGroup.userData.padRight.position.x = 0.13 + pinchOffset;
        }

        // Force matrix updates so getWorldPosition gets absolute positions in real-time
        scene.updateMatrixWorld(true);

        // Update Hydraulic Cylinders
        updateHydraulicPiston(shoulderPistonGroup, shCylinder, shShaft, shoulderPistonBaseAnchor, shoulderPistonArmAnchor);
        updateHydraulicPiston(elbowPistonGroup, elCylinder, elShaft, elbowPistonBaseAnchor, elbowPistonArmAnchor);

        // Breathe the dramatic stage lights dynamically inside the loop
        if (spotLight) {
            spotLight.intensity = 1.8 + Math.sin(time * 1.5) * 0.4;
        }
        if (fillLight) {
            fillLight.intensity = 1.2 + Math.cos(time * 1.2) * 0.3;
        }

        // Slow camera drift
        camera.position.x = Math.sin(time * 0.1) * 0.3;
        camera.lookAt(0, 0.7, 0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

// --- PREMIUM VIRTUAL NATIVE SMOOTH INERTIAL SCROLL ENGINE ---
let virtualScrollY = window.scrollY;
let currentScrollY = window.scrollY;
let isScrollSmoothing = false;
let scrollSmoothRAF = null;

function initInertialScroll() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return; // Native momentum touch scrolling is already premium

    // Intercept native mousewheel scrolling
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Dynamic accumulate target scroll position
        virtualScrollY += e.deltaY;
        virtualScrollY = Math.max(0, Math.min(virtualScrollY, document.documentElement.scrollHeight - window.innerHeight));
        
        if (!isScrollSmoothing) {
            isScrollSmoothing = true;
            smoothScrollLoop();
        }
    }, { passive: false });

    // Intercept keyboard arrow keys for luxury editorial sways
    window.addEventListener('keydown', (e) => {
        let keyScrollSpeed = 70;
        let handled = false;
        
        if (e.key === 'ArrowDown') { virtualScrollY += keyScrollSpeed; handled = true; }
        else if (e.key === 'ArrowUp') { virtualScrollY -= keyScrollSpeed; handled = true; }
        else if (e.key === 'PageDown') { virtualScrollY += window.innerHeight * 0.8; handled = true; }
        else if (e.key === 'PageUp') { virtualScrollY -= window.innerHeight * 0.8; handled = true; }
        else if (e.key === 'Space') {
            if (e.shiftKey) virtualScrollY -= window.innerHeight * 0.8;
            else virtualScrollY += window.innerHeight * 0.8;
            handled = true;
        }
        else if (e.key === 'Home') { virtualScrollY = 0; handled = true; }
        else if (e.key === 'End') { virtualScrollY = document.documentElement.scrollHeight - window.innerHeight; handled = true; }
        
        if (handled) {
            e.preventDefault();
            virtualScrollY = Math.max(0, Math.min(virtualScrollY, document.documentElement.scrollHeight - window.innerHeight));
            if (!isScrollSmoothing) {
                isScrollSmoothing = true;
                smoothScrollLoop();
            }
        }
    });

    // Synchronize virtual scroll position with manual scrollbar clicks
    window.addEventListener('scroll', () => {
        if (!isScrollSmoothing) {
            virtualScrollY = window.scrollY;
            currentScrollY = window.scrollY;
        }
    });

    // Anchor link smooth LERP scrolling interceptor
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                virtualScrollY = targetEl.offsetTop;
                if (!isScrollSmoothing) {
                    isScrollSmoothing = true;
                    smoothScrollLoop();
                }
            }
        });
    });
}

function smoothScrollLoop() {
    const lerpFactor = 0.08; // Decelerating luxury inertia (0.08 LERP coefficient)
    const diff = virtualScrollY - currentScrollY;
    
    if (Math.abs(diff) > 0.25) {
        currentScrollY += diff * lerpFactor;
        window.scrollTo(0, currentScrollY);
        
        scrollSmoothRAF = requestAnimationFrame(smoothScrollLoop);
    } else {
        currentScrollY = virtualScrollY;
        window.scrollTo(0, currentScrollY);
        isScrollSmoothing = false;
        if (scrollSmoothRAF) cancelAnimationFrame(scrollSmoothRAF);
    }
}

// --- DYNAMIC APPLE-STYLE LAYERED SCROLL PARALLAX ENGINE ---
function initScrollParallax() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return; // Disable parallax on mobile touch to avoid jitter

    const parallaxElements = [];
    
    // Auto-discover all PCB dividers and explicit parallax tags
    document.querySelectorAll('.pcb-divider, .parallax').forEach(el => {
        let speed = parseFloat(el.getAttribute('data-speed'));
        if (isNaN(speed)) {
            // PCB dividers move slightly opposite to create deep structural recesses
            speed = el.classList.contains('pcb-divider') ? -0.12 : 0.08;
        }
        
        el.style.willChange = 'transform';
        parallaxElements.push({
            element: el,
            speed: speed,
            offsetTop: el.offsetTop
        });
    });

    // Dynamic offset re-calculation on resize
    window.addEventListener('resize', () => {
        parallaxElements.forEach(item => {
            item.offsetTop = item.element.offsetTop;
        });
    });

    // Inertially update on LERPed scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        
        parallaxElements.forEach(item => {
            const viewportCenter = scrollTop + window.innerHeight / 2;
            const elementCenter = item.offsetTop + item.element.clientHeight / 2;
            const relativeOffset = viewportCenter - elementCenter;
            
            const translateVal = relativeOffset * item.speed;
            item.element.style.transform = `translate3d(0, ${translateVal}px, 0)`;
        });
    });
}

// --- INTERACTIVE TIMELINE SCROLL TRIGGER & ACTIVE HIGHLIGHT ---
function scrollToExperience(id) {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Smooth scroll to the experience card
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Set active logo state
    document.querySelectorAll('.timeline-logos-row .logo-btn').forEach(btn => {
        if (btn.getAttribute('data-target') === id) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initTimelineScrollObserver() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const logoBtns = document.querySelectorAll('.timeline-logos-row .logo-btn');
    
    if (!timelineItems.length || !logoBtns.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -45% 0px',
        threshold: 0.25
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                logoBtns.forEach(btn => {
                    if (btn.getAttribute('data-target') === id) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => observer.observe(item));
}

// --- INTERACTIVE SKILLS GRID & TABS ---
const skillsData = {
    programming: [
        { name: "C / C++", icon: '<i class="fa-solid fa-code"></i>' },
        { name: "Python", image: "skills/python-logo.png" },
        { name: "Java", image: "skills/java-logo.png" }
    ],
    robotics: [
        { name: "ROS / ROS2 Humble", image: "skills/ros2.jpg" },
        { name: "Gazebo Simulator", image: "skills/gazebo.jpg" },
        { name: "Linux OS", image: "skills/linux.png" },
        { name: "QGroundControl", image: "skills/qgc.jpg" },
        { name: "MATLAB", image: "skills/matlab.jpg" }
    ],
    ai: [
        { name: "Machine Learning", icon: '<i class="fa-solid fa-brain"></i>' },
        { name: "Computer Vision", icon: '<i class="fa-solid fa-eye"></i>' }
    ],
    cad: [
        { name: "SolidWorks", image: "skills/solidworks-logo.png" },
        { name: "Autodesk Fusion 360", image: "skills/autodesk-fusion-360.png" },
        { name: "Ansys FEA", image: "skills/ansys.png" }
    ],
    plc: [
        { name: "CODESYS PLC", image: "skills/codesys.png" },
        { name: "Festo FluidSIM", image: "skills/fluidsim.jpg" },
        { name: "LabVIEW", image: "skills/labview.jpg" },
        { name: "TIA Portal", image: "skills/tia portal.jpg" }
    ],
    pcb: [
        { name: "Altium Designer", image: "skills/altium.jpg" },
        { name: "EasyEDA", image: "skills/easyeda.jpg" }
    ],
    hardware: [
        { name: "Arduino", icon: '<i class="fa-solid fa-microchip"></i>' },
        { name: "ESP32 / IoT", icon: '<i class="fa-solid fa-network-wired"></i>' },
        { name: "Raspberry Pi", icon: '<i class="fa-brands fa-raspberry-pi"></i>' }
    ],
    web: [
        { name: "HTML5 / CSS3", icon: '<i class="fa-brands fa-html5"></i>' },
        { name: "JavaScript", icon: '<i class="fa-brands fa-js"></i>' },
        { name: "React / Next.js", icon: '<i class="fa-brands fa-react"></i>' }
    ],
    analytics: [
        { name: "Microsoft Power BI", image: "skills/power-bi.png" }
    ]
};

function initSkillsTabs() {
    const grid = document.getElementById('skills-display-grid');
    const tabs = document.querySelectorAll('.skill-tab-btn');
    
    if (!grid || !tabs.length) return;
    
    function renderCategory(category) {
        const skills = skillsData[category] || [];
        grid.innerHTML = '';
        
        skills.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = 'skill-item-card';
            if (skill.icon) {
                card.innerHTML = `
                    <div class="skill-item-icon-wrapper">${skill.icon}</div>
                    <span class="skill-item-name">${skill.name}</span>
                `;
            } else {
                card.innerHTML = `
                    <img src="${skill.image}" alt="${skill.name}" class="skill-item-img">
                    <span class="skill-item-name">${skill.name}</span>
                `;
            }
            grid.appendChild(card);
            
            // Subtle entrance stagger animation
            setTimeout(() => {
                card.classList.add('show');
            }, index * 60);
        });
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-category');
            renderCategory(category);
            
            if (typeof synth !== 'undefined') {
                synth.playWhirr();
            }
        });
    });

    // Default to the first category on page load
    if (tabs.length > 0) {
        tabs[0].click();
    }
}

// --- CONTACT ROUTING SELECTOR ---
function initContactRouting() {
    const routingBtns = document.querySelectorAll('.routing-btn');
    const routingInput = document.getElementById('routing-channel');
    const submitBtn = document.getElementById('contact-submit-btn');
    const contactForm = document.getElementById('contact-form');

    if (!routingBtns.length || !routingInput || !submitBtn || !contactForm) return;

    routingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            routingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const channel = btn.getAttribute('data-channel');
            routingInput.value = channel;

            if (channel === 'whatsapp') {
                submitBtn.innerText = 'Transmit via WhatsApp';
                submitBtn.classList.add('whatsapp-active');
            } else {
                submitBtn.innerText = 'Transmit via Email';
                submitBtn.classList.remove('whatsapp-active');
            }
        });
    });

    contactForm.addEventListener('submit', (e) => {
        const channel = routingInput.value;
        if (channel === 'whatsapp') {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            const whatsappNumber = '916379761638';
            const text = `Hi Rittu,\n\nI visited your portfolio and wanted to reach out.\n\n*Transmission details:*\n- *Name:* ${name}\n- *Email:* ${email}\n\n*Payload (Message):*\n${message}`;
            const encodedText = encodeURIComponent(text);

            window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
        }
    });
}

// --- SCI-FI AUDIO AND THEME CONTROLS ---
function ensureNavControls() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let navControls = nav.querySelector('.nav-controls');
    if (!navControls) {
        navControls = document.createElement('div');
        navControls.className = 'nav-controls';
        navControls.innerHTML = `
            <!-- Audio Toggle (Default Muted) -->
            <button id="audio-toggle" class="control-btn" title="Toggle Sci-Fi Audio Systems" aria-label="Toggle Audio">
                <i class="fa-solid fa-volume-xmark"></i>
            </button>
        `;
        nav.appendChild(navControls);
    }
    
    // Auto-synthesize mobile hamburger toggle button if missing
    let burgerBtn = navControls.querySelector('#mobile-nav-toggle');
    if (!burgerBtn) {
        burgerBtn = document.createElement('button');
        burgerBtn.id = 'mobile-nav-toggle';
        burgerBtn.className = 'control-btn mobile-nav-btn';
        burgerBtn.title = 'Toggle Menu';
        burgerBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
        burgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        navControls.appendChild(burgerBtn);
    }
}

function initMobileNav() {
    const burgerBtn = document.getElementById('mobile-nav-toggle');
    const nav = document.querySelector('nav');
    
    if (!burgerBtn || !nav) return;
    
    burgerBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-active');
        const icon = burgerBtn.querySelector('i');
        if (nav.classList.contains('mobile-active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
        if (typeof synth !== 'undefined') {
            synth.playClick();
        }
    });
    
    // Close mobile nav drawer when clicking any page link
    const navLinks = nav.querySelectorAll('ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('mobile-active')) {
                nav.classList.remove('mobile-active');
                const icon = burgerBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    });
}

function initAudioToggle() {
    const audioBtn = document.getElementById('audio-toggle');
    if (!audioBtn) return;

    // Load saved preferences
    const savedMute = localStorage.getItem('sci_fi_audio_muted');
    if (savedMute === 'false') {
        synth.isMuted = false;
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    } else {
        synth.isMuted = true;
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }

    audioBtn.addEventListener('click', () => {
        synth.isMuted = !synth.isMuted;
        if (!synth.isMuted) {
            synth.initContext();
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            synth.playClick();
        } else {
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }
        localStorage.setItem('sci_fi_audio_muted', synth.isMuted);
    });
}

// Theme Toggle removed

function initAudioTriggers() {
    const clickSelector = 'a, button, .logo-btn, .routing-btn, .close-btn, .switch-slider, .lightbox-close, .lightbox-prev, .lightbox-next, .timeline-know-me-btn';
    const transitionLinkSelector = 'a[href$=".html"]:not([target="_blank"]), a[href*=".html#"]:not([target="_blank"]), a[href^="project-"]:not([target="_blank"]), a[href^="experience-"]:not([target="_blank"])';
    
    document.addEventListener('click', (e) => {
        // Tab click handles its own whirr sound, so let's skip playing default click if it is a tab
        if (e.target.closest('.skill-tab-btn')) return;
        
        // Navigation links play whirr, so let's skip default click
        const pageLink = e.target.closest(transitionLinkSelector);
        if (pageLink) return;
        
        if (e.target.closest(clickSelector)) {
            if (typeof synth !== 'undefined') {
                synth.playClick();
            }
        }
    });

    // Intercept project or experience link clicks to play whirr sound and transition
    document.addEventListener('click', (e) => {
        const pageLink = e.target.closest(transitionLinkSelector);
        if (pageLink) {
            e.preventDefault();
            
            // Fade out page body
            document.body.classList.add('page-transitioning');
            
            if (typeof synth !== 'undefined') {
                synth.playWhirr();
            }
            
            setTimeout(() => {
                window.location.href = pageLink.href;
            }, 220);
        }
    });

    // Play scan sweep sound on hover over cards
    document.addEventListener('mouseenter', (e) => {
        if (e.target.classList && (e.target.classList.contains('card') || e.target.classList.contains('gallery-card') || e.target.classList.contains('club-card') || e.target.classList.contains('stat-card') || e.target.classList.contains('timeline-card'))) {
            if (typeof synth !== 'undefined') {
                synth.playSweep();
            }
        }
    }, true);
}

// Initialize Start
document.addEventListener('DOMContentLoaded', () => {
    renderProjects(3);
    renderBlog(2);
    initCustomCursor();
    initHeroScrollReveal();
    initSmartNav();
    init3DRobotArm();
    // initInertialScroll();
    initScrollParallax();
    initTimelineScrollObserver();
    initSkillsTabs();
    initContactRouting();
    
    // Initialize mechatronics control systems
    ensureNavControls();
    initMobileNav();
    initAudioToggle();
    initAudioTriggers();
    
    setTimeout(typeWriter, 800);
});
