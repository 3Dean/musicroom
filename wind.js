

   // For flower animation
   const flowerParts = [];
   const windSettings = {
     strength: 0.1, // How much the flowers move
     speed: 1.5, // How fast the wind blows
     chaos: 0.2, // Randomness in the wind
     maxAngle: 0.15, // Maximum angle in radians
   };

  
           // Special handling for flowers to enable wind animation
           else if (modelInfo.name === "flowers") {
             // Process standard model materials
             model.traverse(function (node) {
               if (node.isMesh) {
                 node.castShadow = true;
                 node.receiveShadow = true;

                 // Store original positions and rotations for the animation
                 node.userData.originalPosition = node.position.clone();
                 node.userData.originalRotation = node.rotation.clone();

                 // Add some randomness to make the animation more natural
                 node.userData.windOffset = Math.random() * Math.PI * 2;
                 node.userData.windFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2

                 // Add to flowerParts array for animation
                 flowerParts.push(node);

                 // Enhance materials to work with environment lighting
                 if (node.material) {
                   if (node.material.isMeshStandardMaterial) {
                     node.material.envMapIntensity = 0.7;
                     node.material.roughness = Math.max(
                       0.2,
                       node.material.roughness
                     );
                     node.material.metalness = Math.min(
                       0.8,
                       node.material.metalness
                     );
                   } else if (Array.isArray(node.material)) {
                     node.material.forEach((material) => {
                       if (material.isMeshStandardMaterial) {
                         material.envMapIntensity = 0.7;
                         material.roughness = Math.max(
                           0.2,
                           material.roughness
                         );
                         material.metalness = Math.min(
                           0.8,
                           material.metalness
                         );
                       }
                     });
                   }
                 }
               }
             });

             console.log(
               `Found ${flowerParts.length} meshes for flower animation`
             );
           } else {
             // Process standard model materials
             model.traverse(function (node) {
               if (node.isMesh) {
                 node.castShadow = true;
                 node.receiveShadow = true;

                 // Enhance materials to work with environment lighting
                 if (node.material) {
                   if (node.material.isMeshStandardMaterial) {
                     node.material.envMapIntensity = 0.7;
                     node.material.roughness = Math.max(
                       0.2,
                       node.material.roughness
                     );
                     node.material.metalness = Math.min(
                       0.8,
                       node.material.metalness
                     );
                   } else if (Array.isArray(node.material)) {
                     node.material.forEach((material) => {
                       if (material.isMeshStandardMaterial) {
                         material.envMapIntensity = 0.7;
                         material.roughness = Math.max(
                           0.2,
                           material.roughness
                         );
                         material.metalness = Math.min(
                           0.8,
                           material.metalness
                         );
                       }
                     });
                   }
                 }
               }
             });
           }

           // Store model in our models object for later access
           models[modelInfo.name] = model;

           // Add model to scene
           scene.add(model);

           console.log(`Model "${modelInfo.name}" loaded`);

           
   // Animate flowers to simulate wind blowing through them
   function animateFlowers(time) {
     // Skip if no flower parts to animate
     if (!flowerParts.length) return;

     // Animate each flower part
     flowerParts.forEach((flowerPart) => {
       // Skip if no userData is available
       if (!flowerPart.userData.originalRotation) return;

       // Calculate wind effect
       const windTime = time * windSettings.speed * 0.001;
       const windOffset = flowerPart.userData.windOffset || 0;
       const windFactor = flowerPart.userData.windFactor || 1;

       // Create a sine wave motion for natural swaying
       const windAmount =
         Math.sin(windTime + windOffset) *
         windSettings.strength *
         windFactor;

       // Add some chaos for more natural movement
       const chaosX =
         Math.sin(windTime * 1.3 + windOffset * 2) *
         windSettings.chaos *
         windFactor;
       const chaosZ =
         Math.cos(windTime * 0.7 + windOffset * 3) *
         windSettings.chaos *
         windFactor;

       // Apply rotation (clamped to maximum angle)
       const xAngle = Math.max(
         -windSettings.maxAngle,
         Math.min(windSettings.maxAngle, windAmount + chaosX)
       );
       const zAngle = Math.max(
         -windSettings.maxAngle,
         Math.min(windSettings.maxAngle, windAmount * 0.5 + chaosZ)
       );

       // Apply to model - add wind rotation to original rotation
       flowerPart.rotation.x =
         flowerPart.userData.originalRotation.x + xAngle;
       flowerPart.rotation.z =
         flowerPart.userData.originalRotation.z + zAngle;

       // Optional: slight position sway for added realism
       if (flowerPart.userData.originalPosition) {
         flowerPart.position.x =
           flowerPart.userData.originalPosition.x + chaosX * 0.02;
         flowerPart.position.z =
           flowerPart.userData.originalPosition.z + chaosZ * 0.02;
       }
     });
   }

   // Animation loop
   function animate(time) {
     requestAnimationFrame(animate);

     // Update player movement
     updatePlayerMovement();

     // Animate flowers if we have any
     animateFlowers(time);

     // Render
     renderer.render(scene, camera);
   }
    animate(0); // Start the animation loop