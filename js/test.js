// Импортируем Three.js и необходимые модули
import * as THREE from 'three';

// Загружаем необходимые классы из examples/jsm/
import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { Site3dThree } from './site3d_dev.js';

// Создаем сцену, рендерер и другие необходимые объекты
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Устанавливаем серый фон
const backgroundColor = 0x707080; // Серый цвет в формате HEX
renderer.setClearColor(backgroundColor);

document.body.appendChild(renderer.domElement);

// Добавляем освещение
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(0, 0, 1).normalize();
directionalLight2.position.set(0, 0, 1).normalize();
scene.add(directionalLight, directionalLight2);

// Настройки OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.set(0, 0, 100);

// Загружаем модель с помощью GLTFLoader
const loader = new GLTFLoader();

// Создаем экземпляр класса Site3dThree
const site3d = new Site3dThree();

loader.load('./model.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Применяем метод object3dToBoundCenter к модели
    site3d.object3dToBoundCenter(model);

    // Отображаем Bounding Box'ы вокруг всех мешей модели (если нужно)
    const meshes = site3d.getObject3dMeshes(model);
    meshes.forEach(mesh => {
        const box = new THREE.BoxHelper(mesh, 0xffff00);
        scene.add(box);
    });

    animate(); // Запускаем анимацию после загрузки модели
}, undefined, (error) => {
    console.error("An error occurred", error);
});

// Настройки камеры
camera.position.set(0, 2, 5);

// Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // обновление контроллеров
    renderer.render(scene, camera);
}

// Адаптация к размеру окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
