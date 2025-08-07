import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0f7ff); 

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, 2, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
const canvasContainer = document.getElementById('canvasContainer');
canvasContainer.appendChild(renderer.domElement);

//cubes
const modules = [];
let selectedModuleIndex = 0;

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 10, 7); 
sunLight.castShadow = true;
scene.add(sunLight);

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);


// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

//sliders
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const depthSlider = document.getElementById('depthSlider');

//slider values
const widthSliderValueContainer = document.getElementById('widthSliderValueContainer');
const heightSliderValueContainer = document.getElementById('heightSliderValueContainer');
const depthSliderValueContainer = document.getElementById('depthSliderValueContainer');

//listeners
widthSlider.addEventListener('input', () => {
  updateCubeGeometry();
  checkForAdditionalCube();
  widthSliderValueContainer.textContent = `${widthSlider.value} cm`;
});
heightSlider.addEventListener('input', () => {
  updateCubeGeometry();
  heightSliderValueContainer.textContent = `${heightSlider.value} cm`;
});
depthSlider.addEventListener('input', () => {
  updateCubeGeometry();
  depthSliderValueContainer.textContent = `${depthSlider.value} cm`;
});

//fonksiyonlar
/** 
 * is called to create new modul for initial module and width related changes
*/
function createModule(width, height, depth) {
  const color = Math.random() * 0xffffff;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshPhongMaterial({
    color,
    shininess: 60,
    specular: 0x222222
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  return { width, height, depth, mesh, originalColor: color };
}

/**
 * is called with every slider change,
 * no scaling creates and sets the new geometry
*/
function updateCubeGeometry() {
  const selected = modules[selectedModuleIndex]; 
  if (!selected) return;

  selected.width = Math.min(parseInt(widthSlider.value), 60) / 100;
  selected.height = parseInt(heightSlider.value) / 100;
  selected.depth = parseInt(depthSlider.value) / 100;

  const newGeometry = new THREE.BoxGeometry(selected.width, selected.height, selected.depth );
  selected.mesh.geometry.dispose();
  selected.mesh.geometry = newGeometry;
  renderModules();
}

/**sets modules in array in correct positions
 * (right next to eachother and the same dimentions) 
*/
function renderModules() {
  let xOffset = 0;
  modules.forEach((mod) => {
    mod.mesh.position.set(xOffset + mod.width / 2, mod.height / 2, mod.depth / 2);
    xOffset += mod.width;

    if (!scene.children.includes(mod.mesh)) {
      scene.add(mod.mesh);
    }
  });
}
/**
 * when selected module changes it adjusts the sliders to the selected modules dimentions
 */
function updateSlidersFromSelectedModule() {
  const selected = modules[selectedModuleIndex];
  if (parseInt(widthSlider.value) !== selected.width * 100)
    widthSlider.value = selected.width * 100;
  if (parseInt(heightSlider.value) !== selected.height * 100)
    heightSlider.value = selected.height * 100;
  if (parseInt(depthSlider.value) !== selected.depth * 100)
    depthSlider.value = selected.depth * 100;

  widthSliderValueContainer.textContent = `${widthSlider.value} cm`;
  heightSliderValueContainer.textContent = `${heightSlider.value} cm`;
  depthSliderValueContainer.textContent = `${depthSlider.value} cm`;
}

/**checks if the selected module is on the end(middle ones dont trigger another module creation. each module can trigger 1 module) and widht is above 60
 * with right conditions another cube is added with same dimentions as the originator(width is fixed to 60 cm) 
 */
function checkForAdditionalCube() {
  const selected = modules[selectedModuleIndex];
  if (!selected) return;

  const isLast = selectedModuleIndex === modules.length - 1;
  const widthExceeds =  parseInt(widthSlider.value) > 60;

  if (isLast && widthExceeds) {
    const height = parseInt(heightSlider.value) / 100;
    const depth = parseInt(depthSlider.value) / 100;

    const newModule = createModule(0.6, height, depth); 
    modules.push(newModule);
    selected.width = 0.6; 
  }
  renderModules();
}

/**
 * 
 * gets the selected modules, updates the selectedModuleIndex, changes the color of the selected module to orange, the unselected to a random color
 * calls the method to update the sliders
 */
function onModuleClick(intersects) {
  const clickedMesh = intersects[0].object;
  const index = modules.findIndex(m => m.mesh === clickedMesh);
  if (index !== -1) {
    selectedModuleIndex = index;
    modules.forEach((mod, i) => {
      mod.mesh.material.color.set(i === index ? 0xff9900 : mod.originalColor);
    });
    updateSlidersFromSelectedModule();
    renderModules();
  }
}

/**
 * sends a ray from camera to mouse position if it h,ts a mesh, a module is clicked
 * calls onClick function for selected mesh or module
 */
function setupRaycasterClick() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const meshes = modules.map(m => m.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      onModuleClick(intersects);
    }
  });
}

//initial setup
modules.push(createModule(0.6, 0.6, 0.6));
scene.add(modules[0].mesh);
renderModules();
updateSlidersFromSelectedModule();
setupRaycasterClick();

function animate() {
  requestAnimationFrame(animate);
  controls.update(); 
  renderer.render(scene, camera);
}
animate();
