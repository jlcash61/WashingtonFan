document.addEventListener('DOMContentLoaded', async () => {
    const cheerButton = document.getElementById('cheerButton');
    const message = document.getElementById('message');
    const scoreDisplay = document.getElementById('score');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');

    // Audio setup
    const cheerAudio = new Audio('httr_cut.mp3');

    let confettiParticles = [];
    const colors = ['#ffb612', '#e31837', '#ffffff'];
    let countdownInterval;

    // Adjust canvas size
    const resizeCanvas = () => {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // API function to fetch KC Chiefs game score
    const fetchChiefsGameScore = async () => {
        const url = 'https://us-central1-footballdata-2024.cloudfunctions.net/getNflSchedule';

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Find the latest KC Chiefs game
            const chiefsGame = data.events.find(event =>
                event.competitions[0].competitors.some(team => team.team.displayName === "Washington Commanders")
            );

            if (chiefsGame) {
                const competitors = chiefsGame.competitions[0].competitors;
                const homeTeam = competitors.find(team => team.homeAway === 'home').team.displayName;
                const awayTeam = competitors.find(team => team.homeAway === 'away').team.displayName;
                const homeScore = competitors.find(team => team.homeAway === 'home').score;
                const awayScore = competitors.find(team => team.homeAway === 'away').score;

                return `${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`;
            } else {
                return "No recent Kansas City Chiefs game found.";
            }
        } catch (error) {
            console.error('Error fetching RedSkins game score:', error);
            return "Error fetching game data.";
        }
    };

    // Fetch and display the score on app load
    const initializeScore = async () => {
        const gameScore = await fetchChiefsGameScore();
        scoreDisplay.textContent = gameScore; // Display the fetched score
    };

    // Initialize score display when the app loads
    initializeScore();

    // Cheer button click event
    cheerButton.addEventListener('click', () => {
        const duration = Math.floor(cheerAudio.duration); // Get the audio duration

        startCountdown(duration);
        createConfetti();
        cheerAudio.play();

        cheerAudio.onended = () => {
            // Reset confetti after audio finishes
            clearInterval(countdownInterval);
            message.textContent = "Cheer finished!";
            confettiParticles = [];
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        };
    });

    // Start the countdown timer
    const startCountdown = (duration) => {
        let remainingTime = duration;

        message.textContent = `Cheering! ${remainingTime}s left`;

        // Clear any existing interval
        clearInterval(countdownInterval);

        // Update the timer every second
        countdownInterval = setInterval(() => {
            remainingTime -= 1;
            if (remainingTime > 0) {
                message.textContent = `Cheering! ${remainingTime}s left`;
            } else {
                clearInterval(countdownInterval);
                message.textContent = "Cheer finished!";
            }
        }, 1000);
    };

    // Create confetti particles
    const createConfetti = () => {
        confettiParticles = [];
        for (let i = 0; i < 100; i++) {
            confettiParticles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                size: Math.random() * 5 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: Math.random() * 5 + 2,
            });
        }
        animateConfetti();
    };

    // Animate confetti
    const animateConfetti = () => {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiParticles.forEach((particle) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;

            if (particle.y > confettiCanvas.height) {
                particle.y = 0;
                particle.x = Math.random() * confettiCanvas.width;
            }

            confettiCtx.beginPath();
            confettiCtx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            confettiCtx.fillStyle = particle.color;
            confettiCtx.fill();
        });

        if (confettiParticles.length > 0) {
            requestAnimationFrame(animateConfetti);
        }
    };
});
