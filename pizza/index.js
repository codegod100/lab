document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements with validation
    const scoreElement = document.getElementById('score');
    const ppsElement = document.getElementById('pps');
    const clickMultiplierElement = document.getElementById('click-multiplier');
    // Three.js Pizza Setup
    const pizzaContainer = document.getElementById('pizza-container-3d');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Initial aspect ratio
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    // renderer.setSize(300, 300); // Remove static size
    pizzaContainer.appendChild(renderer.domElement);

    // Set fixed renderer size
    renderer.setSize(300, 300);
    camera.aspect = 1;
    camera.updateProjectionMatrix();


    let loadedPizzaModel = null; // Variable to hold the loaded model

    // Load the GLB model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'pizza.glb', // path to the model
        function (gltf) {
            // Called when the resource is loaded
            loadedPizzaModel = gltf.scene;
            console.log('Pizza model loaded successfully:', loadedPizzaModel);

            // Scale the model up
            loadedPizzaModel.scale.set(3.0, 3.0, 3.0); // Reverted to larger scale factor

            // Tilt pizza forward to show toppings better
            loadedPizzaModel.rotation.x = 0.5; // ~30 degrees forward tilt

            // Optional: Adjust position if needed
            // loadedPizzaModel.scale.set(0.5, 0.5, 0.5);
            // loadedPizzaModel.position.y = -0.5;

            scene.add(loadedPizzaModel);
        },
        function (xhr) {
            // Called while loading is progressing
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            // Called when loading has errors
            console.error('An error happened loading the pizza model:', error);
        }
    );

    // Add brighter, warmer lighting
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1.2 ); // Increased intensity
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xfff8e7, 1.0 ); // Slightly warmer color, increased intensity
    dirLight.position.set( 5, 10, 5 ); // Changed position for more front/side angle
    dirLight.castShadow = true; // Optional: enable shadows later if needed
    scene.add( dirLight );

    // Remove the old basic ambient light if it exists
    // scene.add(new THREE.AmbientLight(0x404040)); // Keep this commented/removed

    camera.position.z = 2;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        // Rotate the loaded model if it exists
        if (loadedPizzaModel) {
            loadedPizzaModel.rotation.y += 0.01;
            // loadedPizzaModel.position.y = -0.9;
        }
        renderer.render(scene, camera);
    }
    animate();

    // Enhanced click handler with animations
    const handlePizzaClick = () => {
        // Only interact if the model is loaded
        if (!loadedPizzaModel) return;

        // Bounce effect
        // loadedPizzaModel.position.y = 0.2;
        // setTimeout(() => {
        //     if (loadedPizzaModel) loadedPizzaModel.position.y = 0;
        // }, 100);

        // Score update
        score += clickMultiplier;
        updateDisplay();

        // Scale pulse effect
        // loadedPizzaModel.scale.set(1.1, 1.1, 1.1);
        // setTimeout(() => {
        //     if (loadedPizzaModel) loadedPizzaModel.scale.set(1, 1, 1);
        // }, 200);

        // Cheese particle effect
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const particle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05, 8, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0xf39c12, // Cheese color
                        transparent: true,
                        opacity: 0.8
                    })
                );
                
                // Position particles at pizza's position
                particle.position.copy(loadedPizzaModel.position);
                particle.position.y += 0.1;
                
                // Random velocity
                particle.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.4,
                    (Math.random() - 0.5) * 0.3
                );
                
                scene.add(particle);

                // Animate and remove particle
                const animateParticle = () => {
                    if (!particle) return;
                    
                    particle.position.add(particle.velocity);
                    particle.velocity.y -= 0.02; // Gravity
                    particle.material.opacity *= 0.95; // Fade out
                    
                    if (particle.material.opacity < 0.1) {
                        scene.remove(particle);
                    } else {
                        requestAnimationFrame(animateParticle);
                    }
                };
                animateParticle();
            }, i * 50); // Stagger particles
        }
    };
    const upgradeClick = document.getElementById('upgrade-click');
    const upgradeOven = document.getElementById('upgrade-oven');
    const upgradeDelivery = document.getElementById('upgrade-delivery');

    console.log('DOM elements:', {
        scoreElement,
        ppsElement,
        clickMultiplierElement,
        pizzaContainer, // Changed from pizza
        upgradeClick,
        upgradeOven,
        upgradeDelivery
    });

    let score = 0.0;
    let pps = 0.0;
    let clickMultiplier = 1.0;
    let clickUpgradeCost = 25;
    let ovenUpgradeCost = 10;
    let deliveryUpgradeCost = 50;
    let ovenBonus = 0.1; // PPS bonus per oven level

    // Update display values and button states
    const updateDisplay = () => {
        scoreElement.textContent = score.toFixed(1);
        ppsElement.textContent = pps.toFixed(1);
        clickMultiplierElement.textContent = clickMultiplier.toFixed(1);
        
        // Update button states
        upgradeClick.disabled = score < clickUpgradeCost;
        upgradeOven.disabled = score < ovenUpgradeCost;
        upgradeDelivery.disabled = score < deliveryUpgradeCost;
        
        // Update button texts
        upgradeClick.textContent = `Upgrade Click (Cost: ${clickUpgradeCost})`;
        upgradeOven.textContent = `Upgrade Oven (Cost: ${ovenUpgradeCost})`;
        upgradeDelivery.textContent = `Hire Delivery (Cost: ${deliveryUpgradeCost})`;
    };

    // Upgrade functions
    const buyClickBoost = () => {
        console.log('Click boost button clicked');
        if (score >= clickUpgradeCost) {
            score -= clickUpgradeCost;
            clickMultiplier += 0.5;
            clickUpgradeCost = Math.round(clickUpgradeCost * 1.5);
            updateDisplay();
            console.log('Click boost purchased');
        } else {
            console.log('Not enough points for click boost');
        }
    };

    const upgradeOvenFn = () => {
        console.log('Oven upgrade button clicked');
        if (score >= ovenUpgradeCost) {
            score -= ovenUpgradeCost;
            pps += ovenBonus;
            ovenUpgradeCost = Math.round(ovenUpgradeCost * 2);
            ovenBonus *= 1.2;
            updateDisplay();
            console.log('Oven upgraded');
        } else {
            console.log('Not enough points for oven upgrade');
        }
    };

    const hireDelivery = () => {
        console.log('Delivery button clicked');
        if (score >= deliveryUpgradeCost) {
            score -= deliveryUpgradeCost;
            pps += 5.0;
            deliveryUpgradeCost *= 2;
            updateDisplay();
            console.log('Delivery hired');
        } else {
            console.log('Not enough points to hire delivery');
        }
    };

    // PPS interval
    const ppsInterval = setInterval(() => {
        score += pps;
        updateDisplay();
    }, 1000);

    // Event listeners - add error handling
    try {
        renderer.domElement.addEventListener('click', handlePizzaClick);
        upgradeClick.addEventListener('click', buyClickBoost);
        upgradeOven.addEventListener('click', upgradeOvenFn);
        upgradeDelivery.addEventListener('click', hireDelivery);
        console.log('All event listeners attached successfully');
    } catch (error) {
        console.error('Error attaching event listeners:', error);
    }

    // Initial display setup
    updateDisplay();
});