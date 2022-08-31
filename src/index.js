import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";
import airportHistory from "./files/my-airports.json";
var renderer, camera, scene, controls;
var Globe;
var canvasParams = {
  width: 0,
  height: 0
}

init();
initGlobe();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  const canvas = document.querySelector('#canvas-wrapper canvas');
  if (!canvas){
    console.error('Canvas was not found');
    return
  }
  canvasParams.width = canvas.offsetWidth;
  canvasParams.height = canvas.offsetHeight;

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, 0.3));

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = canvasParams.width / canvasParams.height;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight(0x8566cc, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog(0x535ef3, 400, 2000);

  // Initialize controls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0;
  controls.autoRotate = true;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  // Initialize renderer
  renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasParams.width, canvasParams.height);
  renderer.setClearColor( 0x000000, 0 );

  window.addEventListener("resize", onWindowResize, false);
}

// SECTION Globe
function initGlobe() {
  // Initialize the Globe
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    // .atmosphereColor("#3a228a") //Атмосфера вокруг Земли
    .atmosphereAltitude(0.25)
    .hexPolygonColor((e) => {
      if (
        ["KGZ", "KOR", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
          e.properties.ISO_A3
        )
      ) {
        return "rgba(60, 81, 124, 1)";      //Цвет точек
      } else return "rgba(60, 81, 124, 1)"; //Цвет точек
    });

  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe.arcsData(travelHistory.flights)
      .arcColor((e) => {
        return e.status ? "#9cff00" : "#FF4000";
      })
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap((e) => e.order * 1)
      .labelsData(airportHistory.airports)
      .labelColor(() => "#ffcb21")
      .labelDotOrientation((e) => {
        return e.text === "ALA" ? "top" : "right";
      })
      .labelDotRadius(0.3)
      .labelSize((e) => e.size)
      .labelText("city")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData(airportHistory.airports)
      .pointColor(() => "#ffffff")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, 1000);

  Globe.rotateY(-Math.PI * (5 / 9));
  Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color(0x233662); //Цвет фона планеты
  globeMaterial.emissive = new Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(Globe);
}

function onWindowResize() {
  const wrapper = document.querySelector('#canvas-wrapper');

  canvasParams.width = wrapper.offsetWidth;
  canvasParams.height = wrapper.offsetHeight;
  camera.aspect = canvasParams.width / canvasParams.height;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasParams.width, canvasParams.height);
}

function animate() {
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
