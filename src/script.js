import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import hammer from 'models/hammer.gltf'
import {DragControls} from "three/examples/jsm/controls/DragControls.js"




// Global Variabiles

const speed = 0.01;
let direction = "down";
/**
 * Debug
 */

const gui = new dat.GUI()

const parameters = {
    materialColor: ''
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() =>
    {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// Objects
const objectsDistance = 4;

let mesh1, sectionMeshes;
const gltfLoader = new GLTFLoader();

gltfLoader.load(hammer, (obj) => {

 mesh1 = obj.scene.children[0].clone();
 mesh1.position.x = 2;
 mesh1.position.y = 0;
 mesh1.rotation.set(Math.PI/2,0,-0.3);
 mesh1.material.color.set(0xffffff);
 scene.add(mesh1);
 sectionMeshes = [ mesh1 ];
 mesh1.scale.set(30,30,30);
 
// const controls = new DragControls( [mesh1], camera, renderer.domElement );

})


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(-1, 1, 0)
scene.add(directionalLight)

const pointlight = new THREE.PointLight( "#ffffff", 2)
pointlight.position.set(0,0,5);
scene.add(pointlight);
/**
 * Particles
 */
// Geometry
const particlesCount = 2300;
const positions = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * 1
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: textureLoader,
    size: 0.03
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Scroll
 */
let scrollY = window.scrollY


window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
})
//     const newSection = Math.round(scrollY / sizes.height)

//     if(newSection != currentSection)
//     {
//         currentSection = newSection

//         gsap.to(
//             sectionMeshes[currentSection].rotation,
//             {
//                 duration: 1.5,
//                 ease: 'power2.inOut',
//                 x: '+=6',
//                 y: '+=3',
//                 z: '+=1.5'
//             }
//         )
//     }
// })

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    if(sectionMeshes){
    // Animate meshes
    

    for(const mesh of sectionMeshes)
    {
        if(mesh.rotation.y <= Math.PI/3 && direction === "down")
        mesh.rotation.y += speed;
        else if(mesh.rotation.y > Math.PI/3 && direction === "down")
        {
        direction = "up";
        mesh.rotation.y -= speed;
        }
        else if(mesh.rotation.y <= Math.PI/3 && mesh.rotation.y > 0 && direction === "up")
        mesh.rotation.y -= speed;
        else if(mesh.rotation.y <= 0 && direction === "up")
        {
         direction = "down";
         mesh.rotation.y += speed;
        }
    }
}

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick();